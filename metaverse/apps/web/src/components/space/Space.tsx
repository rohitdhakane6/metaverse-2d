import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Game } from "phaser";
import { GameConfig } from "@/game/config";
import Menu from "@/components/space/Menu";
import { useTypedSelector } from "@/hooks/useTypedSelector";

import { io } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { SFURoomClient, MediaType, RoomEvents } from "@/lib/sfuRoomClient";
import Bootstrap from "@/game/scenes/Bootstrap";

interface SpaceProps {
  userName: string;
  avatar: string;
}

const Space = ({ userName, avatar }: SpaceProps) => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const isGameInFocus = useTypedSelector((state) => state.arena.isGameInFocus);
  const isCameraEnabled = useTypedSelector(
    (state) => state.mediaDevices.enabled.camera
  );
  const isMicrophoneEnabled = useTypedSelector(
    (state) => state.mediaDevices.enabled.microphone
  );
  const isScreenShareEnabled = useTypedSelector(
    (state) => state.mediaDevices.enabled.screen
  );

  const gameInstanceRef = useRef<Game | null>(null);
  const localMediaRef = useRef<HTMLDivElement>(null);
  const remoteMediaRef = useRef<HTMLDivElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const [loadingGame, setLoadingGame] = useState(true);
  const [roomClient, setRoomClient] = useState<SFURoomClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const roomId = "room1"; // Could be dynamic or based on spaceId
  const socketUrl = "http://localhost:3016";

  // Phaser Game setup with user info and loading state
  useEffect(() => {
    const game = new Game(GameConfig);
    gameInstanceRef.current = game;

    game.events.once("ready", () => {
      const boot = game.scene.keys.bootstrap as Bootstrap;
      if (boot) {
        // Assuming your Bootstrap scene has this event and method
        boot.events.once("loadingComplete", () => {
          setLoadingGame(false);

          boot.launchGame(userName, avatar);
        });
      }
    });

    localStorage.setItem("spaceId", spaceId ?? "");

    return () => {
      game.destroy(true);
      localStorage.removeItem("spaceId");
    };
  }, [spaceId, userName, avatar]);

  // Enable or disable game input based on isGameInFocus
  useEffect(() => {
    if (gameInstanceRef.current) {
      if (gameInstanceRef.current.input.keyboard)
        gameInstanceRef.current.input.keyboard.enabled = isGameInFocus;
      if (gameInstanceRef.current.input.mouse)
        gameInstanceRef.current.input.mouse.enabled = isGameInFocus;
    }
  }, [isGameInFocus]);

  // Setup socket.io and mediasoup SFU client
  useEffect(() => {
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    return () => {
      socket.disconnect();
      roomClient?.exit();
    };
  }, []);

  useEffect(() => {
    if (
      isConnected &&
      localMediaRef.current &&
      remoteMediaRef.current &&
      remoteAudioRef.current
    ) {
      const client = new SFURoomClient({
        localMediaRef,
        remoteMediaRef,
        remoteAudioEl: remoteAudioRef,
        mediasoupClient,
        socket: io(socketUrl), // fresh socket or reuse?
        roomId,
        name: userName,
        successCallback: () => {
          console.log("Room client initialized successfully");
        },
      });

      setRoomClient(client);

      return () => {
        client.exit();
      };
    }
  }, [isConnected, userName]);

  // SFU event listeners
  useEffect(() => {
    if (!roomClient) return;

    const onStartAudio = () => {
      console.log("Audio started");
    };

    roomClient.on(RoomEvents.StartAudio, onStartAudio);
  }, [roomClient]);

  // Manage media producers based on redux state
  useEffect(() => {
    if (!roomClient) return;

    if (isCameraEnabled) roomClient.produce(MediaType.Video);
    else roomClient.closeProducer(MediaType.Video);

    if (isMicrophoneEnabled) roomClient.produce(MediaType.Audio);
    else roomClient.closeProducer(MediaType.Audio);

    if (isScreenShareEnabled) roomClient.produce(MediaType.Screen);
    else roomClient.closeProducer(MediaType.Screen);
  }, [roomClient, isCameraEnabled, isMicrophoneEnabled, isScreenShareEnabled]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Game Canvas Layer */}
      <div className="fixed inset-0 -z-10" id="game-container" />

      {/* Loading Overlay */}
      {loadingGame && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="loader">Loading...</div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 bg-background text-foreground shadow z-10">
        <h1 className="text-xl font-bold">Space Adventure + Media</h1>
      </header>

      {/* Media Panel */}
      <div className="absolute top-20 right-4 z-20 bg-background/80 backdrop-blur-md rounded-xl p-3 shadow max-h-[80vh] w-[300px] overflow-y-auto">
        <h3 className="text-sm font-semibold text-center mb-2">Participants</h3>
        <div ref={localMediaRef} className="mb-4 space-y-2">
          <p className="text-xs text-muted-foreground">Local Media</p>
        </div>
        <div ref={remoteMediaRef} className="space-y-2">
          <p className="text-xs text-muted-foreground">Remote Media</p>
        </div>
        <audio ref={remoteAudioRef} className="hidden" controls />
      </div>

      {/* Footer/Menu */}
      <div className="absolute bottom-0 w-full z-10">
        <Menu />
      </div>
    </div>
  );
};

export default Space;

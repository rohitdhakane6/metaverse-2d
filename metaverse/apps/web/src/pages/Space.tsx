import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Game } from "phaser";
import { GameConfig } from "@/game/config";
import { Card } from "@/components/ui/card";
import Menu from "@/components/space/Menu";
import { useTypedSelector } from "@/hooks/useTypedSelector";

import { io } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { SFURoomClient, MediaType, RoomEvents } from "@/lib/sfuRoomClient";
import { Button } from "@/components/ui/button";

const Space = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const isGameInFocus = useTypedSelector((state) => state.arena.isGameInFocus);

  const gameInstanceRef = useRef<Game | null>(null);
  const localMediaRef = useRef<HTMLDivElement>(null);
  const remoteMediaRef = useRef<HTMLDivElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const [roomClient, setRoomClient] = useState<SFURoomClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const roomId = "room1";
  const userName = "user1" + Math.floor(Math.random() * 1000);
  const socketUrl = "http://localhost:3016";

  // Game setup
  useEffect(() => {
    gameInstanceRef.current = new Game(GameConfig);
    localStorage.setItem("spaceId", spaceId!);

    return () => {
      gameInstanceRef.current?.destroy(true);
      localStorage.removeItem("spaceId");
    };
  }, [spaceId]);

  useEffect(() => {
    if (gameInstanceRef.current?.input.keyboard) {
      gameInstanceRef.current.input.keyboard.enabled = isGameInFocus;
    }
    if (gameInstanceRef.current?.input.mouse) {
      gameInstanceRef.current.input.mouse.enabled = isGameInFocus;
    }
  }, [isGameInFocus]);

  // SFU setup
  useEffect(() => {
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

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
        socket,
        roomId,
        name: userName,
        successCallback: () => {
          console.log("Room client initialized successfully");
        },
      });

      setRoomClient(client);
    }

    return () => {
      socket.disconnect();
      roomClient?.exit();
    };
  }, [isConnected]);

  roomClient?.on(RoomEvents.StartAudio, () => {
    console.log("Audio started");
  });

  // Handlers
  const handleStartVideo = () => roomClient?.produce(MediaType.Video);
  const handleStopVideo = () => roomClient?.closeProducer(MediaType.Video);
  const handleStartAudio = () => roomClient?.produce(MediaType.Audio);
  const handleStopAudio = () => roomClient?.closeProducer(MediaType.Audio);
  const handleStartScreenShare = () => roomClient?.produce(MediaType.Screen);
  const handleStopScreenShare = () => roomClient?.closeProducer(MediaType.Screen);

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="p-4 bg-background text-foreground shadow z-10">
        <h1 className="text-xl font-bold">Space Adventure + Media</h1>
      </header>

      {/* Main Game Area */}
      <main className="flex-grow bg-muted relative">
        <Card className="h-full w-full">
          <div id="game-container" className="w-full h-full" />
        </Card>

        {/* Floating SFU Controls */}
        <div className="absolute bottom-4 left-4 z-20 bg-background/80 backdrop-blur-md rounded-xl p-4 shadow-lg space-y-2">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button size="sm" onClick={handleStartVideo}>🎥 Start Video</Button>
            <Button size="sm" onClick={handleStopVideo}>⛔ Stop Video</Button>
            <Button size="sm" onClick={handleStartAudio}>🎙 Start Audio</Button>
            <Button size="sm" onClick={handleStopAudio}>🔇 Stop Audio</Button>
            <Button size="sm" onClick={handleStartScreenShare}>🖥 Share Screen</Button>
            <Button size="sm" onClick={handleStopScreenShare}>🛑 Stop Screen</Button>
          </div>
        </div>

        {/* Local/Remote Media Grid */}
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
      </main>

      {/* Menu Footer */}
      <Menu />
    </div>
  );
};

export default Space;

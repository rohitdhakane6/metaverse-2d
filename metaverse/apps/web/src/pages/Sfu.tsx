import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { SFURoomClient, MediaType, RoomEvents } from "@/lib/sfuRoomClient";
import { Button } from "@/components/ui/button";

export const Sfu = () => {
  const roomId = "room1";
  const userName = "user1" + Math.floor(Math.random() * 1000);
  const socketUrl = "http://localhost:3016";
  const [roomClient, setRoomClient] = useState<SFURoomClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const localMediaRef = useRef<HTMLDivElement>(null);
  const remoteMediaRef = useRef<HTMLDivElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Establish socket connection
    const socket = io(socketUrl);

    // Handle socket connection
    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    // Create room client when socket is connected and refs are available
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

    // Cleanup
    return () => {
      socket.disconnect();
      roomClient?.exit();
    };
  }, [isConnected]);

  roomClient?.on(RoomEvents.StartAudio, () => {
    console.log("Audio started");
  });

  const handleStartVideo = () => {
    roomClient?.produce(MediaType.Video);
  };

  const handleStopVideo = () => {
    roomClient?.closeProducer(MediaType.Video);
  };

  const handleStartAudio = () => {
    roomClient?.produce(MediaType.Audio);
  };

  const handleStopAudio = () => {
    roomClient?.closeProducer(MediaType.Audio);
  };

  const handleStartScreenShare = () => {
    roomClient?.produce(MediaType.Screen);
  };
  const handleStopScreenShare = () => {
    roomClient?.closeProducer(MediaType.Screen);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-4">
      <div className="flex gap-4 items-center justify-center mb-4">
        <Button onClick={handleStartVideo}>Start Video</Button>
        <Button onClick={handleStopVideo}>Stop Video</Button>
        <Button onClick={handleStartAudio}>Start Audio</Button>
        <Button onClick={handleStopAudio}>Stop Audio</Button>
        <Button onClick={handleStartScreenShare}>Share Screen</Button>
        <Button onClick={handleStopScreenShare}>Stop Screen Share</Button>
      </div>

      <div className="flex flex-col gap-4 items-center justify-center">
        {/* Local Media Section */}
        <div className="w-full">
          <h3 className="text-center mb-4">Local Media</h3>
          <div
            ref={localMediaRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Local media streams will be appended here as video elements */}
          </div>
        </div>

        {/* Remote Media Section */}
        <div className="w-full">
          <h3 className="text-center mb-4">Remote Media</h3>
          <div
            ref={remoteMediaRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Remote media streams will be appended here as video elements */}
          </div>
        </div>

        {/* Remote Audio Section */}
        <audio
          ref={remoteAudioRef}
          className="hidden"
          aria-label="Remote Audio Streams"
          controls
        >
          <h3>Remote Audio</h3>
        </audio>
      </div>
    </div>
  );
};

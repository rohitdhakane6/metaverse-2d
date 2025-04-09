import { useState } from "react";
import { Maximize, Minimize, ThumbsDown, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoTileProps {
  participantName: string;
  isPinned?: boolean;
}

export default function VideoTile({ participantName, isPinned = false }: VideoTileProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pinned, setPinned] = useState(isPinned);

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);
  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const togglePin = () => setPinned(!pinned);

  return (
    <div
      className={`relative rounded-md shadow-lg ${
        isFullScreen ? "fixed inset-0 z-50" : isMinimized ? "w-24 h-24" : "w-full h-full"
      } transition-all duration-300 bg-background`}
    >
      {/* Video Placeholder */}
      <div className="flex items-center justify-center h-full w-full bg-gray-300 rounded-md">
        <Video className="w-12 h-12 text-gray-500" />
      </div>

      {/* Participant Name */}
      <div className="absolute top-2 left-2">
        <span className="text-sm font-medium text-foreground">{participantName}</span>
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 right-2 flex space-x-2">
        <Button size="icon" variant="ghost" onClick={togglePin}>
          <ThumbsDown className={pinned ? "text-blue-500" : "text-muted-foreground"} />
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleFullScreen}>
          {isFullScreen ? <Minimize className="text-muted-foreground" /> : <Maximize className="text-muted-foreground" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleMinimize}>
          {isMinimized ? <Maximize className="text-muted-foreground" /> : <Minimize className="text-muted-foreground" />}
        </Button>
      </div>
    </div>
  );
}

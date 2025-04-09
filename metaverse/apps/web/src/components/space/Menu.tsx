import { useEffect, useRef } from "react";
import { Messages } from "@/components/space/Messages";
import MicToggle from "@/components/space/ToggelMic";
import VideoToggle from "@/components/space/ToggelCamera";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { Users, LogOut, Edit3 } from "lucide-react";

export default function Toolbar() {
  const videoRef = useRef<HTMLVideoElement>(null);


  const stream = useTypedSelector((state) => state.mediaDevices.activeStream);
  const isVideoEnabled = useTypedSelector(
    (state) => state.mediaDevices.isVideoEnabled
  );

  useEffect(() => {
    if (videoRef.current && stream && isVideoEnabled) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .catch((err) => console.error("Video play error:", err));
    }
  }, [stream, isVideoEnabled]);

  return (
    <div className="flex items-center justify-between py-2 px-4 bg-background rounded-md shadow-lg">
      {/* Left Section - Profile */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          {isVideoEnabled && stream ? (
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-12 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-12 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
              <span className="font-light">Rohit</span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-light text-foreground">
            Rohit Dhakane 😴
          </span>
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Profile</TooltipContent>
        </Tooltip>
      </div>

      {/* Center - Toggles */}
      <div className="flex items-center space-x-3">
        <VideoToggle />
        <MicToggle />
      </div>

      {/* Right Section - Actions */}
      <div className="flex space-x-3">
        <Messages />

        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" size="icon">
              <Users />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Participants</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" size="icon">
              <LogOut />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Leave</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

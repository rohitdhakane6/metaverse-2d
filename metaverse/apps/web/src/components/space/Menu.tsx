import { Messages } from "@/components/space/Messages";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Mic, MicOff, Video, VideoOff, MessageCircle, Users, LogOut, Edit3 } from "lucide-react";

export default function Toolbar() {
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-background rounded-md shadow-lg">
      {/* Left Section - Profile */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          {/* <img
            src="/path-to-avatar.jpg"
            alt="Profile Avatar"
            className="h-10 w-10 rounded-full"
          /> */}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-light text-foreground">Rohit Dhakane 😴</span>
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Edit3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Profile</TooltipContent>
        </Tooltip>
      </div>

      {/* Center Section - Video/Audio Controls */}
      <div className="flex space-x-3">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" size="icon">
              <Mic />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mute</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" size="icon">
              <Video />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Turn off Camera</TooltipContent>
        </Tooltip>
      </div>

      {/* Right Section - Other Controls */}
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

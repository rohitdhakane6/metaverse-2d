import { MoreVertical, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpaceCardProps {
  title: string;
  image: string;
  activeUsers?: number;
  className?: string;
}

export function SpaceCard({
  title,
  image,
  activeUsers = 0,
  className,
}: SpaceCardProps) {
  return (
    <div className={cn("group", className)}>
      <a href={`/space/${title}`}>
      <div className="relative cursor-pointer ">
        <div className="aspect-video rounded-lg overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />

          {/* Progress bar overlay at the bottom of the image */}
          {/* <div className="absolute bottom-0 left-0 right-0 h-1">
            <div className="h-full bg-black/30">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min((activeUsers / 20) * 100, 100)}%` }}
              />
            </div>
          </div> */}
        </div>

        {/* Action button */}
        <button
          type="button"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>
      </a>

      {/* Information below image */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-sm ">
          <h3 className="text-white font-medium mb-2">{title}</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-300">
              <Users className="w-4 h-4 mr-1.5" />
              <span>{activeUsers} active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

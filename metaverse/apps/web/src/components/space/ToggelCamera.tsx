import { useState } from "react";
import {
  checkAndGetCameraPermission,
  DeviceInfoType,
  toggelCamera,
  setSelectedCamera,
} from "@/store/slices/mediaDevicesSlice";

import { Video, VideoOff, ChevronDown, Loader } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import useAppDispatch from "@/hooks/useAppDispatch";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { cn } from "@/lib/utils";

export default function VideoToggle() {
  const dispatch = useAppDispatch();
  const isVideoEnabled = useTypedSelector(
    (state) => state.mediaDevices.isVideoEnabled
  );
  const isCameraPermissionGranted = useTypedSelector(
    (state) => state.mediaDevices.isCameraPermissionGranted
  );
  const selectedCamera = useTypedSelector(
    (state) => state.mediaDevices.selectedCamera
  );
  const loading = useTypedSelector(
    (state) => state.mediaDevices.loading.camera
  );
  const cameras = useTypedSelector((state) => state.mediaDevices.cameras);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggleVideo = async () => {
    if (!isCameraPermissionGranted && !isVideoEnabled) {
      const permissionGranted = await dispatch(checkAndGetCameraPermission());
      if (!permissionGranted) {
        console.error("Camera permission denied");
        return;
      }
    }
    dispatch(toggelCamera());
  };

  const handleCameraSelect = (camera: DeviceInfoType) => {
    dispatch(setSelectedCamera(camera));
    setPopoverOpen(false);
  };

  // ✅ Define reusable colors
  const videoBgColor = isVideoEnabled ? "" : "";
  const iconColor = isVideoEnabled ? "" : "";

  return (
    <div
      className={cn(
        "inline-flex rounded-xl border overflow-hidden transition-colors duration-200",
        videoBgColor
      )}
    >
      {/* Left button: Toggle Video */}
      <Button
        variant="ghost"
        onClick={toggleVideo}
        className={cn(
          "rounded-none rounded-l-xl px-3 py-2 hover:bg-transparent",
          iconColor
        )}
      >
        {loading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : isVideoEnabled ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </Button>

      {/* Right button: Open Camera Dropdown */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "rounded-none rounded-r-xl px-2 py-2 border-l hover:bg-transparent",
              iconColor
            )}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 rounded-xl p-4">
          <div className="space-y-3">
            <div className="text-sm font-medium">Select a Camera</div>
            <div className="flex flex-col gap-2">
              {cameras.length > 0 ? (
                cameras.map((camera) => (
                  <Button
                    key={camera.deviceId}
                    variant={
                      selectedCamera?.deviceId === camera.deviceId
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleCameraSelect(camera)}
                    className="justify-start text-left"
                  >
                    <span className="truncate block w-full">
                      {camera.label || `Camera ${camera.deviceId}`}
                    </span>
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No cameras found
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

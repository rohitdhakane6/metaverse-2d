import { useState } from "react";
import {
  MediaDevice,
  selectDevice,
} from "@/store/mediaDevices/mediaDevicesSlice";
import { toggleDevice } from "@/store/mediaDevices/mediaDevicesThunks";
import { getAvailableCameras } from "@/store/mediaDevices/mediaDevicesThunks";

import { Video, VideoOff, ChevronDown, Loader, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import useAppDispatch from "@/hooks/useAppDispatch";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { toast } from "sonner";

export default function CameraToggle() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useAppDispatch();

  const loading = useTypedSelector(
    (state) => state.mediaDevices.loading.camera
  );
  const isVideoEnabled = useTypedSelector(
    (state) => state.mediaDevices.enabled.camera
  );
  const selectedCameraId = useTypedSelector(
    (state) => state.mediaDevices.selected.camera
  );
  const cameras = useTypedSelector(
    (state) => state.mediaDevices.devices.cameras
  );
  const permissionError = useTypedSelector(
    (state) => state.mediaDevices.error.permissions
  );
  const permission = useTypedSelector(
    (state) => state.mediaDevices.permissions.camera
  );

  const toggleCamera = () => {
    dispatch(toggleDevice("camera"));
  };

  const handleCameraSelect = async (camera: MediaDevice) => {
    if (selectedCameraId === camera.deviceId) {
      toast.error("Camera already selected");
      return;
    }

    dispatch(selectDevice({ type: "camera", deviceId: camera.deviceId }));
    setPopoverOpen(false);
    toast.success(
      `Camera switched to ${camera.label || `Camera ${camera.deviceId}`}`
    );
  };

  const handleRefresh = async () => {
    if (!permission) {
      toast.error("Please allow camera access in your browser settings.");
      return;
    }
    setRefreshing(true);
    await dispatch(getAvailableCameras());
    setRefreshing(false);
  };

  return (
    <div className="inline-flex rounded-xl border overflow-hidden">
      <Button
        variant="ghost"
        onClick={toggleCamera}
        className="rounded-none rounded-l-xl px-3 py-2"
      >
        {loading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : isVideoEnabled ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </Button>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-none rounded-r-xl px-2 py-2 border-l"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-64 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">Select a Camera</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {cameras.length > 0 ? (
              cameras.map((cam) => (
                <Button
                  key={cam.deviceId}
                  variant={
                    selectedCameraId === cam.deviceId ? "default" : "outline"
                  }
                  onClick={() => handleCameraSelect(cam)}
                  className="justify-start text-left"
                  disabled={loading}
                >
                  <span className="truncate block w-full">
                    {cam.label || `Camera ${cam.deviceId.substring(0, 5)}`}
                  </span>
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {permissionError === "PERMISSION_DENIED"
                  ? "Camera access denied"
                  : permissionError === "DEVICE_NOT_FOUND"
                    ? "No cameras found"
                    : "Click the camera button to enable access"}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

import { useState } from "react";
import {
  MediaDevice,
  selectDevice,
} from "@/store/mediaDevices/mediaDevicesSlice";
import {
  toggleDevice,
  getAvailableMicrophones,
} from "@/store/mediaDevices/mediaDevicesThunks";

import { Mic, MicOff, ChevronDown, Loader, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import useAppDispatch from "@/hooks/useAppDispatch";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { toast } from "sonner";

export default function MicToggle() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useAppDispatch();

  const loading = useTypedSelector(
    (state) => state.mediaDevices.loading.microphone
  );
  const isMicEnabled = useTypedSelector(
    (state) => state.mediaDevices.enabled.microphone
  );
  const selectedMicId = useTypedSelector(
    (state) => state.mediaDevices.selected.microphone
  );
  const microphones = useTypedSelector(
    (state) => state.mediaDevices.devices.microphones
  );
  const permissionError = useTypedSelector(
    (state) => state.mediaDevices.error.permissions
  );
  const permission = useTypedSelector(
    (state) => state.mediaDevices.permissions.microphone
  );

  const toggleMic = () => {
    dispatch(toggleDevice("microphone"));
  };

  const handleMicSelect = async (mic: MediaDevice) => {
    if (selectedMicId === mic.deviceId) {
      toast.error("Microphone already selected");
      return;
    }
    dispatch(selectDevice({ type: "microphone", deviceId: mic.deviceId }));
    setPopoverOpen(false);
    toast.success(
      `Microphone switched to ${mic.label || `Microphone ${mic.deviceId}`}`
    );
  };

  const handleRefresh = async () => {
    if (!permission) {
      toast.error("Please allow microphone access in your browser settings.");
      return;
    }
    setRefreshing(true);
    await dispatch(getAvailableMicrophones());
    setRefreshing(false);
  };

  return (
    <div className="inline-flex rounded-xl border overflow-hidden">
      <Button
        variant="ghost"
        onClick={toggleMic}
        className="rounded-none rounded-l-xl px-3 py-2"
      >
        {loading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : isMicEnabled ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
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
            <span className="text-sm font-medium">Select a Microphone</span>
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
            {microphones.length > 0 ? (
              microphones.map((mic) => (
                <Button
                  key={mic.deviceId}
                  variant={
                    selectedMicId === mic.deviceId ? "default" : "outline"
                  }
                  onClick={() => handleMicSelect(mic)}
                  className="justify-start text-left"
                  disabled={loading}
                >
                  <span className="truncate block w-full">
                    {mic.label || `Microphone ${mic.deviceId.substring(0, 5)}`}
                  </span>
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {permissionError === "PERMISSION_DENIED"
                  ? "Microphone access denied"
                  : permissionError === "DEVICE_NOT_FOUND"
                    ? "No microphones found"
                    : "Click the mic button to enable access"}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

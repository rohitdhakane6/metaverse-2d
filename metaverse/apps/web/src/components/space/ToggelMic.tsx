import { useState } from "react";
import {
  checkAndGetMicrophonePermission,
  DeviceInfoType,
  toggelMicrophone,
  setSelectedMicrophone,
} from "@/store/slices/mediaDevicesSlice";

import { Mic, MicOff, ChevronDown, Loader } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import useAppDispatch from "@/hooks/useAppDispatch";
import { useTypedSelector } from "@/hooks/useTypedSelector";

export default function MicToggle() {
  const dispatch = useAppDispatch();
  const isAudioEnabled = useTypedSelector(
    (state) => state.mediaDevices.isAudioEnabled
  );
  const isMicrophonePermissionGranted = useTypedSelector(
    (state) => state.mediaDevices.isMicrophonePermissionsGranted
  );
  const selectedMicrophone = useTypedSelector(
    (state) => state.mediaDevices.selectedMicrophone
  );
  const microphones = useTypedSelector(
    (state) => state.mediaDevices.microphones
  );
  const loading=useTypedSelector((state) => state.mediaDevices.loading.microphone);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggleMic = async () => {
    if (!isMicrophonePermissionGranted && !isAudioEnabled) {
      const permissionGranted = await dispatch(
        checkAndGetMicrophonePermission()
      );
      if (!permissionGranted) {
        console.error("Microphone permission denied");
        return;
      }
    }
    dispatch(toggelMicrophone());
  };

  const handleMicSelect = (mic: DeviceInfoType) => {
    dispatch(setSelectedMicrophone(mic.deviceId));
    setPopoverOpen(false);
  };

  return (
    <div className="inline-flex rounded-xl border overflow-hidden">
      {/* Left button: Toggle Mic */}
      <Button
        variant="ghost"
        onClick={toggleMic}
        className="rounded-none rounded-l-xl px-3 py-2"
      >
        {loading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : isAudioEnabled ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
       
      </Button>

      {/* Right button: Open Microphone Dropdown */}
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
          <div className="space-y-3">
            <div className="text-sm font-medium">Select a Microphone</div>
            <div className="flex flex-col gap-2">
              {microphones.length > 0 ? (
                microphones.map((mic) => (
                  <Button
                    key={mic.deviceId}
                    variant={
                      selectedMicrophone === mic.deviceId
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleMicSelect(mic)}
                    className="justify-start text-left"
                  >
                    <span className="truncate block w-full">
                      {mic.label || `Mic ${mic.deviceId}`}
                    </span>
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No microphones found
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  PermissionErrorType,
  setActiveTrack,
  setDeviceEnabled,
} from "./mediaDevicesSlice";
import { RootState } from "../index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleMediaDeviceError = (error: any): PermissionErrorType => {

  if (
    error.name === "NotAllowedError" ||
    error.name === "PermissionDeniedError"
  ) {
    return "PERMISSION_DENIED";
  } else if (
    error.name === "NotFoundError" ||
    error.name === "DevicesNotFoundError"
  ) {
    return "DEVICE_NOT_FOUND";
  } else {
    return "UNKNOWN";
  }
};

export const getAvailableCameras = createAsyncThunk<
  MediaDeviceInfo[],
  void,
  { rejectValue: PermissionErrorType }
>("mediaDevices/getAvailableCameras", async (_, { rejectWithValue }) => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const cameras = devices.filter(
      (device) => device.kind === "videoinput" && device.deviceId
    );

    return cameras;
  } catch (error) {
    console.error("Error fetching available cameras:", error);
    return rejectWithValue(handleMediaDeviceError(error));
  }
});
export const getAvailableMicrophones = createAsyncThunk<
  MediaDeviceInfo[],
  void,
  { rejectValue: PermissionErrorType }
>("mediaDevices/getAvailableMicrophones", async (_, { rejectWithValue }) => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const microphones = devices.filter(
      (device) => device.kind === "audioinput" && device.deviceId
    );

    return microphones;
  } catch (error) {
    console.error("Error fetching available microphones:", error);
    return rejectWithValue(handleMediaDeviceError(error));
  }
});

export const toggleDevice = createAsyncThunk<
  {
    type: "microphone" | "camera" | "screen";
    enabled: boolean;
    track: MediaStreamTrack | null;
  },
  "microphone" | "camera" | "screen",
  {
    state: RootState;
    rejectValue: PermissionErrorType;
  }
>(
  "mediaDevices/toggleDevice",
  async (deviceType, { getState, dispatch, rejectWithValue }) => {
    const state = getState().mediaDevices;
    const currentEnabled = state.enabled[deviceType];

    if (currentEnabled) {
      if (state.tracks[deviceType]) {
        state.tracks[deviceType]?.stop();
      }
      return { type: deviceType, enabled: false, track: null };
    }

    try {
      let stream: MediaStream | null = null;

      if (deviceType === "microphone") {
        const selectedMicId = state.selected.microphone;
        const constraints: MediaStreamConstraints = {
          audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else if (deviceType === "camera") {
        const selectedCamId = state.selected.camera;
        const constraints: MediaStreamConstraints = {
          video: selectedCamId ? { deviceId: { exact: selectedCamId } } : true,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else if (deviceType === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }

      if (stream) {
        const track =
          deviceType === "microphone"
            ? stream.getAudioTracks()[0]
            : stream.getVideoTracks()[0];

        if (track) {
          track.onended = () => {
            dispatch(setDeviceEnabled({ type: deviceType, enabled: false }));
            dispatch(setActiveTrack({ type: deviceType, track: null }));
          };

          return { type: deviceType, enabled: true, track };
        }
      }
      return rejectWithValue("DEVICE_NOT_FOUND");
    } catch (error) {
      console.error(`Error toggling ${deviceType}:`, error);
      return rejectWithValue(handleMediaDeviceError(error));
    }
  }
);

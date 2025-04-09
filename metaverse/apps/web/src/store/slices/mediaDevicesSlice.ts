import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define error types for better error handling
type MediaPermissionError =
  | "PERMISSION_DENIED"
  | "NOT_SUPPORTED"
  | "DEVICE_NOT_FOUND"
  | "CONSTRAINTS_NOT_SATISFIED"
  | "UNKNOWN";

export interface DeviceInfoType {
  deviceId: string;
  kind: string;
  label: string;
}

// Improved async thunk to check, request camera permissions, and enumerate devices
export const checkAndGetCameraPermission = createAsyncThunk(
  "mediaDevices/checkAndGetCameraPermission",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Check if browser supports the Permissions API
      if (!navigator.permissions || !navigator.permissions.query) {
        // Fallback to getUserMedia directly for browsers without Permissions API
        try {
          await navigator.mediaDevices.getUserMedia({
            video: true,
          });

          // After getting permission, enumerate devices
          const devices = (await navigator.mediaDevices.enumerateDevices()).map(
            (device) => ({
              deviceId: device.deviceId,
              kind: device.kind,
              label: device.label || "Camera",
            })
          );
          const cameras: DeviceInfoType[] = devices.filter(
            (device) => device.kind === "videoinput"
          );

          // Dispatch action to update available cameras
          dispatch(setCameras(cameras));

          return {
            permissionGranted: true,
            cameras,
          };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          return rejectWithValue("NOT_SUPPORTED" as MediaPermissionError);
        }
      }

      const result = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });

      if (result.state === "granted") {
        // Double-check by trying to access camera to ensure no hardware issues
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          dispatch(setActiveStream(stream));

          // After getting permission, enumerate devices
          const devices = (await navigator.mediaDevices.enumerateDevices()).map(
            (device) => ({
              deviceId: device.deviceId,
              kind: device.kind,
              label: device.label || "Camera",
            })
          );
          const cameras = devices.filter(
            (device) => device.kind === "videoinput"
          );

          // Dispatch action to update available cameras
          dispatch(setCameras(cameras));

          return {
            permissionGranted: true,
            cameras,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("not found") ||
            errorMessage.includes("not available")
          ) {
            return rejectWithValue("DEVICE_NOT_FOUND" as MediaPermissionError);
          }
          return rejectWithValue("UNKNOWN" as MediaPermissionError);
        }
      }

      if (result.state === "prompt" || result.state === "denied") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          dispatch(setActiveStream(stream));

          // After getting permission, enumerate devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices
            .filter((device) => device.kind === "videoinput")
            .map((device) => ({
              deviceId: device.deviceId,
              kind: device.kind,
              label: device.label || "Camera",
            }));

          // Dispatch action to update available cameras
          dispatch(setCameras(cameras));

          return {
            permissionGranted: true,
            cameras,
          };
        } catch (error) {
          if (error instanceof Error) {
            if (
              error.name === "NotAllowedError" ||
              error.name === "PermissionDeniedError"
            ) {
              return rejectWithValue(
                "PERMISSION_DENIED" as MediaPermissionError
              );
            }
            if (
              error.name === "NotFoundError" ||
              error.name === "DevicesNotFoundError"
            ) {
              return rejectWithValue(
                "DEVICE_NOT_FOUND" as MediaPermissionError
              );
            }
            if (
              error.name === "ConstraintNotSatisfiedError" ||
              error.name === "OverconstrainedError"
            ) {
              return rejectWithValue(
                "CONSTRAINTS_NOT_SATISFIED" as MediaPermissionError
              );
            }
          }
          return rejectWithValue("UNKNOWN" as MediaPermissionError);
        }
      }

      return {
        permissionGranted: false,
        cameras: [],
      };
    } catch (error) {
      console.error("Error checking camera permission:", error);
      return rejectWithValue("UNKNOWN" as MediaPermissionError);
    }
  }
);

// Similar thunk for microphone permissions
export const checkAndGetMicrophonePermission = createAsyncThunk(
  "mediaDevices/checkAndGetMicrophonePermission",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Check if browser supports the Permissions API
      if (!navigator.permissions || !navigator.permissions.query) {
        // Fallback to getUserMedia directly
        try {
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // After getting permission, enumerate devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          const microphones = devices.filter(
            (device) => device.kind === "audioinput"
          );

          // Dispatch action to update available microphones
          dispatch(setMicrophones(microphones));

          return {
            permissionGranted: true,
            microphones,
          };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          return rejectWithValue("NOT_SUPPORTED" as MediaPermissionError);
        }
      }

      try {
        const result = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });

        if (result.state === "granted") {
          // Double-check by trying to access microphone
          try {
            await navigator.mediaDevices.getUserMedia({
              audio: true,
            });

            // After getting permission, enumerate devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const microphones = devices.filter(
              (device) => device.kind === "audioinput"
            );

            // Dispatch action to update available microphones
            dispatch(setMicrophones(microphones));

            return {
              permissionGranted: true,
              microphones,
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            if (
              errorMessage.includes("not found") ||
              errorMessage.includes("not available")
            ) {
              return rejectWithValue(
                "DEVICE_NOT_FOUND" as MediaPermissionError
              );
            }
            return rejectWithValue("UNKNOWN" as MediaPermissionError);
          }
        }

        if (result.state === "prompt" || result.state === "denied") {
          try {
            await navigator.mediaDevices.getUserMedia({
              audio: true,
            });

            // After getting permission, enumerate devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const microphones = devices.filter(
              (device) => device.kind === "audioinput"
            );

            // Dispatch action to update available microphones
            dispatch(setMicrophones(microphones));

            return {
              permissionGranted: true,
              microphones,
            };
          } catch (error) {
            if (error instanceof Error) {
              if (
                error.name === "NotAllowedError" ||
                error.name === "PermissionDeniedError"
              ) {
                return rejectWithValue(
                  "PERMISSION_DENIED" as MediaPermissionError
                );
              }
              if (
                error.name === "NotFoundError" ||
                error.name === "DevicesNotFoundError"
              ) {
                return rejectWithValue(
                  "DEVICE_NOT_FOUND" as MediaPermissionError
                );
              }
            }
            return rejectWithValue("UNKNOWN" as MediaPermissionError);
          }
        }

        return {
          permissionGranted: false,
          microphones: [],
        };
      } catch (error) {
        console.error("Error checking microphone permission:", error);
        return rejectWithValue("UNKNOWN" as MediaPermissionError);
      }
    } catch (error) {
      console.error("Error checking microphone permission:", error);
      return rejectWithValue("UNKNOWN" as MediaPermissionError);
    }
  }
);

// Thunk to refresh both device lists after permissions are granted
export const refreshDevices = createAsyncThunk(
  "mediaDevices/refreshDevices",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as { mediaDevices: MediaDevicesState };

      if (
        !state.mediaDevices.isCameraPermissionGranted &&
        !state.mediaDevices.isMicrophonePermissionsGranted
      ) {
        return rejectWithValue("No permissions granted to enumerate devices");
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      const cameras: DeviceInfoType[] = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          kind: device.kind,
          label: device.label || "Camera",
        }));
      const microphones = devices.filter(
        (device) => device.kind === "audioinput"
      );

      // Update state with found devices
      dispatch(setCameras(cameras));
      dispatch(setMicrophones(microphones));

      return { cameras, microphones };
    } catch (error) {
      console.error("Error refreshing devices:", error);
      return rejectWithValue("Failed to refresh device list");
    }
  }
);

interface MediaDevicesState {
  isCameraPermissionGranted: boolean;
  isMicrophonePermissionsGranted: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  selectedCamera: DeviceInfoType | null;
  selectedMicrophone: string | null;
  cameras: DeviceInfoType[];
  microphones: DeviceInfoType[];
  loading: {
    camera: boolean;
    microphone: boolean;
    devices: boolean;
  };
  error: {
    camera: MediaPermissionError | null;
    microphone: MediaPermissionError | null;
    devices: string | null;
  };
  warning: string | null;
  activeStream: MediaStream | null;
}

const initialState: MediaDevicesState = {
  isCameraPermissionGranted: false,
  isMicrophonePermissionsGranted: false,
  isVideoEnabled: false,
  isAudioEnabled: false,
  selectedCamera: null,
  selectedMicrophone: null,
  cameras: [],
  microphones: [],
  loading: {
    camera: false,
    microphone: false,
    devices: false,
  },
  error: {
    camera: null,
    microphone: null,
    devices: null,
  },
  warning: null,
  activeStream: null,
};

const mediaDevicesSlice = createSlice({
  name: "mediaDevices",
  initialState,
  reducers: {
    toggelCamera: (state) => {
      state.isVideoEnabled = !state.isVideoEnabled;
    },
    toggelMicrophone: (state) => {
      state.isAudioEnabled = !state.isAudioEnabled;
    },
    setSelectedCamera: (state, action: PayloadAction<DeviceInfoType>) => {
      state.selectedCamera = action.payload;
    },
    setSelectedMicrophone: (state, action: PayloadAction<string | null>) => {
      state.selectedMicrophone = action.payload;
    },
    setCameras: (state, action: PayloadAction<DeviceInfoType[]>) => {
      state.cameras = action.payload;

      // If no camera is selected but we have cameras, select the first one by default
      if (!state.selectedCamera && action.payload.length > 0) {
        state.selectedCamera = action.payload[0];
      }

      // If selected camera is no longer in the list, reset it
      if (
        state.selectedCamera &&
        !action.payload.some(
          (camera) => camera.deviceId === state.selectedCamera?.deviceId
        )
      ) {
        state.selectedCamera =
          action.payload.length > 0 ? action.payload[0] : null;
        state.warning = "Previously selected camera is no longer available";
      }
    },
    setMicrophones: (state, action: PayloadAction<MediaDeviceInfo[]>) => {
      state.microphones = action.payload;

      // If no microphone is selected but we have microphones, select the first one by default
      if (!state.selectedMicrophone && action.payload.length > 0) {
        state.selectedMicrophone = action.payload[0].deviceId;
      }

      // If selected microphone is no longer in the list, reset it
      if (
        state.selectedMicrophone &&
        !action.payload.some((mic) => mic.deviceId === state.selectedMicrophone)
      ) {
        state.selectedMicrophone =
          action.payload.length > 0 ? action.payload[0].deviceId : null;
        state.warning = "Previously selected microphone is no longer available";
      }
    },
    setActiveStream: (state, action: PayloadAction<MediaStream | null>) => {
      // Clean up old stream if it exists
      if (state.activeStream) {
        state.activeStream.getTracks().forEach((track) => track.stop());
      }
      state.activeStream = action.payload;
    },
    clearWarning: (state) => {
      state.warning = null;
    },
    clearError: (
      state,
      action: PayloadAction<"camera" | "microphone" | "devices" | "all">
    ) => {
      if (action.payload === "all") {
        state.error = {
          camera: null,
          microphone: null,
          devices: null,
        };
      } else {
        state.error[action.payload] = null;
      }
    },
    resetMediaDevices: (state) => {
      // Clean up any active stream
      if (state.activeStream) {
        state.activeStream.getTracks().forEach((track) => track.stop());
      }

      return {
        ...initialState,
        // Preserve permission status to avoid unnecessary permission requests
        cameraPermissionsGranted: state.isCameraPermissionGranted,
        isMicrophonePermissionsGranted: state.isMicrophonePermissionsGranted,
      };
    },
  },
  extraReducers: (builder) => {
    // Camera permission handling
    builder
      .addCase(checkAndGetCameraPermission.pending, (state) => {
        state.loading.camera = true;
        state.error.camera = null;
      })
      .addCase(checkAndGetCameraPermission.fulfilled, (state, action) => {
        state.loading.camera = false;
        state.isCameraPermissionGranted = action.payload.permissionGranted;
        state.cameras = action.payload.cameras;

        // Auto-select first camera if available
        if (!state.selectedCamera && action.payload.cameras.length > 0) {
          state.selectedCamera = action.payload.cameras[0];
        }

        // If no cameras found despite permission
        if (
          action.payload.permissionGranted &&
          action.payload.cameras.length === 0
        ) {
          state.warning = "Camera permission granted, but no cameras detected";
        }
      })
      .addCase(checkAndGetCameraPermission.rejected, (state, action) => {
        state.loading.camera = false;
        state.isCameraPermissionGranted = false;
        state.error.camera = action.payload as MediaPermissionError;

        // Set appropriate warning message based on error
        if (action.payload === "PERMISSION_DENIED") {
          state.warning =
            "Camera access was denied. Please check your browser settings to enable camera access.";
        } else if (action.payload === "DEVICE_NOT_FOUND") {
          state.warning =
            "No camera detected. Please connect a camera and try again.";
        } else if (action.payload === "NOT_SUPPORTED") {
          state.warning =
            "Your browser doesn't support camera access. Please try a different browser.";
        } else {
          state.warning =
            "Failed to access camera. Please check your hardware and browser settings.";
        }
      });

    // Microphone permission handling
    builder
      .addCase(checkAndGetMicrophonePermission.pending, (state) => {
        state.loading.microphone = true;
        state.error.microphone = null;
      })
      .addCase(checkAndGetMicrophonePermission.fulfilled, (state, action) => {
        state.loading.microphone = false;
        state.isMicrophonePermissionsGranted = action.payload.permissionGranted;
        state.microphones = action.payload.microphones;

        // Auto-select first microphone if available
        if (
          !state.selectedMicrophone &&
          action.payload.microphones.length > 0
        ) {
          state.selectedMicrophone = action.payload.microphones[0].deviceId;
        }

        // If no microphones found despite permission
        if (
          action.payload.permissionGranted &&
          action.payload.microphones.length === 0
        ) {
          state.warning =
            "Microphone permission granted, but no microphones detected";
        }
      })
      .addCase(checkAndGetMicrophonePermission.rejected, (state, action) => {
        state.loading.microphone = false;
        state.isMicrophonePermissionsGranted = false;
        state.error.microphone = action.payload as MediaPermissionError;

        // Set appropriate warning message based on error
        if (action.payload === "PERMISSION_DENIED") {
          state.warning =
            "Microphone access was denied. Please check your browser settings to enable microphone access.";
        } else if (action.payload === "DEVICE_NOT_FOUND") {
          state.warning =
            "No microphone detected. Please connect a microphone and try again.";
        } else if (action.payload === "NOT_SUPPORTED") {
          state.warning =
            "Your browser doesn't support microphone access. Please try a different browser.";
        } else {
          state.warning =
            "Failed to access microphone. Please check your hardware and browser settings.";
        }
      });

    // Device refresh handling
    builder
      .addCase(refreshDevices.pending, (state) => {
        state.loading.devices = true;
        state.error.devices = null;
      })
      .addCase(refreshDevices.fulfilled, (state) => {
        state.loading.devices = false;
        // No need to set cameras/microphones as they're already set by the dispatched actions
      })
      .addCase(refreshDevices.rejected, (state, action) => {
        state.loading.devices = false;
        state.error.devices =
          (action.payload as string) || "Failed to refresh devices";
        state.warning =
          "Failed to refresh device list. Please check your hardware and browser settings.";
      });
  },
});

// Export actions
export const {
  toggelCamera,
  toggelMicrophone,
  setSelectedCamera,
  setSelectedMicrophone,
  setCameras,
  setMicrophones,
  setActiveStream,
  clearWarning,
  clearError,
  resetMediaDevices,
} = mediaDevicesSlice.actions;
export default mediaDevicesSlice.reducer;

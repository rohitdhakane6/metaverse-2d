import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getAvailableCameras,
  getAvailableMicrophones,
  toggleDevice,
} from "./mediaDevicesThunks";

export type PermissionErrorType =
  | "PERMISSION_DENIED"
  | "DEVICE_NOT_FOUND"
  | "UNKNOWN";

export interface MediaDevice {
  deviceId: string;
  kind: string;
  label: string;
}

export interface MediaDevicesState {
  devices: {
    microphones: MediaDevice[];
    cameras: MediaDevice[];
    speakers: MediaDevice[];
  };
  selected: {
    microphone: string | null;
    camera: string | null;
    speaker: string | null;
  };
  enabled: {
    microphone: boolean;
    camera: boolean;
    screen: boolean;
  };
  permissions: {
    microphone: boolean;
    camera: boolean;
  };
  tracks: {
    microphone: MediaStreamTrack | null;
    camera: MediaStreamTrack | null;
    screen: MediaStreamTrack | null;
  };
  loading: {
    camera: boolean;
    microphone: boolean;
  };
  error: {
    permissions: string | null;
    devices: string | null;
  };
}

const initialState: MediaDevicesState = {
  devices: {
    microphones: [],
    cameras: [],
    speakers: [],
  },
  selected: {
    microphone: null,
    camera: null,
    speaker: null,
  },
  enabled: {
    microphone: false,
    camera: false,
    screen: false,
  },
  permissions: {
    microphone: false,
    camera: false,
  },
  tracks: {
    microphone: null,
    camera: null,
    screen: null,
  },
  loading: {
    camera: false,
    microphone: false,
  },
  error: {
    permissions: null,
    devices: null,
  },
};

// Create slice
const mediaDevicesSlice = createSlice({
  name: "mediaDevices",
  initialState,
  reducers: {
    setActiveTrack: (
      state,
      action: PayloadAction<{
        type: "microphone" | "camera" | "screen";
        track: MediaStreamTrack | null;
      }>
    ) => {
      const { type, track } = action.payload;
      if (state.tracks[type]) {
        state.tracks[type]?.stop();
      }
      state.tracks[type] = track;
    },
    setDeviceEnabled: (
      state,
      action: PayloadAction<{
        type: "microphone" | "camera" | "screen";
        enabled: boolean;
      }>
    ) => {
      const { type, enabled } = action.payload;

      state.enabled[type] = enabled;

      // If disabling, stop the track
      if (!enabled && state.tracks[type]) {
        state.tracks[type]?.stop();
        state.tracks[type] = null;
      }
    },
    selectDevice: (
      state,
      action: PayloadAction<{
        type: "microphone" | "camera" | "speaker";
        deviceId: string;
      }>
    ) => {
      const { type, deviceId } = action.payload;
      state.selected[type] = deviceId;
    },
    setMicrophones: (state, action: PayloadAction<MediaDevice[]>) => {
      state.devices.microphones = action.payload;
    },
    setSpeakers: (state, action: PayloadAction<MediaDevice[]>) => {
      state.devices.speakers = action.payload;
    },
    setCameras: (state, action: PayloadAction<MediaDevice[]>) => {
      state.devices.cameras = action.payload;
    },
    setPermissionError: (
      state,
      action: PayloadAction<{ type: "microphone" | "camera"; error: string }>
    ) => {
      const { type, error } = action.payload;
      state.error.permissions = `${type}: ${error}`;
    },
    clearPermissionError: (state) => {
      state.error.permissions = null;
      state.error.devices = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Get available cameras thunk
      .addCase(getAvailableCameras.fulfilled, (state, action) => {
        state.devices.cameras = action.payload;
      })
      .addCase(getAvailableMicrophones.fulfilled, (state, action) => {
        state.devices.microphones = action.payload;
      })

      // Toggle device thunk
      .addCase(toggleDevice.pending, (state, action) => {
        const type = action.meta.arg;
        if (type === "camera") {
          state.loading.camera = true;
        }
        if (type === "microphone") {
          state.loading.microphone = true;
        }
      })
      .addCase(toggleDevice.fulfilled, (state, action) => {
        const type = action.payload.type;
        if (type === "camera") {
          state.loading.camera = false;
          state.enabled.camera = action.payload.enabled;
          state.tracks.camera = action.payload.track;
          state.permissions.camera=true;
        }
        if (type === "microphone") {
          state.loading.microphone = false;
          state.enabled.microphone = action.payload.enabled;
          state.tracks.microphone = action.payload.track;
          state.permissions.microphone=true;
        }
        if (type === "screen") {
          state.enabled.screen = action.payload.enabled;
          state.tracks.screen = action.payload.track;
        }
      })
      .addCase(toggleDevice.rejected, (state, action) => {
        const type = action.meta.arg;
        if (type === "camera") {
          state.loading.camera = false;
        }
        if (type === "microphone") {
          state.loading.microphone = false;
        }
        state.error.permissions = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  setActiveTrack,
  setDeviceEnabled,
  selectDevice,
  setMicrophones,
  setSpeakers,
  setCameras,
  setPermissionError,
  clearPermissionError,
} = mediaDevicesSlice.actions;

export default mediaDevicesSlice.reducer;

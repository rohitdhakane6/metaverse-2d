import { combineReducers } from "@reduxjs/toolkit";
import arenaSlice from "./slices/arenaSlice";
import mediaDevicesSlice from "./mediaDevices/mediaDevicesSlice";
const rootReducer = combineReducers({
  arena: arenaSlice,
  mediaDevices: mediaDevicesSlice,
});

export default rootReducer;

import { combineReducers } from "@reduxjs/toolkit";
import arenaSlice from "./slices/arenaSlice"
const rootReducer = combineReducers({
  arena:arenaSlice
});

export default rootReducer;

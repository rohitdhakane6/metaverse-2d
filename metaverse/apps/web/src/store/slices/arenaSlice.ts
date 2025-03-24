import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ArenaState {
  spaceId: string | null;
  isGameInFocus: boolean;
}

const initialState: ArenaState = {
  spaceId: null,
  isGameInFocus: true,
};

const arenaSlice = createSlice({
  name: "arena",
  initialState,
  reducers: {
    setSpaceId: (state, action: PayloadAction<string>) => {
      state.spaceId = action.payload;
    },
    setGameFocus: (state, action: PayloadAction<boolean>) => {
      state.isGameInFocus = action.payload;
    },
  },
});

export const { setSpaceId, setGameFocus } = arenaSlice.actions;
export default arenaSlice.reducer;

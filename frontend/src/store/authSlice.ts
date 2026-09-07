import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RoleType } from "@/types/common";

interface AuthState {
  role: RoleType | null;
  userName: string;
}

const initialState: AuthState = {
  role: null,
  userName: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ role: RoleType; userName: string }>) {
      state.role = action.payload.role;
      // Always use the real name from the API — no hardcoded fallbacks.
      state.userName = action.payload.userName;
    },
    logout(state) {
      state.role = null;
      state.userName = "";
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

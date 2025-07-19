import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    userId: null,
    userData: null,
    userRole: null,
    location: null, // { latitude, longitude }
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.userData = action.payload.userData;
      state.userRole = action.payload.role;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.userData = null;
      state.userRole = null;
      state.location = null;
    },
    setLocation: (state, action) => {
      state.location = action.payload; // { latitude, longitude }
    },
  },
});

export const { loginSuccess, logout, setLocation } = authSlice.actions;
export default authSlice.reducer;
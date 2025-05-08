import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    userId: null,
    userData: null,
    rememberMe: false,
    savedCredentials: null,
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
      state.rememberMe = false;
      state.savedCredentials = { email: '', password: '' };
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    setSavedCredentials: (state, action) => {
      state.savedCredentials = action.payload;
    },
  },
});

export const { loginSuccess, logout, setRememberMe, setSavedCredentials } = authSlice.actions;
export default authSlice.reducer;

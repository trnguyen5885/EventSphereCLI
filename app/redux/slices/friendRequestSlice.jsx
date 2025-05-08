import { fetchPendingRequests } from '../../screens/friend/services/friendApi';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPendingCount = createAsyncThunk(
  'friendRequest/fetchPendingCount',
  async () => {
    const res = await fetchPendingRequests();
    return res.length;
  }
);

const friendRequestSlice = createSlice({
  name: 'friendRequest',
  initialState: {
    pendingCount: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingCount.fulfilled, (state, action) => {
        console.log("action.payload", action.payload);
        state.pendingCount = action.payload;
      });
  },
});

export default friendRequestSlice.reducer;
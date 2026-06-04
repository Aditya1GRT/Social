import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    notifFetchStart: (state) => { state.isFetching = true; state.error = false; },
    notifFetchSuccess: (state, action) => { state.isFetching = false; state.items = action.payload; },
    notifFetchFail: (state) => { state.isFetching = false; state.error = true; },
    notifMarkAllRead: (state) => {
      state.items = state.items.map(n => ({ ...n, read: true }));
    },
  },
});

export const { notifFetchStart, notifFetchSuccess, notifFetchFail, notifMarkAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;

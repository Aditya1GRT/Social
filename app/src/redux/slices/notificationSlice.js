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
    // Real-time push: replace existing entry (same _id) or prepend new one
    notifAdd: (state, action) => {
      const notif = action.payload;
      const idx = state.items.findIndex(n => n._id === notif._id);
      if (idx !== -1) {
        state.items[idx] = notif;
      } else {
        state.items = [notif, ...state.items];
      }
    },
  },
});

export const {
  notifFetchStart, notifFetchSuccess, notifFetchFail, notifMarkAllRead, notifAdd,
} = notificationSlice.actions;
export default notificationSlice.reducer;

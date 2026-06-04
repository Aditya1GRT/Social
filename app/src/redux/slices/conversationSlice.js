import { createSlice } from '@reduxjs/toolkit';

const conversationSlice = createSlice({
  name: 'conversation',
  initialState: {
    conversations: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    convoStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    convoFetchSuccess(state, action) {
      state.isFetching = false;
      state.error = false;
      state.conversations = action.payload;
    },
    convoPostSuccess(state, action) {
      state.isFetching = false;
      state.error = false;
      const exists = state.conversations.find(c => c._id === action.payload._id);
      if (!exists) {
        state.conversations = [action.payload, ...state.conversations];
      }
    },
    convoFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  convoStart,
  convoFetchSuccess,
  convoPostSuccess,
  convoFailure,
} = conversationSlice.actions;

export default conversationSlice.reducer;

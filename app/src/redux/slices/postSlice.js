import { createSlice } from '@reduxjs/toolkit';

const postSlice = createSlice({
  name: 'post',
  initialState: {
    postsList: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    postStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    getPostSuccess(state, action) {
      state.isFetching = false;
      state.error = false;
      state.postsList = action.payload;
    },
    createPostSuccess(state, action) {
      state.isFetching = false;
      state.error = false;
      state.postsList = [action.payload, ...state.postsList];
    },
    postReactSuccess(state, action) {
      state.isFetching = false;
      const updated = action.payload;
      const idx = state.postsList.findIndex(p => p._id === updated._id);
      if (idx !== -1) {
        state.postsList[idx] = { ...state.postsList[idx], ...updated };
      }
    },
    postDeleteSuccess(state, action) {
      state.isFetching = false;
      state.postsList = state.postsList.filter(p => p._id !== action.payload);
    },
    postFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  postStart,
  getPostSuccess,
  createPostSuccess,
  postReactSuccess,
  postDeleteSuccess,
  postFailure,
} = postSlice.actions;

export default postSlice.reducer;

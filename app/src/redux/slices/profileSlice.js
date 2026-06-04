import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: null,
    posts: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    profileStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    profileSuccess(state, action) {
      state.isFetching = false;
      state.error = false;
      state.user = action.payload;
    },
    postFetchSuccess(state, action) {
      state.isFetching = false;
      state.error = false;
      state.posts = action.payload;
    },
    profileFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  profileStart,
  profileSuccess,
  postFetchSuccess,
  profileFailure,
} = profileSlice.actions;

export default profileSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const prodileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null,
    posts: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    profileStart: (state) => {
      state.isFetching = true;
    },
    profileSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.user = action.payload;
    },
    postFetchSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.posts = action.payload;
    },

    profileFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  profileFailure,
  profileStart,
  profileSuccess,
  postFetchSuccess,
} = prodileSlice.actions;

export default prodileSlice.reducer;

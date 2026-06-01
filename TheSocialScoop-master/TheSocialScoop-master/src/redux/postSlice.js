import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "posts",
  initialState: {
    postsList: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    postStart: (state) => {
      state.isFetching = true;
    },
    createPostSuccess: (state, action) => {
      state.postsList.push(action.payload);
      state.isFetching = false;
    },
    postReactSuccess: (state, action) => {
      state.postsList = state.postsList.map((post) => {
        if (post._id === action.payload.newPost._id) {
          return action.payload.newPost;
        } else {
          return post;
        }
      });
      state.isFetching = false;
    },
    postDeleteSuccess: (state, action) => {
      state.postsList = state.postsList.filter(
        (post) => post._id !== action.payload
      );
      state.isFetching = false;
    },

    getPostSuccess: (state, action) => {
      state.postsList = [...action.payload];
      state.isFetching = false;
    },
    postFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  createPostSuccess,
  getPostSuccess,
  postFailure,
  postStart,
  postReactSuccess,
  postDeleteSuccess,
} = postSlice.actions;
export default postSlice.reducer;

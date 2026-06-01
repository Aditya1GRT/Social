import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    isFetching: false,
    error: false,
  },
  reducers: {
    userStart: (state) => {
      state.isFetching = true;
    },
    loginSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser = action.payload;
    },
    refreshSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser = action.payload;
    },

    logOut: (state) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser = null;
    },
    changeThemeSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser.prefersDarkTheme = action.payload;
    },
    getUsersSuccess: (state) => {
      state.isFetching = false;
      state.error = false;
    },
    followingStart: (state) => {
      state.isFetching = true;
    },
    sendFollowRequestSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser.reqSent.push(action.payload);
    },
    unSendFollowRequestSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser.reqSent = state.currentUser.reqSent.filter(
        (user) => user !== action.payload
      );
    },
    approveFollowRequestSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser.following.push(action.payload);
      state.currentUser.reqRecieved = state.currentUser.reqRecieved.filter(
        (user) => user !== action.payload
      );
    },
    rejectFollowRequestSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser.reqRecieved = state.currentUser.reqRecieved.filter(
        (user) => user !== action.payload
      );
    },

    unFollowSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser.following = state.currentUser.following.filter(
        (user) => user !== action.payload
      );
    },
    deleteUserSuccess: (state) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser = null;
    },
    userFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  loginSuccess,
  logOut,
  userFailure,
  followingStart,
  sendFollowRequestSuccess,
  unFollowSuccess,
  getUsersSuccess,
  changeThemeSuccess,
  userStart,
  approveFollowRequestSuccess,
  rejectFollowRequestSuccess,
  unSendFollowRequestSuccess,
  deleteUserSuccess,
  refreshSuccess,
} = userSlice.actions;
export default userSlice.reducer;

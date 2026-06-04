import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    isFetching: false,
    error: false,
  },
  reducers: {
    userStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    loginSuccess(state, action) {
      state.isFetching = false;
      state.error = false;
      state.currentUser = action.payload;
    },
    refreshSuccess(state, action) {
      state.isFetching = false;
      state.error = false;
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
    logOut(state) {
      state.currentUser = null;
      state.isFetching = false;
      state.error = false;
    },
    userFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
    followingStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    sendFollowRequestSuccess(state, action) {
      state.isFetching = false;
      if (state.currentUser) {
        state.currentUser.reqSent = [
          ...(state.currentUser.reqSent || []),
          action.payload,
        ];
      }
    },
    unSendFollowRequestSuccess(state, action) {
      state.isFetching = false;
      if (state.currentUser) {
        state.currentUser.reqSent = (state.currentUser.reqSent || []).filter(
          id => id !== action.payload
        );
      }
    },
    approveFollowRequestSuccess(state, action) {
      state.isFetching = false;
      const { requesterId } = action.payload;
      if (state.currentUser) {
        state.currentUser.reqRecieved = (state.currentUser.reqRecieved || []).filter(
          id => id !== requesterId
        );
        state.currentUser.followers = [
          ...(state.currentUser.followers || []),
          requesterId,
        ];
      }
    },
    rejectFollowRequestSuccess(state, action) {
      state.isFetching = false;
      const { requesterId } = action.payload;
      if (state.currentUser) {
        state.currentUser.reqRecieved = (state.currentUser.reqRecieved || []).filter(
          id => id !== requesterId
        );
      }
    },
    unFollowSuccess(state, action) {
      state.isFetching = false;
      const { targetId } = action.payload;
      if (state.currentUser) {
        state.currentUser.following = (state.currentUser.following || []).filter(
          id => id !== targetId
        );
      }
    },
    changeThemeSuccess(state, action) {
      if (state.currentUser) {
        state.currentUser.prefersDarkTheme = action.payload;
      }
    },
    deleteUserSuccess(state) {
      state.currentUser = null;
      state.isFetching = false;
      state.error = false;
    },
  },
});

export const {
  userStart,
  loginSuccess,
  refreshSuccess,
  logOut,
  userFailure,
  followingStart,
  sendFollowRequestSuccess,
  unSendFollowRequestSuccess,
  approveFollowRequestSuccess,
  rejectFollowRequestSuccess,
  unFollowSuccess,
  changeThemeSuccess,
  deleteUserSuccess,
} = userSlice.actions;

export default userSlice.reducer;

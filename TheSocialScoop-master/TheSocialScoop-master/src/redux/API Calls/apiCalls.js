import { publicRequest } from "../../requestMethods";

import {
  userFailure,
  followingStart,
  sendFollowRequestSuccess,
  getUsersSuccess,
  userStart,
  loginSuccess,
  unFollowSuccess,
  changeThemeSuccess,
  unSendFollowRequestSuccess,
  approveFollowRequestSuccess,
  rejectFollowRequestSuccess,
  deleteUserSuccess,
  refreshSuccess,
} from "../userSlice";

export const login = async (dispatch, user) => {
  dispatch(userStart());
  try {
    const res = await publicRequest.post("auth/login", user);
    dispatch(loginSuccess(res.data));
  } catch (error) {
    dispatch(userFailure());
  }
};
export const refresh = async (dispatch, user) => {
  dispatch(userStart());
  try {
    const res = await publicRequest.get(`/users/user/${user.username}`);
    dispatch(refreshSuccess({ ...user, ...res.data }));
  } catch (error) {
    dispatch(userFailure());
  }
};

export const changeTheme = async (dispatch, userId, prefersDarkTheme) => {
  dispatch(userStart());
  try {
    await publicRequest.put(`/users/theme/${userId}`, { prefersDarkTheme });
    dispatch(changeThemeSuccess(prefersDarkTheme));
  } catch (error) {
    dispatch(userFailure());
  }
};

export const getUsers = async (dispatch, userList) => {
  dispatch(followingStart());
  try {
    const res = await publicRequest.post("users/users-details", {
      data: userList,
    });
    dispatch(getUsersSuccess());
    return res.data;
  } catch (error) {
    dispatch(userFailure());
    return error.message;
  }
};

export const follow = async ({ dispatch, id, userId }) => {
  dispatch(followingStart());
  try {
    await publicRequest.put(`users/follow-request/${id}`, { userId });
    dispatch(sendFollowRequestSuccess(id));
  } catch (error) {
    dispatch(userFailure());
  }
};
export const unsendFollowReq = async ({ dispatch, id, userId }) => {
  dispatch(followingStart());
  try {
    await publicRequest.put(`users/unsend-follow-request/${id}`, { userId });
    dispatch(unSendFollowRequestSuccess(id));
  } catch (error) {
    dispatch(userFailure());
  }
};
export const approveFollowRequest = async ({ dispatch, id, userId }) => {
  dispatch(followingStart());
  try {
    await publicRequest.put(`users/approve-follow-request/${id}`, { userId });
    dispatch(approveFollowRequestSuccess(id));
  } catch (error) {
    dispatch(userFailure());
  }
};
export const rejectFollowRequest = async ({ dispatch, id, userId }) => {
  dispatch(followingStart());
  try {
    await publicRequest.put(`users/reject-follow-request/${id}`, { userId });
    dispatch(rejectFollowRequestSuccess(id));
  } catch (error) {
    dispatch(userFailure());
  }
};

export const unfollow = async ({ dispatch, id, userId }) => {
  dispatch(followingStart());
  try {
    await publicRequest.put(`users/unfollow/${id}`, { userId });
    dispatch(unFollowSuccess(id));
  } catch (error) {
    dispatch(userFailure());
  }
};

export const deleteUser = async (dispatch, id) => {
  dispatch(userStart());
  try {
    await publicRequest.delete(`users/${id}`);
    dispatch(deleteUserSuccess(id));
  } catch (error) {
    dispatch(userFailure());
  }
};

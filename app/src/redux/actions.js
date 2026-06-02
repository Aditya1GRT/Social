import { api } from '../utils/api';
import {
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
} from './slices/userSlice';
import {
  postStart,
  getPostSuccess,
  createPostSuccess,
  postReactSuccess,
  postDeleteSuccess,
  postFailure,
} from './slices/postSlice';
import {
  convoStart,
  convoFetchSuccess,
  convoPostSuccess,
  convoFailure,
} from './slices/conversationSlice';
import {
  profileStart,
  profileSuccess,
  postFetchSuccess,
  profileFailure,
} from './slices/profileSlice';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = async (dispatch, creds) => {
  dispatch(userStart());
  try {
    const { data } = await api.post('auth/login', creds);
    dispatch(loginSuccess(data));
  } catch (err) {
    dispatch(userFailure());
    throw err;
  }
};

export const signup = async (dispatch, creds) => {
  dispatch(userStart());
  try {
    const { data } = await api.post('auth/signup', creds);
    dispatch(loginSuccess(data));
  } catch (err) {
    dispatch(userFailure());
    throw err;
  }
};

export const refresh = async (dispatch, user) => {
  if (!user) return;
  dispatch(userStart());
  try {
    const { data } = await api.get(`users/user/${user.username}`);
    dispatch(refreshSuccess(data));
  } catch (err) {
    if (err?.response?.status === 404) {
      dispatch(logOut());
    } else {
      dispatch(userFailure());
    }
  }
};

// ─── Theme & Account ─────────────────────────────────────────────────────────

export const changeTheme = async (dispatch, userId, val) => {
  dispatch(changeThemeSuccess(val)); // update UI immediately
  try {
    await api.put(`users/theme/${userId}`, { prefersDarkTheme: val });
  } catch (err) {
    console.error('changeTheme error:', err);
  }
};

export const deleteAccount = async (dispatch, id) => {
  dispatch(userStart());
  try {
    await api.delete(`users/${id}`);
    dispatch(deleteUserSuccess());
  } catch (err) {
    dispatch(userFailure());
    throw err;
  }
};

// ─── Follow Actions ───────────────────────────────────────────────────────────

export const follow = async (dispatch, targetId, userId) => {
  dispatch(followingStart());
  try {
    await api.put(`users/follow-request/${targetId}`, { userId });
    dispatch(sendFollowRequestSuccess(targetId));
  } catch (err) {
    dispatch(userFailure());
    throw err;
  }
};

export const unsendFollowReq = async (dispatch, targetId, userId) => {
  dispatch(followingStart());
  try {
    await api.put(`users/unsend-follow-request/${targetId}`, { userId });
    dispatch(unSendFollowRequestSuccess(targetId));
  } catch (err) {
    dispatch(userFailure());
    throw err;
  }
};

export const approveFollow = async (dispatch, requesterId, userId) => {
  dispatch(followingStart());
  try {
    await api.put(`users/approve-follow-request/${requesterId}`, { userId });
    dispatch(approveFollowRequestSuccess({ requesterId }));
  } catch (err) {
    dispatch(userFailure());
    throw err;
  }
};

export const rejectFollow = async (dispatch, requesterId, userId) => {
  dispatch(followingStart());
  try {
    await api.put(`users/reject-follow-request/${requesterId}`, { userId });
    dispatch(rejectFollowRequestSuccess({ requesterId }));
  } catch (err) {
    dispatch(userFailure());
    throw err;
  }
};

export const unfollow = async (dispatch, targetId, userId) => {
  dispatch(followingStart());
  try {
    await api.put(`users/unfollow/${targetId}`, { userId });
    dispatch(unFollowSuccess({ targetId }));
  } catch (err) {
    dispatch(userFailure());
    throw err;
  }
};

// ─── User Queries ─────────────────────────────────────────────────────────────

export const searchUsers = async (query) => {
  try {
    const { data } = await api.get(`users/${encodeURIComponent(query)}`);
    return data;
  } catch (err) {
    console.error('searchUsers error:', err);
    return [];
  }
};

export const getFollowers = async (username) => {
  try {
    const { data } = await api.get(`users/followers/${username}`);
    return data;
  } catch (err) {
    console.error('getFollowers error:', err);
    return [];
  }
};

export const getUsersDetails = async (ids) => {
  try {
    const { data } = await api.post('users/users-details', { data: ids });
    return data;
  } catch (err) {
    console.error('getUsersDetails error:', err);
    return [];
  }
};

export const updateUser = async (id, fields) => {
  try {
    const { data } = await api.put(`users/${id}`, { _id: id, ...fields });
    return data;
  } catch (err) {
    console.error('updateUser error:', err);
    throw err;
  }
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const getConversations = async (dispatch, userId) => {
  dispatch(convoStart());
  try {
    const { data } = await api.get(`conversations/${userId}`);
    dispatch(convoFetchSuccess(data));
  } catch (err) {
    dispatch(convoFailure());
    throw err;
  }
};

export const newConversation = async (dispatch, senderId, receiverId) => {
  dispatch(convoStart());
  try {
    const { data } = await api.post('conversations', { senderId, receiverId });
    dispatch(convoPostSuccess(data));
    return data;
  } catch (err) {
    dispatch(convoFailure());
    throw err;
  }
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const getMessages = async (conversationId) => {
  try {
    const { data } = await api.get(`message/${conversationId}`);
    return data;
  } catch (err) {
    console.error('getMessages error:', err);
    return [];
  }
};

export const sendMessage = async (msgData) => {
  try {
    const { data } = await api.post('message', msgData);
    return data;
  } catch (err) {
    console.error('sendMessage error:', err);
    throw err;
  }
};

// ─── Posts ────────────────────────────────────────────────────────────────────

export const getPosts = async (dispatch, userId) => {
  dispatch(postStart());
  try {
    const { data } = await api.get(`posts/${userId}`);
    dispatch(getPostSuccess(data));
  } catch (err) {
    dispatch(postFailure());
    throw err;
  }
};

export const createPost = async (dispatch, postData) => {
  dispatch(postStart());
  try {
    const { data } = await api.post('posts/create-post', postData);
    dispatch(createPostSuccess(data));
  } catch (err) {
    dispatch(postFailure());
    throw err;
  }
};

export const deletePost = async (dispatch, postId, userId) => {
  dispatch(postStart());
  try {
    await api.delete(`posts/delete-post/${postId}`, { data: { userId } });
    dispatch(postDeleteSuccess(postId));
  } catch (err) {
    dispatch(postFailure());
    throw err;
  }
};

export const reactPost = async (dispatch, post, userId) => {
  try {
    const { data } = await api.put(`posts/reactions/${post._id}`, { userId });
    dispatch(postReactSuccess({ ...post, ...data }));
  } catch (err) {
    dispatch(postFailure());
    throw err;
  }
};

export const addComment = async (postId, commentData) => {
  try {
    const { data } = await api.put(`posts/comment/${postId}`, { commentData });
    return data;
  } catch (err) {
    console.error('addComment error:', err);
    throw err;
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const { data } = await api.put(`posts/delete-comment/${postId}`, { commentId });
    return data;
  } catch (err) {
    console.error('deleteComment error:', err);
    throw err;
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getUserProfile = async (dispatch, username) => {
  dispatch(profileStart());
  try {
    const { data } = await api.get(`users/user/${username}`);
    dispatch(profileSuccess(data));
  } catch (err) {
    dispatch(profileFailure());
    throw err;
  }
};

export const getUserPosts = async (dispatch, user) => {
  dispatch(profileStart());
  try {
    const { data } = await api.get(`posts/profile/${user._id}`);
    dispatch(postFetchSuccess(data));
  } catch (err) {
    dispatch(profileFailure());
    throw err;
  }
};

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    // Let axios set Content-Type automatically (includes multipart boundary).
    // Use a longer timeout — Cloudinary uploads can take 30–60s for large files.
    const { data } = await api.post('upload', formData, { timeout: 120000 });
    return data.url;
  } catch (err) {
    console.error('uploadFile error:', err);
    throw err;
  }
};

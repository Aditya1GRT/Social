import { publicRequest } from "../../requestMethods";

import {
  createPostSuccess,
  getPostSuccess,
  postDeleteSuccess,
  postFailure,
  postReactSuccess,
  postStart,
} from "../postSlice";

export const createPosts = async (dispatch, postData) => {
  try {
    const res = await publicRequest.post("/posts/create-post", { ...postData });
    dispatch(createPostSuccess(res.data));
  } catch (error) {
    dispatch(postFailure());
  }
};

export const getPosts = async (dispatch, userId) => {
  dispatch(postStart());
  try {
    const { data } = await publicRequest.get(`/posts/${userId}`);
    dispatch(getPostSuccess(data));
  } catch (error) {
    dispatch(postFailure());
  }
};

export const postReaction = async (dispatch, post, userId) => {
  try {
    if (!post.likes.includes(userId)) {
      const newPost = { ...post, likes: [...post.likes, userId] };
      dispatch(postReactSuccess({ newPost, userId }));
    } else {
      const newLikes = [...post.likes];
      newLikes.splice(newLikes.indexOf(userId), 1);
      const newPost = { ...post, likes: newLikes };
      dispatch(postReactSuccess({ newPost, userId }));
    }
    await publicRequest.put(`/posts/reactions/${post._id}`, {
      userId,
    });
  } catch (error) {
    dispatch(postFailure());
  }
};

export const deletePost = async (dispatch, postId, userId) => {
  dispatch(postStart());
  try {
    await publicRequest.delete(`/posts/delete-post/${postId}`, {
      data: {
        userId,
      },
    });
    dispatch(postDeleteSuccess(postId));
  } catch (error) {
    dispatch(postFailure());
    console.log(error.message);
  }
};

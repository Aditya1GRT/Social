import { publicRequest } from "../../requestMethods";
import {
  postFetchSuccess,
  profileFailure,
  profileStart,
  profileSuccess,
} from "../profileSlice";

export const getUserProfile = async (dispatch, username) => {
  dispatch(profileStart());
  try {
    const { data } = await publicRequest.get(`/users/user/${username}`);
    dispatch(profileSuccess(data));
  } catch (error) {
    console.log(error.message);
    dispatch(profileFailure());
  }
};
export const getUserPosts = async (dispatch, user) => {
  dispatch(profileStart());
  try {
    const { data } = await publicRequest.get(`/posts/profile/${user._id}`);
    const postList = data.map((post) => ({
      ...post,
      profilePicture: user.profilePicture,
      username: user.username,
      name: user.name,
    }));
    dispatch(postFetchSuccess(postList));
  } catch (error) {
    console.log(error.message);
    dispatch(profileFailure());
  }
};

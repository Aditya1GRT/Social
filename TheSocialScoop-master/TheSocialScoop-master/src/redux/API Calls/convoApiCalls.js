import { publicRequest } from "../../requestMethods";
import {
  convoFailure,
  convoFetchSuccess,
  convoPostSuccess,
  convoStart,
} from "../conversationSlice";

export const getConversations = async (dispatch, userId) => {
  dispatch(convoStart());
  try {
    const res = await publicRequest.get(`conversations/${userId}`);
    dispatch(convoFetchSuccess(res.data));
  } catch (error) {
    dispatch(convoFailure());
  }
};
export const newConversation = async (dispatch, userId, id) => {
  dispatch(convoStart());
  try {
    const res = await publicRequest.post(`conversations`, {
      senderId: userId,
      receiverId: id,
    });
    dispatch(convoPostSuccess(res.data));
    return res.data;
  } catch (error) {
    dispatch(convoFailure());
  }
};

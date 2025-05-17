import axios from "axios";
import api from "../axiosInstance";


interface CommentPayload {
  user_id: string;
  content: string;
}

export const commentService = {
  getComments: async (userId: string) => {
    const response = await api.get(`users/comments/?user_id=${userId}`);
    return response.data;
  },
  getAllComments: async () => {
    const response = await axios.get('http://localhost:8000/users/comments/');
    return response.data;
  },
  addComment: async (payload: CommentPayload) => {
    const response = await api.post('users/comments/', payload);
    return response.data;
  },
};
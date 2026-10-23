import api from "../api/axios";

export const getMyProfile = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};
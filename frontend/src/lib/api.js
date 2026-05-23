import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export async function getUserFriends(params = {}) {
  const response = await axiosInstance.get("/users/friends", { params });
  return response.data;
}

export async function getRecommendedUsers(params = {}) {
  const response = await axiosInstance.get("/users", { params });
  return response.data;
}

export async function getOutgoingFriendReqs(params = {}) {
  const response = await axiosInstance.get("/users/outgoing-friend-requests", { params });
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests(params = {}) {
  const response = await axiosInstance.get("/users/friend-requests", { params });
  return response.data;
}

export async function getNotificationCounts() {
  const response = await axiosInstance.get("/users/notification-counts");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}


export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export async function getUnreadMessagesCount() {
  const response = await axiosInstance.get("/chat/unread-count");
  return response.data;
}

export async function aiTranslate(payload) {
  const response = await axiosInstance.post("/ai/translate", payload);
  return response.data;
}

export async function aiGrammar(payload) {
  const response = await axiosInstance.post("/ai/grammar", payload);
  return response.data;
}

export async function aiConversationStarters(payload) {
  const response = await axiosInstance.post("/ai/starters", payload);
  return response.data;
}

export async function aiVoiceFeedback(payload) {
  const response = await axiosInstance.post("/ai/voice-feedback", payload);
  return response.data;
}

export async function logProgressEvent(payload) {
  const response = await axiosInstance.post("/progress/events", payload);
  return response.data;
}

export async function getProgressDashboard() {
  const response = await axiosInstance.get("/progress/dashboard");
  return response.data;
}
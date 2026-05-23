import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);//to interact with stream user

export const upsertStreamUser = async (userData) => { //create stream user
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};

export const getUnreadChatCount = async (userId) => {
  try {
    const userIdStr = userId.toString();
    const response = await streamClient.getUnreadCount(userIdStr);
    return response?.total_unread_count || 0;
  } catch (error) {
    console.error("Error getting unread chat count:", error.message);
    return 0;
  }
};
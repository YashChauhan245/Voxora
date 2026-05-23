import { generateStreamToken, getUnreadChatCount } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUnreadMessagesCount(req, res) {
  try {
    const unreadCount = await getUnreadChatCount(req.user.id);
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.log("Error in getUnreadMessagesCount controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
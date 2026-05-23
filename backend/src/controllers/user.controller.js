import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

// Small helper for consistent pagination across list APIs.
const getPagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Build optional filters from query params.
const buildTextFilters = ({ q, nativeLanguage, learningLanguage, location, availability }) => {
  const filters = {};

  if (q) {
    filters.fullName = { $regex: q, $options: "i" };
  }

  if (nativeLanguage) {
    filters.nativeLanguage = String(nativeLanguage).toLowerCase();
  }

  if (learningLanguage) {
    filters.learningLanguage = String(learningLanguage).toLowerCase();
  }

  if (location) {
    filters.location = { $regex: location, $options: "i" };
  }

  if (availability) {
    filters.availability = String(availability).toLowerCase();
  }

  return filters;
};

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;
    const { page, limit, skip } = getPagination(req.query);

    const userFilters = buildTextFilters(req.query);
    // Exclude self and already-friends users, and only show onboarded users.
    const baseQuery = {
      ...userFilters,
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    };

    // Fetch data and count in parallel for faster response.
    const [recommendedUsers, total] = await Promise.all([
      User.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("fullName profilePic nativeLanguage learningLanguage location bio availability"),
      User.countDocuments(baseQuery),
    ]);

    res.status(200).json({
      users: recommendedUsers,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const { page, limit } = getPagination(req.query);
    const filters = buildTextFilters(req.query);

    // We first get all friend documents using populate.
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage location availability");

    const allFriends = user?.friends || [];

    // Simple JS-side filtering keeps this logic very easy to explain.
    const filteredFriends = allFriends.filter((friend) => {
      if (filters.fullName?.$regex) {
        const nameMatches = new RegExp(filters.fullName.$regex, "i").test(friend.fullName || "");
        if (!nameMatches) return false;
      }

      if (filters.nativeLanguage && friend.nativeLanguage !== filters.nativeLanguage) return false;
      if (filters.learningLanguage && friend.learningLanguage !== filters.learningLanguage) return false;
      if (filters.availability && friend.availability !== filters.availability) return false;

      if (filters.location?.$regex) {
        const locationMatches = new RegExp(filters.location.$regex, "i").test(friend.location || "");
        if (!locationMatches) return false;
      }

      return true;
    });

    const start = (page - 1) * limit;
  // Manual slice for pagination after filtering.
    const paginatedFriends = filteredFriends.slice(start, start + limit);

    res.status(200).json({
      friends: paginatedFriends,
      pagination: {
        page,
        limit,
        total: filteredFriends.length,
        hasMore: start + limit < filteredFriends.length,
      },
    });
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      // Prevent duplicates in both directions.
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists between you and this user" });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user into the other's friend list.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);

    // Incoming and accepted lists are fetched together for one clean response.
    const [incomingReqs, incomingCount, acceptedReqs, acceptedCount] = await Promise.all([
      FriendRequest.find({
        recipient: req.user.id,
        status: "pending",
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "fullName profilePic nativeLanguage learningLanguage"),
      FriendRequest.countDocuments({ recipient: req.user.id, status: "pending" }),
      FriendRequest.find({
        sender: req.user.id,
        status: "accepted",
      })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("recipient", "fullName profilePic"),
      FriendRequest.countDocuments({ sender: req.user.id, status: "accepted" }),
    ]);

    res.status(200).json({
      incomingReqs,
      acceptedReqs,
      pagination: {
        page,
        limit,
        incomingTotal: incomingCount,
        acceptedTotal: acceptedCount,
        incomingHasMore: page * limit < incomingCount,
        acceptedHasMore: page * limit < acceptedCount,
      },
    });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getNotificationCounts(req, res) {
  try {
    // Counts are lightweight and useful for navbar/sidebar badges.
    const [pendingRequests, acceptedConnections] = await Promise.all([
      FriendRequest.countDocuments({
        recipient: req.user.id,
        status: "pending",
      }),
      FriendRequest.countDocuments({
        sender: req.user.id,
        status: "accepted",
      }),
    ]);

    res.status(200).json({
      pendingRequests,
      acceptedConnections,
    });
  } catch (error) {
    console.log("Error in getNotificationCounts controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);

    // Return both rows and total count for frontend pagination.
    const [outgoingRequests, total] = await Promise.all([
      FriendRequest.find({
        sender: req.user.id,
        status: "pending",
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("recipient", "fullName profilePic nativeLanguage learningLanguage"),
      FriendRequest.countDocuments({ sender: req.user.id, status: "pending" }),
    ]);

    res.status(200).json({
      requests: outgoingRequests,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

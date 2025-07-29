import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { getLinkPreview, getPlatformInfo } from "../lib/linkPreview.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .populate("senderId", "fullName profilePic")
      .populate("reactions.userId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, encryptedText, encryptedImage, iv, isEncrypted } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Check for URLs in text and generate link preview
    let linkPreview = null;
    if (text && !isEncrypted) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex);
      if (urls && urls.length > 0) {
        try {
          const preview = await getLinkPreview(urls[0]);
          const platformInfo = getPlatformInfo(urls[0]);
          linkPreview = {
            ...preview,
            platform: platformInfo,
          };
        } catch (error) {
          console.log("Error generating link preview:", error);
        }
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      encryptedText,
      encryptedImage,
      iv,
      isEncrypted,
      linkPreview,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    console.log("Backend: Adding reaction", { messageId, emoji, userId });

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      console.log("Backend: Message not found", messageId);
      return res.status(404).json({ message: "Message not found" });
    }

    console.log("Backend: Found message", message._id);

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (reaction) => reaction.userId.toString() === userId.toString() && reaction.emoji === emoji
    );

    if (existingReaction) {
      console.log("Backend: User already reacted with this emoji");
      return res.status(400).json({ message: "You already reacted with this emoji" });
    }

    // Add reaction
    message.reactions.push({
      userId,
      emoji,
    });

    await message.save();
    await message.populate("reactions.userId", "fullName profilePic");

    console.log("Backend: Reaction added successfully", message.reactions);

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in addReaction controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove reaction from message
export const removeReaction = async (req, res) => {
  try {
    const { messageId, reactionId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Find and remove the reaction
    const reactionIndex = message.reactions.findIndex(
      (reaction) => reaction._id.toString() === reactionId && reaction.userId.toString() === userId.toString()
    );

    if (reactionIndex === -1) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    message.reactions.splice(reactionIndex, 1);
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in removeReaction controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { query } = req.query;
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
      $text: { $search: query },
    })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in searchMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

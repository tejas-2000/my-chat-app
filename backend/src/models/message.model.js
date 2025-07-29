import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    encryptedText: {
      type: String,
    },
    encryptedImage: {
      type: String,
    },
    iv: {
      type: String,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    linkPreview: {
      url: String,
      title: String,
      description: String,
      image: String,
      siteName: String,
      type: String,
      domain: String,
      platform: {
        name: String,
        icon: String,
        color: String,
        type: String,
      },
    },
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

// Create text index for search
messageSchema.index({ text: "text" });

export default Message;

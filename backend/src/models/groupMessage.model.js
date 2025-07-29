import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        senderId: {
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

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

// Create text index for search
groupMessageSchema.index({ text: "text" });

export default GroupMessage; 
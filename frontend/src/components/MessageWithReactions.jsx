import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import ReactionPicker from "./ReactionPicker";
import LinkPreview from "./LinkPreview";
import SocialShare from "./SocialShare";
import { X, Share2 } from "lucide-react";

const MessageWithReactions = ({ message, onAddReaction, onRemoveReaction, isGroupMessage = false }) => {
    const { authUser } = useAuthStore();
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showHoverReactions, setShowHoverReactions] = useState(false);

    const handleAddReaction = async (emoji) => {
        console.log("MessageWithReactions: Adding reaction", emoji, "to message", message._id);
        console.log("MessageWithReactions: Full message object", message);
        await onAddReaction(message._id, emoji);
    };

    const handleRemoveReaction = async (reactionId) => {
        console.log("MessageWithReactions: Removing reaction", reactionId, "from message", message._id);
        await onRemoveReaction(message._id, reactionId);
    };

    // Group reactions by emoji
    const groupedReactions = message.reactions?.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction);
        return acc;
    }, {}) || {};

    const isOwnMessage = message.senderId._id === authUser._id;

    const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

    return (
        <div
            className="group relative"
            onMouseEnter={() => setShowHoverReactions(true)}
            onMouseLeave={() => setShowHoverReactions(false)}
        >
            {/* Hover Reaction Box - Instagram Style */}
            {showHoverReactions && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-2 py-1 z-50">
                    <div className="flex items-center gap-1">
                        {quickEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddReaction(emoji);
                                }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg hover:scale-125 transform duration-150"
                                title={`React with ${emoji}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
            >
                {!isOwnMessage && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {message.senderId.fullName}
                    </div>
                )}

                {message.text && <p className="text-sm">{message.text}</p>}

                {message.image && (
                    <img
                        src={message.image}
                        alt="Message"
                        className="mt-2 rounded-lg max-w-full"
                    />
                )}

                {message.linkPreview && <LinkPreview linkPreview={message.linkPreview} />}

                {/* Reactions */}
                {Object.keys(groupedReactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                            const userReaction = reactions.find(r => r.userId._id === authUser._id);
                            return (
                                <button
                                    key={emoji}
                                    onClick={() => userReaction ? handleRemoveReaction(userReaction._id) : handleAddReaction(emoji)}
                                    className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${userReaction
                                        ? "bg-blue-200 dark:bg-blue-800"
                                        : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                                        }`}
                                >
                                    <span>{emoji}</span>
                                    <span>{reactions.length}</span>
                                    {userReaction && (
                                        <X size={10} className="ml-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>

            {/* Action buttons - only show on hover */}
            <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <div className="relative">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Share message">
                        <Share2 size={16} />
                    </button>
                    <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <SocialShare message={message} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageWithReactions; 
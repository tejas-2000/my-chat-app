import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore.jsx";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";
import MessageWithReactions from "./MessageWithReactions";
import MessageSearch from "./MessageSearch";
import { Loader, Search } from "lucide-react";

const GroupChatContainer = ({ selectedGroup }) => {
    const { groupMessages, getGroupMessages, sendGroupMessage, isGroupMessagesLoading, subscribeToGroupMessages, unsubscribeFromGroupMessages, addGroupReaction, removeGroupReaction, searchGroupMessages } = useGroupStore();
    const { authUser } = useAuthStore();
    const messagesEndRef = useRef(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (selectedGroup) {
            getGroupMessages(selectedGroup._id);
            subscribeToGroupMessages();
        }

        return () => {
            unsubscribeFromGroupMessages();
        };
    }, [selectedGroup, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [groupMessages]);

    const handleSendMessage = async (messageData) => {
        await sendGroupMessage(messageData);
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const results = await searchGroupMessages(query, selectedGroup._id);
        setSearchResults(results);
    };

    if (!selectedGroup) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Select a group to start chatting
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Choose a group from the sidebar to view messages
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
            {/* Group Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <img
                        src={selectedGroup.groupPic || "/avatar.png"}
                        alt={selectedGroup.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedGroup.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedGroup.members.length} members
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${showSearch ? "bg-blue-100 dark:bg-blue-900" : ""
                            }`}
                        title="Search messages"
                    >
                        <Search size={16} />
                    </button>
                </div>
            </div>

            {showSearch && (
                <MessageSearch
                    onSearch={handleSearch}
                    searchResults={searchResults}
                    isGroup={true}
                />
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isGroupMessagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader className="animate-spin" />
                    </div>
                ) : groupMessages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    groupMessages.map((message) => (
                        <div
                            key={message._id}
                            className={`flex ${message.senderId._id === authUser._id ? "justify-end" : "justify-start"}`}
                        >
                            <MessageWithReactions
                                message={message}
                                onAddReaction={addGroupReaction}
                                onRemoveReaction={removeGroupReaction}
                                isGroupMessage={true}
                            />
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <MessageInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
};

export default GroupChatContainer; 
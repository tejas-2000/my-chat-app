import { useChatStore } from "../store/useChatStore.jsx";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import MessageWithReactions from "./MessageWithReactions";
import MessageSearch from "./MessageSearch";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    addReaction,
    removeReaction,
    searchMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = await searchMessages(query, selectedUser._id);
    setSearchResults(results);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader
        onToggleSearch={() => setShowSearch(!showSearch)}
        showSearch={showSearch}
      />
      {showSearch && (
        <MessageSearch
          onSearch={handleSearch}
          searchResults={searchResults}
          isGroup={false}
        />
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.senderId._id === authUser._id ? "justify-end" : "justify-start"}`}
          >
            <MessageWithReactions
              message={message}
              onAddReaction={addReaction}
              onRemoveReaction={removeReaction}
            />
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput onSendMessage={async (messageData) => {
        const { selectedUser, messages } = useChatStore.getState();
        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          useChatStore.setState({ messages: [...messages, res.data] });
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
        }
      }} />
    </div>
  );
};
export default ChatContainer;

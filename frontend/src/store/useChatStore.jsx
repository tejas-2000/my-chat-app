import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useEncryptionStore } from "./useEncryptionStore.jsx";
import { showBrowserNotification } from "../lib/utils";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);

      // Decrypt all messages
      const decryptedMessages = await Promise.all(
        res.data.map(async (message) => {
          return await useEncryptionStore.getState().decryptMessage(
            message,
            message.senderId,
            false
          );
        })
      );

      set({ messages: decryptedMessages });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      // Encrypt message before sending
      const encryptedData = await useEncryptionStore.getState().encryptMessage(
        messageData,
        selectedUser._id,
        false
      );

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, encryptedData);

      // Decrypt the received message
      const decryptedMessage = await useEncryptionStore.getState().decryptMessage(
        res.data,
        selectedUser._id,
        false
      );

      set({ messages: [...messages, decryptedMessage] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", async (newMessage) => {
      const { selectedUser, authUser } = get();

      // Decrypt incoming message
      const decryptedMessage = await useEncryptionStore.getState().decryptMessage(
        newMessage,
        newMessage.senderId,
        false
      );

      // If the message is from the currently selected user, add to chat
      const isMessageSentFromSelectedUser = decryptedMessage.senderId === selectedUser?._id;
      if (isMessageSentFromSelectedUser) {
        set({
          messages: [...get().messages, decryptedMessage],
        });
      } else {
        // Show a toast notification for new messages in other chats
        const sender = get().users.find((u) => u._id === decryptedMessage.senderId);
        toast.custom((t) => (
          <div className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
            <span>New message from <b>{sender ? sender.fullName : "Someone"}</b></span>
            <button onClick={() => {
              set({ selectedUser: sender });
              toast.dismiss(t.id);
            }} className="ml-2 underline">Open</button>
          </div>
        ));
        // Show browser notification if not focused
        if (document.visibilityState !== "visible") {
          showBrowserNotification(
            `New message from ${sender ? sender.fullName : "Someone"}`,
            { body: decryptedMessage.text || "Image", icon: sender?.profilePic || "/avatar.png" }
          );
        }
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // Add reaction to message
  addReaction: async (messageId, emoji) => {
    console.log("useChatStore: Adding reaction", emoji, "to message", messageId);
    try {
      console.log("useChatStore: Making API call to", `/messages/${messageId}/reactions`);
      console.log("useChatStore: Request body", { emoji });

      const res = await axiosInstance.post(`/messages/${messageId}/reactions`, { emoji });
      console.log("useChatStore: Response received", res.data);

      // Update the message in the messages array
      set((state) => {
        const updatedMessages = state.messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        );
        console.log("useChatStore: Updated messages", updatedMessages);
        return { messages: updatedMessages };
      });
    } catch (error) {
      console.error("useChatStore: Error adding reaction", error);
      console.error("useChatStore: Error response", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to add reaction");
    }
  },

  // Remove reaction from message
  removeReaction: async (messageId, reactionId) => {
    try {
      const res = await axiosInstance.delete(`/messages/${messageId}/reactions/${reactionId}`);
      // Update the message in the messages array
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove reaction");
    }
  },

  // Search messages
  searchMessages: async (query, userId) => {
    if (!query.trim()) return [];

    try {
      const res = await axiosInstance.get(`/messages/search/${userId}?query=${encodeURIComponent(query)}`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to search messages");
      return [];
    }
  },
}));

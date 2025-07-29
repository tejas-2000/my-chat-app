import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useEncryptionStore } from "./useEncryptionStore.jsx";
import { showBrowserNotification } from "../lib/utils";

export const useGroupStore = create((set, get) => ({
    groups: [],
    selectedGroup: null,
    groupMessages: [],
    isGroupsLoading: false,
    isGroupMessagesLoading: false,
    isCreatingGroup: false,

    // Get all groups for the current user
    getGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("/groups/user-groups");
            set({ groups: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load groups");
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    // Create a new group
    createGroup: async (groupData) => {
        set({ isCreatingGroup: true });
        try {
            const res = await axiosInstance.post("/groups/create", groupData);
            set((state) => ({
                groups: [...state.groups, res.data],
                isCreatingGroup: false,
            }));
            toast.success("Group created successfully!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
            set({ isCreatingGroup: false });
            throw error;
        }
    },

    // Get group details
    getGroupDetails: async (groupId) => {
        try {
            const res = await axiosInstance.get(`/groups/${groupId}`);
            set({ selectedGroup: res.data });
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load group details");
        }
    },

    // Get group messages
    getGroupMessages: async (groupId) => {
        set({ isGroupMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/groups/${groupId}/messages`);

            // Decrypt all messages
            const decryptedMessages = await Promise.all(
                res.data.map(async (message) => {
                    return await useEncryptionStore.getState().decryptMessage(
                        message,
                        groupId,
                        true
                    );
                })
            );

            set({ groupMessages: decryptedMessages });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load group messages");
        } finally {
            set({ isGroupMessagesLoading: false });
        }
    },

    // Send message to group
    sendGroupMessage: async (messageData) => {
        const { selectedGroup, groupMessages } = get();
        if (!selectedGroup) return;

        try {
            // Encrypt message before sending
            const encryptedData = await useEncryptionStore.getState().encryptMessage(
                messageData,
                selectedGroup._id,
                true
            );

            const res = await axiosInstance.post(
                `/groups/${selectedGroup._id}/send-message`,
                encryptedData
            );

            // Decrypt the received message
            const decryptedMessage = await useEncryptionStore.getState().decryptMessage(
                res.data,
                selectedGroup._id,
                true
            );

            set({ groupMessages: [...groupMessages, decryptedMessage] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    // Add member to group
    addMemberToGroup: async (memberId) => {
        const { selectedGroup } = get();
        if (!selectedGroup) return;

        try {
            const res = await axiosInstance.post(
                `/groups/${selectedGroup._id}/add-member`,
                { memberId }
            );
            set({ selectedGroup: res.data });
            toast.success("Member added successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add member");
        }
    },

    // Remove member from group
    removeMemberFromGroup: async (memberId) => {
        const { selectedGroup } = get();
        if (!selectedGroup) return;

        try {
            const res = await axiosInstance.delete(
                `/groups/${selectedGroup._id}/remove-member/${memberId}`
            );
            set({ selectedGroup: res.data });
            toast.success("Member removed successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove member");
        }
    },

    // Subscribe to group messages
    subscribeToGroupMessages: () => {
        const { selectedGroup } = get();
        if (!selectedGroup) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newGroupMessage", async (newMessage) => {
            const { selectedGroup, groups } = get();

            // Decrypt incoming message
            const decryptedMessage = await useEncryptionStore.getState().decryptMessage(
                newMessage,
                newMessage.groupId,
                true
            );

            if (selectedGroup && decryptedMessage.groupId === selectedGroup._id) {
                set((state) => ({
                    groupMessages: [...state.groupMessages, decryptedMessage],
                }));
            } else {
                // Show a toast notification for new messages in other groups
                const group = groups.find((g) => g._id === decryptedMessage.groupId);
                toast.custom((t) => (
                    <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
                        <span>New message in <b>{group ? group.name : "a group"}</b></span>
                        <button onClick={() => {
                            set({ selectedGroup: group });
                            toast.dismiss(t.id);
                        }} className="ml-2 underline">Open</button>
                    </div>
                ));
                // Show browser notification if not focused
                if (document.visibilityState !== "visible") {
                    showBrowserNotification(
                        `New message in ${group ? group.name : "a group"}`,
                        { body: decryptedMessage.text || "Image", icon: group?.groupPic || "/avatar.png" }
                    );
                }
            }
        });
    },

    // Unsubscribe from group messages
    unsubscribeFromGroupMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newGroupMessage");
    },

    // Set selected group
    setSelectedGroup: (group) => set({ selectedGroup: group }),

    // Clear group data
    clearGroupData: () => set({ selectedGroup: null, groupMessages: [] }),

    // Add reaction to group message
    addGroupReaction: async (messageId, emoji) => {
        try {
            const res = await axiosInstance.post(`/groups/messages/${messageId}/reactions`, { emoji });
            // Update the message in the groupMessages array
            set((state) => ({
                groupMessages: state.groupMessages.map((msg) =>
                    msg._id === messageId ? res.data : msg
                ),
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add reaction");
        }
    },

    // Remove reaction from group message
    removeGroupReaction: async (messageId, reactionId) => {
        try {
            const res = await axiosInstance.delete(`/groups/messages/${messageId}/reactions/${reactionId}`);
            // Update the message in the groupMessages array
            set((state) => ({
                groupMessages: state.groupMessages.map((msg) =>
                    msg._id === messageId ? res.data : msg
                ),
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove reaction");
        }
    },

    // Search group messages
    searchGroupMessages: async (query, groupId) => {
        if (!query.trim()) return [];

        try {
            const res = await axiosInstance.get(`/groups/${groupId}/search?query=${encodeURIComponent(query)}`);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to search group messages");
            return [];
        }
    },
})); 
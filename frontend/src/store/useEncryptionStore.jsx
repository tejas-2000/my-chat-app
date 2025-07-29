import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUserKeys, importKey, encrypt, decrypt, deriveSharedKey } from "../lib/crypto";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useEncryptionStore = create(
    persist(
        (set, get) => ({
            userKey: null,
            userKeyString: "",
            sharedKeys: {}, // { userId: CryptoKey }
            isEncryptionEnabled: true,

            // Initialize encryption for a user
            initializeEncryption: async (user) => {
                try {
                    // Generate new keys if user doesn't have them
                    if (!user.encryptionKey) {
                        const { key, exportedKey } = await generateUserKeys();

                        // Save key to backend
                        await axiosInstance.put("/auth/encryption-key", {
                            encryptionKey: exportedKey,
                        });

                        set({
                            userKey: key,
                            userKeyString: exportedKey,
                        });
                    } else {
                        // Import existing key
                        const key = await importKey(user.encryptionKey);
                        set({
                            userKey: key,
                            userKeyString: user.encryptionKey,
                        });
                    }
                } catch (error) {
                    console.error("Failed to initialize encryption:", error);
                    toast.error("Failed to initialize encryption");
                }
            },

            // Get or create shared key for a conversation
            getSharedKey: async (otherUserId) => {
                const { userKey, sharedKeys } = get();

                if (sharedKeys[otherUserId]) {
                    return sharedKeys[otherUserId];
                }

                // For simplicity, we'll use the current user's key
                // In a real implementation, you'd exchange keys securely
                set((state) => ({
                    sharedKeys: {
                        ...state.sharedKeys,
                        [otherUserId]: userKey,
                    },
                }));

                return userKey;
            },

            // Get or create shared key for a group
            getGroupSharedKey: async (groupId) => {
                const { userKey, sharedKeys } = get();
                const groupKeyId = `group_${groupId}`;

                if (sharedKeys[groupKeyId]) {
                    return sharedKeys[groupKeyId];
                }

                // For groups, we'll use a derived key
                const groupKey = await deriveSharedKey(userKey, groupId);

                set((state) => ({
                    sharedKeys: {
                        ...state.sharedKeys,
                        [groupKeyId]: groupKey,
                    },
                }));

                return groupKey;
            },

            // Encrypt message data
            encryptMessage: async (data, recipientId, isGroup = false) => {
                const { isEncryptionEnabled } = get();

                if (!isEncryptionEnabled) {
                    return { data, isEncrypted: false };
                }

                try {
                    const key = isGroup
                        ? await get().getGroupSharedKey(recipientId)
                        : await get().getSharedKey(recipientId);

                    const encrypted = await encrypt(data, key);

                    return {
                        encryptedText: encrypted.data,
                        iv: encrypted.iv,
                        isEncrypted: true,
                    };
                } catch (error) {
                    console.error("Encryption failed:", error);
                    toast.error("Failed to encrypt message");
                    return { data, isEncrypted: false };
                }
            },

            // Decrypt message data
            decryptMessage: async (message, senderId, isGroup = false) => {
                const { isEncryptionEnabled } = get();

                if (!isEncryptionEnabled || !message.isEncrypted) {
                    return message;
                }

                try {
                    const key = isGroup
                        ? await get().getGroupSharedKey(senderId)
                        : await get().getSharedKey(senderId);

                    const decrypted = await decrypt(message.encryptedText, message.iv, key);

                    if (decrypted) {
                        return {
                            ...message,
                            text: decrypted.text,
                            image: decrypted.image,
                            isEncrypted: false,
                        };
                    }
                } catch (error) {
                    console.error("Decryption failed:", error);
                }

                return message;
            },

            // Toggle encryption
            toggleEncryption: () => {
                set((state) => ({
                    isEncryptionEnabled: !state.isEncryptionEnabled,
                }));
            },

            // Clear all keys (for logout)
            clearKeys: () => {
                set({
                    userKey: null,
                    userKeyString: "",
                    sharedKeys: {},
                });
            },
        }),
        {
            name: "encryption-storage",
            partialize: (state) => ({
                userKeyString: state.userKeyString,
                isEncryptionEnabled: state.isEncryptionEnabled,
            }),
        }
    )
); 
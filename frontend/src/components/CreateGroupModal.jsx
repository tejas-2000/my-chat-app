import { useState } from "react";
import { X, Users, Image as ImageIcon } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore.jsx";
import { useChatStore } from "../store/useChatStore.jsx";

const CreateGroupModal = ({ isOpen, onClose }) => {
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupPic, setGroupPic] = useState("");

    const { createGroup, isCreatingGroup } = useGroupStore();
    const { users } = useChatStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return;

        try {
            const memberIds = selectedUsers.map((user) => user._id);
            await createGroup({
                name: groupName,
                description,
                memberIds,
                groupPic,
            });

            // Reset form
            setGroupName("");
            setDescription("");
            setSelectedUsers([]);
            setGroupPic("");
            onClose();
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers((prev) =>
            prev.find((u) => u._id === user._id)
                ? prev.filter((u) => u._id !== user._id)
                : [...prev, user]
        );
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setGroupPic(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create New Group
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Group Picture */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            {groupPic ? (
                                <img
                                    src={groupPic}
                                    alt="Group"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <ImageIcon size={24} className="text-gray-500" />
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer">
                                <ImageIcon size={12} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Group name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <textarea
                        placeholder="Group description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                        rows={3}
                    />

                    {/* Select Members */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Add Members
                        </h3>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => toggleUserSelection(user)}
                                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedUsers.find((u) => u._id === user._id)
                                        ? "bg-blue-100 dark:bg-blue-900"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    <img
                                        src={user.profilePic || "/avatar.png"}
                                        alt={user.fullName}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {user.fullName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Selected ({selectedUsers.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full text-xs"
                                    >
                                        <span className="text-blue-800 dark:text-blue-200">
                                            {user.fullName}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => toggleUserSelection(user)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!groupName.trim() || isCreatingGroup}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isCreatingGroup ? "Creating..." : "Create Group"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal; 
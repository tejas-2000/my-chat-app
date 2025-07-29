import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore.jsx";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore.jsx";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, MessageCircle, Plus } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { getGroups, groups, selectedGroup, setSelectedGroup, isGroupsLoading } = useGroupStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "groups"
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading || isGroupsLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex space-x-1 bg-base-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("chats")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === "chats"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <div className="flex items-center gap-1">
                <MessageCircle size={16} />
                <span className="hidden lg:block">Chats</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === "groups"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span className="hidden lg:block">Groups</span>
              </div>
            </button>
          </div>

          {activeTab === "groups" && (
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="p-1 rounded-md hover:bg-base-300 transition-colors"
              title="Create Group"
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        {/* Online filter - only for chats */}
        {activeTab === "chats" && (
          <div className="hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
          </div>
        )}
      </div>

      <div className="overflow-y-auto w-full py-3">
        {activeTab === "chats" ? (
          // Individual Chats
          <>
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => {
                  setSelectedUser(user);
                  setSelectedGroup(null);
                }}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500 
                      rounded-full ring-2 ring-zinc-900"
                    />
                  )}
                </div>

                {/* User info - only visible on larger screens */}
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-4">No users found</div>
            )}
          </>
        ) : (
          // Groups
          <>
            {groups.map((group) => (
              <button
                key={group._id}
                onClick={() => {
                  setSelectedGroup(group);
                  setSelectedUser(null);
                }}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={group.groupPic || "/avatar.png"}
                    alt={group.name}
                    className="size-12 object-cover rounded-full"
                  />
                </div>

                {/* Group info - only visible on larger screens */}
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{group.name}</div>
                  <div className="text-sm text-zinc-400">
                    {group.members.length} members
                  </div>
                </div>
              </button>
            ))}

            {groups.length === 0 && (
              <div className="text-center text-zinc-500 py-4">
                <p>No groups yet</p>
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="text-blue-500 hover:text-blue-600 text-sm mt-2"
                >
                  Create your first group
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      />
    </aside>
  );
};
export default Sidebar;

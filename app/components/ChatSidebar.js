'use client';

import { useEffect, useState } from 'react';

export default function ChatSidebar({ selectedChat, setSelectedChat, token }) {
  const [chats, setChats] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [creating, setCreating] = useState(false);

  const currentUserId = (() => {
    try {
      const parsed = JSON.parse(atob(token.split('.')[1]));
      return parsed.userId;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch('/api/fetchallchats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data)) setChats(data);
        else setChats([]);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setChats([]);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/allusers?search=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (token) {
      fetchChats();
      fetchUsers();
    }
  }, [token, searchQuery]);

  const getSenderName = (users) => {
    if (!currentUserId) return 'Unknown';
    return users.find((u) => u._id !== currentUserId)?.name || 'Unknown';
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length < 2) {
      return alert('Please enter a group name and select at least 2 users');
    }

    setCreating(true);

    const usersArray = selectedUsers;

    const formData = new FormData();
    formData.append('name', groupName);
    formData.append('users', JSON.stringify(usersArray));

    try {
      const res = await fetch('/api/groupchat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const newGroup = await res.json();

      if (!res.ok) throw new Error(newGroup.message || 'Failed to create group');

      setChats((prev) => [newGroup, ...prev]);
      setShowGroupModal(false);
      setGroupName('');
      setSelectedUsers([]);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  return (
    <div className="w-full md:w-1/3 h-full bg-white shadow-lg p-4 overflow-y-auto relative">
      <h2 className="text-xl font-semibold mb-4">My Chats</h2>

      <button
        className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4"
        onClick={() => setShowGroupModal(true)}
      >
        New Group Chat +
      </button>

      {chats.length > 0 ? (
        chats.map((chat) => (
          <div
            key={chat._id}
            className={`p-3 rounded mb-2 cursor-pointer ${
              selectedChat?._id === chat._id
                ? 'bg-teal-400 text-white'
                : 'bg-gray-100'
            }`}
            onClick={() => setSelectedChat(chat)}
          >
            <div className="font-semibold">
              {chat.isGroupChat ? chat.chatName : getSenderName(chat.users)}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {chat.latestMessage
                ? `${chat.latestMessage.sender?.name || 'Someone'}: ${chat.latestMessage.content}`
                : 'No messages yet'}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No chats to show.</p>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Create Group Chat</h3>

            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />

            <input
              type="text"
              placeholder="Search Users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />

            <div className="max-h-60 overflow-y-auto mb-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 cursor-pointer"
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <span>{user.name}</span>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    readOnly
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

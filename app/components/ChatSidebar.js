'use client';
import { useEffect, useState } from 'react';

export default function ChatSidebar({ selectedChat, setSelectedChat, token }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch('/api/fetchallchats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setChats(data);
        } else {
          console.error('Chats fetch response is not an array:', data);
          setChats([]); // fallback
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        setChats([]);
      }
    };

    if (token) {
      fetchChats();
    }
  }, [token]);

  const getSenderName = (chatUsers) => {
    try {
      const parsed = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = parsed.userId;
      return chatUsers.find((u) => u._id !== currentUserId)?.name || 'Unknown';
    } catch (err) {
      return 'Unknown';
    }
  };

  return (
    <div className="w-full md:w-1/3 h-full bg-white shadow-lg p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">My Chats</h2>
      {/* <button className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4">
        New Group Chat +
      </button> */}

      {Array.isArray(chats) && chats.length > 0 ? (
        chats.map((chat, idx) => (
          <div
            key={idx}
            className={`p-3 rounded mb-2 cursor-pointer ${
              selectedChat?._id === chat._id
                ? 'bg-teal-400 text-white'
                : 'bg-gray-100'
            }`}
            onClick={() => setSelectedChat(chat)}
          >
            <div className="font-semibold">
              {chat.isGroupChat
                ? chat.chatName
                : getSenderName(chat.users)}
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
    </div>
  );
}

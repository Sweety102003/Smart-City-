'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ChatBox({ chat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !chat?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/${chat._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(res.data);

        const decoded = JSON.parse(atob(token.split('.')[1]));
        setLoggedInUserId(decoded.userId);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [chat]);

  const handleSendMessage = async () => {
    const token = localStorage.getItem('token');
    if (!newMessage.trim() || !chat?._id || !token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const res = await axios.post(
        '/api/postmessage',
        {
          content: newMessage,
          chatId: chat._id,
        },
        config
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full border-l border-gray-300">
      {/* Header */}
      <div className="px-4 py-2 border-b bg-white shadow-sm font-semibold text-lg">
        {chat.isGroupChat
          ? chat.chatName
          : chat.users.find((u) => u._id !== loggedInUserId)?.name}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100 flex flex-col">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender._id === loggedInUserId;

          return (
            <div
              key={msg._id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs break-words ${
                  isOwnMessage
                    ? 'bg-green-200 text-right rounded-br-none'
                    : 'bg-white text-left rounded-bl-none'
                }`}
              >
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  {msg.sender.name}
                </div>
                <div className="text-sm">{msg.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t flex gap-2 bg-white">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded px-3 py-2 outline-none"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ChatSidebar from '../components/ChatSidebar';
import ChatBox from '../components/ChatBox';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleSearch = async () => {
    if (!query) return;

    try {
      setLoading(true);
      const res = await axios.get(`/api/allusers?search=${query}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post('/api/chats', { userId }, config);
      setSelectedChat(data);
    } catch (error) {
      console.error('Error accessing chat:', error);
    }
  };

  return (
    <div className="p-4 w-[350px]">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded mr-2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>

        {loading && <p className="mt-4">Loading...</p>}

        <ul className="mt-4 space-y-2">
          {users.map((user) => (
            <li
              key={user._id}
              className="border p-3 rounded bg-gray-50 hover:bg-blue-100 cursor-pointer"
              onClick={() => accessChat(user._id)}
            >
              <p><strong>Name:</strong> {user.name}</p>
              <p><stronag>Email:</stronag> {user.email}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-[85vh] flex">
        <ChatSidebar
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          token={token}
        />
        <ChatBox chat={selectedChat} />
      </div>
    </div>
  );
}

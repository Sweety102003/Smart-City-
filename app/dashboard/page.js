'use client';

import ChatSidebar from '../components/ChatSidebar';
import ChatBox from '../components/ChatBox';
import ViewerPage from '../viewer/page.js'; // your 3D viewer
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Chat section */}
      <div className="w-1/3 border-r overflow-y-auto">
        <ChatSidebar
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          token={token}
        />
      </div>

      <div className="w-1/3 flex flex-col">
        <ChatBox chat={selectedChat} />
      </div>

      {/* 3D Model Viewer */}
      <div className="w-1/3 bg-gray-200">
        <ViewerPage />{/* Your 3D Viewer Component */}
      </div>
    </div>
  );
}

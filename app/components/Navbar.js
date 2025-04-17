"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    // Check if we're in the browser environment
    
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
  
      if (token) {
        try {
          // Only import jwtDecode dynamically if in browser
          import('jwt-decode').then(({ jwtDecode }) => {
            const decoded = jwtDecode(token);
            setUsername(decoded.userId || decoded.username || decoded.email || "User");
            setIsLoggedIn(true);
          });
        } catch (error) {
          console.error("Invalid token:", error);
          setIsLoggedIn(false);
        }
      }
    
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUsername(null);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-black">
      <div className="text-xl font-bold text-purple-400 cursor-pointer" onClick={() => router.push('/')}>SmartCityOS</div>
      <nav className="space-x-6 hidden md:block">
        <a href="/maps" className="hover:text-purple-400 hover:text-lg transition-all duration-200">Live Insights</a>
        <a href="/viewer" className="hover:text-purple-400 hover:text-lg transition-all duration-200">3D Visualization</a>
        <a href="/" className="hover:text-purple-400 hover:text-lg transition-all duration-200">About</a>
      </nav>
      <div className="space-x-4">
        {isLoggedIn ? (
          <>
            <span className="text-gray-400">Hi, {username}</span>
            <button
              onClick={handleLogout}
              className="border px-4 py-2 rounded border-gray-600 hover:border-white cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/signin")}
            className="border px-4 py-2 rounded border-gray-600 hover:border-white cursor-pointer"
          >
            Login
          </button>
        )}
        <button 
          onClick={() => router.push("/get-started")}
          className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600 cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </header>
  );
}
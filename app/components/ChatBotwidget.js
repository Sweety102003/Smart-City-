"use client";

import { useState, useEffect, useRef } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { RiCloseFill } from "react-icons/ri";
import { MdOutlineZoomOutMap, MdOutlineZoomInMap } from "react-icons/md";
import axios from "axios";

// Integrated components
const ChatBox = ({ chat, containerHeight }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loggedInUserId, setLoggedInUserId] = useState("");
    const [groupUsers, setGroupUsers] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !chat?._id) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`/api/messages/${chat._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMessages(res.data);

                const decoded = JSON.parse(atob(token.split(".")[1]));
                setLoggedInUserId(decoded.userId);

                if (chat.isGroupChat) {
                    const uniqueUsers = chat.users.filter(
                        (value, index, self) => self.findIndex((u) => u._id === value._id) === index
                    );
                    setGroupUsers(uniqueUsers.filter((user) => user._id !== decoded.userId));
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        fetchMessages();
    }, [chat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        const token = localStorage.getItem("token");
        if (!newMessage.trim() || !chat?._id || !token) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };
            const res = await axios.post(
                "/api/postmessage",
                {
                    content: newMessage,
                    chatId: chat._id,
                },
                config
            );
            setMessages((prev) => [...prev, res.data]);
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a chat to start messaging
            </div>
        );
    }

    const messagesContainerHeight = containerHeight - 140; // Adjust based on header and input heights

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2 border-b bg-white shadow-sm font-semibold">
                {chat.isGroupChat ? (
                    <>
                        <div className="text-gray-800">{chat.chatName}</div>
                        <div className="text-xs text-gray-600">
                            <span className="font-medium">Participants:</span>{" "}
                            {groupUsers.length > 0 ? (
                                <span className="flex flex-wrap gap-1">
                                    {groupUsers.map((user) => (
                                        <span key={user._id} className="text-blue-600">
                                            {user.name}
                                        </span>
                                    ))}
                                </span>
                            ) : (
                                <span>No other participants</span>
                            )}
                        </div>
                    </>
                ) : (
                    chat.users.find((u) => u._id !== loggedInUserId)?.name
                )}
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
                style={{ height: `${messagesContainerHeight}px` }}
            >
                {messages.map((msg) => {
                    const isOwnMessage = msg.sender._id === loggedInUserId;

                    return (
                        <div
                            key={msg._id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`p-2 rounded-lg max-w-xs break-words ${isOwnMessage
                                        ? "bg-blue-100 text-right rounded-br-none"
                                        : "bg-white border border-gray-200 text-left rounded-bl-none shadow-sm"
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
                <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-2 w-full border-t text-black flex gap-2 bg-white">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 w-3/4 border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-purple-400 w-1/4 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

const ChatSidebar = ({ selectedChat, setSelectedChat, token, containerHeight }) => {
    const [chats, setChats] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [creating, setCreating] = useState(false);

    const currentUserId = (() => {
        try {
            if (!token) return null;
            const parsed = JSON.parse(atob(token.split(".")[1]));
            return parsed.userId;
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch("/api/fetchallchats", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (Array.isArray(data)) setChats(data);
                else setChats([]);
            } catch (error) {
                console.error("Error fetching chats:", error);
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
                console.error("Error fetching users:", error);
            }
        };

        if (token) {
            fetchChats();
            fetchUsers();
        }
    }, [token, searchQuery]);

    const getSenderName = (users) => {
        if (!currentUserId) return "Unknown";
        return users.find((u) => u._id !== currentUserId)?.name || "Unknown";
    };

    const handleCreateGroup = async () => {
        if (!groupName || selectedUsers.length < 2) {
            return alert("Please enter a group name and select at least 2 users");
        }

        setCreating(true);

        const usersArray = selectedUsers;

        const formData = new FormData();
        formData.append("name", groupName);
        formData.append("users", JSON.stringify(usersArray));

        try {
            const res = await fetch("/api/groupchat", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const newGroup = await res.json();

            if (!res.ok) throw new Error(newGroup.message || "Failed to create group");

            setChats((prev) => [newGroup, ...prev]);
            setShowGroupModal(false);
            setGroupName("");
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

    const chatListHeight = containerHeight - 90; // Adjust based on header height

    return (
        <div className="w-full lg:w-1/3 h-full bg-white shadow-sm overflow-hidden border-r border-gray-200">
            <div className="p-3 border-b">
                <h2 className="text-base text-black font-semibold mb-2">My Chats</h2>

                <button
                    className="w-full bg-purple-400 text-black py-1.5 px-3 rounded text-xs hover:bg-purple-500 transition-colors"
                    onClick={() => setShowGroupModal(true)}
                >
                    New Group Chat +
                </button>
            </div>

            <div
                className="overflow-y-auto"
                style={{ height: `${chatListHeight}px` }}>
                {chats.length > 0 ? (
                    chats.map((chat) => (
                        <div
                            key={chat._id}
                            className={`p-2.5 mx-2 my-1 rounded cursor-pointer transition-colors ${selectedChat?._id === chat._id
                                    ? "bg-blue-100 border-blue-200 border"
                                    : "bg-gray-50 hover:bg-gray-100"
                                }`}
                            onClick={() => setSelectedChat(chat)}
                        >
                            <div className="font-medium text-black text-sm">
                                {chat.isGroupChat ? chat.chatName : getSenderName(chat.users)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {chat.latestMessage
                                    ? `${chat.latestMessage.sender?.name || "Someone"}: ${chat.latestMessage.content}`
                                    : "No messages yet"}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 p-3">No chats to show.</p>
                )}
            </div>

            {/* Group Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-3">Create Group Chat</h3>

                        <input
                            type="text"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full p-2 border rounded mb-3 text-sm"
                        />

                        <input
                            type="text"
                            placeholder="Search Users"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border rounded mb-3 text-sm"
                        />

                        <div className="max-h-48 overflow-y-auto mb-4 border rounded">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b text-sm"
                                    onClick={() => toggleUserSelection(user._id)}
                                >
                                    <span>{user.name}</span>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user._id)}
                                        readOnly
                                        className="ml-2"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowGroupModal(false)}
                                className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                disabled={creating}
                                className="px-3 py-1.5 bg-purple-400 text-black rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                                {creating ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserSearch = ({ containerHeight }) => {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [token, setToken] = useState("");
    const [activeTab, setActiveTab] = useState("chats"); // "chats" or "search"

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
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
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const { data } = await axios.post("/api/chats", { userId }, config);
            setSelectedChat(data);
            setActiveTab("chats"); // Switch to chat tab after selecting a user
        } catch (error) {
            console.error("Error accessing chat:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b">
                <button
                    className={`flex-1 py-2 text-sm font-medium ${activeTab === "chats" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"
                        }`}
                    onClick={() => setActiveTab("chats")}
                >
                    Chats
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium ${activeTab === "search" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"
                        }`}
                    onClick={() => setActiveTab("search")}
                >
                    Search Users
                </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === "search" ? (
                <div className="p-3 overflow-y-auto" style={{ height: `${containerHeight - 43}px` }}>
                    <div className="flex mb-3 gap-2">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-purple-400 text-black px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {loading && (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    <ul className="text-black space-y-2">
                        {users.map((user) => (
                            <li
                                key={user._id}
                                className="border border-gray-200 p-2.5 rounded bg-white hover:bg-blue-50 cursor-pointer shadow-sm transition-colors"
                                onClick={() => accessChat(user._id)}
                            >
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-gray-600">{user.email}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex text-black  h-full">
                        <ChatSidebar
                            selectedChat={selectedChat}
                            setSelectedChat={setSelectedChat}
                            token={token}
                            containerHeight={containerHeight - 43} // Adjust for tab height
                        />
                        <ChatBox
                            chat={selectedChat}
                            containerHeight={containerHeight - 43} // Adjust for tab height
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isIconHovered, setIsIconHovered] = useState(false);

    const widgetWidth = isExpanded ? "w-[500px]" : "w-[350px]";
    const widgetHeight = isExpanded ? "h-[600px]" : "h-[500px]";
    const containerHeight = isExpanded ? 600 : 500;

    return (
        <>
            {/* Chatbot Floating Icon */}
            <div
                className="fixed bottom-6 right-6 z-50 cursor-pointer transition-all duration-300"
                onClick={() => setOpen(!open)}
                onMouseEnter={() => setIsIconHovered(true)}
                onMouseLeave={() => setIsIconHovered(false)}
            >
                <div className={`p-3 bg-purple-400 rounded-full shadow-lg flex items-center justify-center transform ${isIconHovered ? 'scale-110' : ''} transition-all`}>
                    <IoChatbubbleEllipsesOutline className="text-black text-2xl" />
                </div>
            </div>

            {/* Chatbot Panel */}
            {open && (
                <div
                    className={`fixed bottom-20 right-6 ${widgetWidth} ${widgetHeight} bg-white border border-gray-200 shadow-xl rounded-lg z-50 overflow-hidden transition-all duration-300 flex flex-col`}
                >
                    {/* Header */}
                    <div className="bg-purple-400 text-black p-3 flex justify-between items-center">
                        <h2 className="font-medium text-sm">Chat Assistant</h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-black hover:bg-blue-700 rounded p-1 transition-colors"
                                title={isExpanded ? "Shrink" : "Expand"}
                            >
                                {isExpanded ? (
                                    <MdOutlineZoomInMap size={18} />
                                ) : (
                                    <MdOutlineZoomOutMap size={18} />
                                )}
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-black hover:bg-blue-700 rounded p-1 transition-colors"
                                title="Close"
                            >
                                <RiCloseFill size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 overflow-hidden">
                        <UserSearch containerHeight={containerHeight - 50} />
                    </div>
                </div>
            )}
        </>
    );
}
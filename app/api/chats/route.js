// app/api/accesschat/route.js

import { NextResponse } from 'next/server';
import connectdb from '../../lib/connect'; // ✅ Adjust the path if needed
import Chat from '../../models/chat';
import User from '../../models/user';
import jwt from 'jsonwebtoken';

// ✅ Helper to extract user ID from token
const getUserFromToken = async (req) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
    return decoded.userId; // ✅ use "userId" instead of "id"
  } catch (err) {
    console.error('JWT Error:', err.message);
    return null;
  }
};

export async function POST(req) {
  await connectdb();

  const userId = await getUserFromToken(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized: Invalid or missing token' }, { status: 401 });
  }

  const body = await req.json();
  const { userId: otherUserId } = body;

  if (!otherUserId) {
    return NextResponse.json({ message: 'userId not provided' }, { status: 400 });
  }

  try {
    // Check if chat exists
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: otherUserId } } },
      ],
    })
      .populate('users', '-password')
      .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'name pic email',
    });

    if (isChat.length > 0) {
      return NextResponse.json(isChat[0]);
    } else {
      // Create new chat
      const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [userId, otherUserId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
      return NextResponse.json(fullChat);
    }
  } catch (err) {
    console.error('Chat Creation Error:', err.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

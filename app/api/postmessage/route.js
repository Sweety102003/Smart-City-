import { NextResponse } from 'next/server';
import connectdb from '../../lib/connect'; // ✅ Adjust the path if needed
import Message from '../../models/message'; // Import your Message model
import Chat from '../../models/chat'; // Import your Chat model
import User from '../../models/user'; // Import your User model
import jwt from "jsonwebtoken"
// Helper to extract user ID from token
const getUserFromToken = async (req) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
    return decoded.userId; // assuming you signed the token as { userId: user._id }
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
  const { content, chatId } = body;

  if (!content || !chatId) {
    return NextResponse.json({ message: 'Invalid data passed into request' }, { status: 400 });
  }

  const newMessage = {
    sender: userId,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    // Populating message with sender details
   
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Send Message Error:', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

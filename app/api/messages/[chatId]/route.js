// app/api/messages/[chatId]/route.js

import { NextResponse } from 'next/server';
import connectdb from '../../../lib/connect'; // Adjust the path if needed
import Message from '../../../models/message'; // Adjust the path if needed

// Fetch all messages in a chat
export async function GET(req, { params }) {
  await connectdb(); // Connect to the database

  // Await the params before using them
  const { chatId } = await params; // This will properly await the params object

  try {
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name pic email') // Populate sender info
      .populate('chat'); // Populate chat info

    return NextResponse.json(messages); // Return the messages as JSON
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

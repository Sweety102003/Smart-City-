import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectdb from '../../lib/connect';
import Chat from '../../models/chat';

const getUserFromToken = async (req) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.jwt_secret); // Ensure this is defined in .env
    return decoded.userId;
  } catch (err) {
    console.error('JWT Error:', err.message);
    return null;
  }
};

export async function POST(req) {
  await connectdb();

  const userId = await getUserFromToken(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const name = formData.get('name');
  const users = JSON.parse(formData.get('users')); // users as stringified JSON

  if (!users || !name) {
    return NextResponse.json({ message: 'Please fill all the fields' }, { status: 400 });
  }

  if (users.length < 2) {
    return NextResponse.json({ message: 'At least 2 users are required to form a group chat' }, { status: 400 });
  }

  users.push(userId); // Add current user to group

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users,
      isGroupChat: true,
      groupAdmin: userId,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    return NextResponse.json(fullGroupChat);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

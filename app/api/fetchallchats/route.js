import { NextResponse } from 'next/server';
import connectdb from '../../lib/connect';
import Chat from '../../models/chat';
import User from '../../models/user';
import jwt from 'jsonwebtoken';
import Message from '../../models/message'; // 👈 IMPORTANT

const getUserFromToken = async (req) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
    // return decoded.id
    return decoded.userId; // only if the token was signed that way

  } catch (err) {
    return null;
  }
};

export async function GET(req) {
  await connectdb();

  const userId = await getUserFromToken(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    let results = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: 'latestMessage.sender',
      select: 'name pic email',
    });

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import connectdb from '../../lib/connect';
import User from '../../models/user';

export async function GET(request) {
  await connectdb();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  const keyword = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  try {
    const users = await User.find(keyword).select('-password');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

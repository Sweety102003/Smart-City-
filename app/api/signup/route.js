import connectdb from "@/app/lib/connect";
import User from "@/app/models/user";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectdb();

    const body = await req.json();
    const { name, email, password, role } = body;  // <-- fixed


    if (!email || !name || !role || !password) {
      return NextResponse.json({ message: "Please enter all fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      role,
      password: hashedPassword,
    });

    await newUser.save();
    return NextResponse.json({ message: "New user created", user: newUser }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

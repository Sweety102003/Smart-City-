import connectdb from "@/app/lib/connect";
import User from "@/app/models/user";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const jwt_secret = process.env.jwt_secret;

export async function POST(req) {
  await connectdb();

  try {
    const body = await req.json();
    const { email, password } = body;
console.log(body);
    if (!email || !password) {
      return NextResponse.json({ message: "Please enter all fields" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return NextResponse.json({ message: "No user exists with this email" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id }, jwt_secret, { expiresIn: "1d" });

    return NextResponse.json({ message: "Login successful", token, user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

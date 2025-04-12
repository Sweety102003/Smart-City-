import mongoose from "mongoose";

const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['viewer', 'admin'],
    default: 'viewer',
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userschema);

export default User;

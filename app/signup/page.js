"use client"

import { Facebook, Mail, User, Lock } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [name, setname] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [role, setrole] = useState("viewer")

  const postdata = async (e) => {
    e.preventDefault(); // ✅ Prevent default form submit behavior

    try {
      const response = await axios.post("/api/signup", {
        name,
        email,
        password,
        role,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      alert(response.data.message || "Signup successful!");
      router.push("/signin"); // ✅ Redirect to sign-in page
    } catch (error) {
      console.error(error);
      alert("Signup failed!");
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side */}
      <div className="w-full md:w-1/2 bg-gradient-to-b from-[#3b82f6] to-[#1e3a8a] text-white p-6 md:p-10 relative">
        <div className="absolute top-4 md:top-6 left-4 md:left-8 text-xl md:text-2xl font-bold">🏙️ SmartCity</div>
        <div className="flex flex-col justify-center items-center h-full py-12 md:py-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-center">Smart City Solutions</h1>
          <p className="text-base md:text-lg mt-2 text-center">for a Better Tomorrow</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-4 md:p-10">
        <div className="max-w-md w-full">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Create Account</h2>
          <p className="text-sm text-center mb-4 text-gray-600">Join our smart city platform</p>

          <button className="w-full bg-white border text-gray-700 border-gray-300 rounded px-4 py-2 mb-3 flex items-center justify-center hover:bg-gray-50">
            {/* Google Icon */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4" />
              <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853" />
              <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04" />
              <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335" />
            </svg>
            Sign up with Google
          </button>

          <button className="w-full bg-white border text-gray-700 border-gray-300 rounded px-4 py-2 mb-4 flex items-center justify-center hover:bg-gray-50">
            <Facebook className="w-5 h-5 mr-2" />
            Sign up with Facebook
          </button>

          <div className="text-center text-gray-500 text-sm mb-4">Or continue with email</div>

          <form className="space-y-4" onSubmit={postdata}>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setname(e.target.value)}
                className="w-full border pl-10 rounded px-3 py-2"
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                className="w-full border pl-10 rounded px-3 py-2"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                className="w-full border pl-10 rounded px-3 py-2"
                required
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Select your role:</p>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="viewer"
                    checked={role === "viewer"}
                    onChange={() => setrole("viewer")}
                    className="form-radio text-blue-600"
                  />
                  <span>Viewer</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setrole("admin")}
                    className="form-radio text-blue-600"
                  />
                  <span>Admin</span>
                </label>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-900 text-white rounded px-4 py-2 hover:bg-blue-800">
              Create Account
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <a href="/signin" className="text-blue-600 underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

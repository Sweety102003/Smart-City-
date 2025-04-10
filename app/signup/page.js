import { Facebook, Mail, User, Lock, Eye, EyeOff, Search } from 'lucide-react';

export default function Signup() {
  return (
    <>
      
      <div className="min-h-screen flex">
        {/* Left Side */}
        <div className="w-1/2 bg-gradient-to-b from-[#3b82f6] to-[#1e3a8a] text-white p-10 relative">
          <div className="absolute top-6 left-8 text-2xl font-bold">🏙️ SmartCity</div>
          <div className="flex flex-col justify-center items-center h-full">
            <h1 className="text-3xl font-semibold">Smart City Solutions</h1>
            <p className="text-lg mt-2">for a Better Tomorrow</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-1/2 flex justify-center items-center p-10">
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
            <p className="text-sm text-center mb-4 text-gray-600">Join our smart city platform</p>

            <button className="w-full bg-white border text-gray-700 border-gray-300 rounded px-4 py-2 mb-3 flex items-center justify-center hover:bg-gray-50">
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                <path d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.3h146.9c-6.3 33.8-25.1 62.4-53.5 81.6v67h86.4c50.6-46.7 81.7-115.4 81.7-193.5z" fill="#4285f4"/>
                <path d="M272 544.3c72.9 0 134-24.2 178.7-65.6l-86.4-67c-24 16.1-54.7 25.6-92.3 25.6-70.9 0-131-47.9-152.5-112.1H32.4v70.5c44.8 88.1 136.4 148.6 239.6 148.6z" fill="#34a853"/>
                <path d="M119.5 325.2c-10.1-30-10.1-62.4 0-92.4V162.3H32.4c-42.4 84.8-42.4 185.5 0 270.3l87.1-67.4z" fill="#fbbc04"/>
                <path d="M272 107.7c39.7-.6 77.6 13.9 107 40.5l80.2-80.2C405.3 25.8 339.5-.3 272 0 168.8 0 77.2 60.5 32.4 148.6l87.1 67.4C141 155.6 201.1 107.7 272 107.7z" fill="#ea4335"/>
              </svg>
              {/* <Search className="w-5 h-5 mr-2" /> */}
              Sign up with Google
            </button>

            <button className="w-full bg-white border text-gray-700 border-gray-300 rounded px-4 py-2 mb-4 flex items-center justify-center hover:bg-gray-50">
              <Facebook className="w-5 h-5 mr-2" />
              Sign up with Facebook
            </button>

            <div className="text-center text-gray-500 text-sm mb-4">Or continue with email</div>

            <form className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Full Name" className="w-full border pl-10 rounded px-3 py-2" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="email" placeholder="Email Address" className="w-full border pl-10 rounded px-3 py-2" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="password" placeholder="Password" className="w-full border pl-10 rounded px-3 py-2" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="password" placeholder="Confirm Password" className="w-full border pl-10 rounded px-3 py-2" />
              </div>

              <div className="flex items-center text-sm">
                <input type="checkbox" id="terms" className="mr-2" />
                <label htmlFor="terms">
                  I agree to the <a href="#" className="text-blue-600 underline">Terms of Service</a> and <a href="#" className="text-blue-600 underline">Privacy Policy</a>
                </label>
              </div>

              <button type="submit" className="w-full bg-blue-900 text-white rounded px-4 py-2 hover:bg-blue-800">
                Create Account
              </button>
            </form>

            <p className="text-sm text-center mt-4">
              Already have an account? <a href="/signin" className="text-blue-600 underline">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

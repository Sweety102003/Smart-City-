'use client'
import { Mail, Lock, Eye, EyeOff, Facebook } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // dark background
    scene.fog = new THREE.Fog(0x1a1a1a, 50, 150); // subtle fog

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(20, 25, 20);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e2e2e,
      roughness: 0.8,
      metalness: 0.3
    });
    const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    // Buildings
    const colorPalette = [0x800080, 0x4b0082, 0x6a0dad, 0x5e17eb, 0x7c3aed];
    const buildings = [];

    for (let i = 0; i < 50; i++) {
      const height = Math.random() * 8 + 2;
      const geometry = new THREE.BoxGeometry(2, height, 2);
      const material = new THREE.MeshStandardMaterial({
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        roughness: 0.6,
        metalness: 0.2
      });

      const building = new THREE.Mesh(geometry, material);
      building.position.x = Math.random() * 80 - 40;
      building.position.z = Math.random() * 80 - 40;
      building.position.y = height / 2;
      building.castShadow = true;
      building.receiveShadow = true;

      scene.add(building);
      buildings.push(building);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="w-1/2 bg-cover bg-center relative">
        <div ref={containerRef} className="w-full h-full object-contain" />
        <div className="absolute top-5 left-5">
          <h1 className="text-white text-xl font-bold">SmartCity</h1>
        </div>
        <div className="absolute bottom-10 left-10 text-white">
          <h2 className="text-2xl font-bold mb-2">Smart City Dashboard</h2>
          <p className="text-sm">
            Connect, monitor, and manage your city's infrastructure in real-time
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex flex-col justify-center items-center px-10">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2 text-[#1d1d4f]">Welcome Back</h2>
          <p className="text-gray-500 mb-6">Sign in to your dashboard</p>

          {/* Email */}
          <div className="relative mb-4">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
            {showPassword ? (
              <EyeOff
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <Eye
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          {/* Remember me and Forgot Password */}
          <div className="flex items-center justify-between text-sm mb-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="form-checkbox" /> Remember me
            </label>
            <Link href="#" className="text-[#1d1d4f] font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Sign in button */}
          <button className="w-full bg-[#1d1d4f] text-white py-2 rounded-md font-semibold mb-4">
            Sign In
          </button>

          {/* Or continue */}
          <div className="flex items-center gap-2 mb-4">
            <hr className="flex-grow border-gray-300" />
            <span className="text-gray-500 text-sm">or continue with</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* OAuth buttons */}
          <div className="flex gap-4 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md">
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                <path d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.3h146.9c-6.3 33.8-25.1 62.4-53.5 81.6v67h86.4c50.6-46.7 81.7-115.4 81.7-193.5z" fill="#4285f4" />
                <path d="M272 544.3c72.9 0 134-24.2 178.7-65.6l-86.4-67c-24 16.1-54.7 25.6-92.3 25.6-70.9 0-131-47.9-152.5-112.1H32.4v70.5c44.8 88.1 136.4 148.6 239.6 148.6z" fill="#34a853" />
                <path d="M119.5 325.2c-10.1-30-10.1-62.4 0-92.4V162.3H32.4c-42.4 84.8-42.4 185.5 0 270.3l87.1-67.4z" fill="#fbbc04" />
                <path d="M272 107.7c39.7-.6 77.6 13.9 107 40.5l80.2-80.2C405.3 25.8 339.5-.3 272 0 168.8 0 77.2 60.5 32.4 148.6l87.1 67.4C141 155.6 201.1 107.7 272 107.7z" fill="#ea4335" />
              </svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md">
              <Facebook className="w-5 h-5" /> Facebook
            </button>
          </div>

          {/* Signup link */}
          <p className="text-sm text-center">
            Don't have an account?{' '}
            <Link href="#" className="text-[#1d1d4f] font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

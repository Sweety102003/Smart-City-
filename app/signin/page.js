'use client';
import { Mail, Lock, Eye, EyeOff, Facebook } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from "axios"
import { useRouter } from 'next/navigation';
export default function Signin() {
  const [email,setemail]=useState("");
  const [password , setpassword]=useState("");
const router=useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
const postdata=async()=>{
  try{
  const response= await axios.post("/api/signin",
    {
      email ,
      password
    },{
      headers:{
        "Content-Type":"application/json"
      }
    }
  );

  localStorage.setItem("token", response.data.token);
  router.push("/");


}

  

  catch(error)
  {
    console.log(error);
  }

}
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcccccc, 10, 100);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(20, 25, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 2, window.innerHeight);
    renderer.shadowMap.enabled = true;
    // containerRef.current.appendChild(renderer.domElement);
    // rendererRef.current = renderer; 
    if (containerRef.current && !rendererRef.current) {
      containerRef.current.innerHTML = ''; // Clear previous renderer if any
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    }
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(30, 40, 20);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffcc00, 1, 100);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // const grid = new THREE.GridHelper(100, 100);
    // scene.add(grid);

    // Buildings
    const textureLoader = new THREE.TextureLoader();
    const buildingTexture = textureLoader.load('/texture.jpg');

    for (let i = 0; i < 40; i++) {
      const height = Math.random() * 15 + 5;
      const geometry = new THREE.BoxGeometry(2, height, 2);
      const material = new THREE.MeshStandardMaterial({
        color: 0xD0ACCF      });
      const building = new THREE.Mesh(geometry, material);
      building.castShadow = true;
      building.receiveShadow = true;
      building.position.x = Math.random() * 60 - 30;
      building.position.z = Math.random() * 60 - 30;
      building.position.y = height / 2;
      scene.add(building);
    }

    // Wind Turbines
    const turbineBlades = [];
    for (let i = 0; i < 7; i++) {
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.5, 10),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      base.position.set(-20 + i * 10, 5, -20);
      scene.add(base);

      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee })
      );
      blade.position.set(-20 + i * 10, 10, -20);
      blade.geometry.translate(0, 2.5, 0);
      scene.add(blade);
      turbineBlades.push(blade);
    }

    // Floating spheres
    const spheres = [];
    for (let i = 0; i < 14; i++) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x17d6b9 })
      );
      sphere.position.set(Math.random() * 30 - 15, 10 + Math.random() * 2, Math.random() * 30 - 15);
      scene.add(sphere);
      spheres.push(sphere);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      pointLight.position.set(30 * Math.sin(t), 30, 30 * Math.cos(t));

      turbineBlades.forEach((blade) => {
        blade.rotation.z += 0.1;
      });

      spheres.forEach((sphere, idx) => {
        sphere.position.y += Math.sin(t + idx) * 0.02;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // return () => {
     
    //   if (rendererRef.current) {
    //     rendererRef.current.dispose();
    //     if (containerRef.current.contains(rendererRef.current.domElement)) {
    //       containerRef.current.removeChild(rendererRef.current.domElement);
    //     }
    //     rendererRef.current = null;
    //   }
    // };

    return () => {
      // if (rendererRef.current && containerRef.current) {
      //   if (containerRef.current.contains(rendererRef.current.domElement)) {
      //     containerRef.current.removeChild(rendererRef.current.domElement);
      //   }
      //   rendererRef.current.dispose();
      //   rendererRef.current = null;
      // }
      if (containerRef.current && !rendererRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;
      }
      
    };
    
      // // if (containerRef.current.childNodes.length > 0) {
      //   // containerRef.current.removeChild(containerRef.current.firstChild);
      // // } renderer.dispose();
      // if (containerRef.current 
      //   // && renderer.domElement.parentNode === containerRef.current




      // ) {
      //   containerRef.current.removeChild(renderer.domElement);
      // }
      // containerRef.current.removeChild(renderer.domElement);
    
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left 3D Visualization */}
      <div className="w-1/2 relative">
        <div ref={containerRef} className="w-full h-full"></div>
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

      {/* Right Login Form */}
      <div className="w-1/2 flex flex-col justify-center items-center px-10">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2 text-[#1d1d4f]">Welcome Back</h2>
          <p className="text-gray-500 mb-6">Sign in to your dashboard</p>

          <div className="relative mb-4">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e)=>{
                setemail(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>

          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e)=>{
                setpassword(e.target.value);
              }}
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

          <div className="flex items-center justify-between text-sm mb-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="form-checkbox" /> Remember me
            </label>
            <Link href="#" className="text-[#1d1d4f] font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button onClick={postdata} className="w-full bg-[#1d1d4f] text-white py-2 rounded-md font-semibold mb-4">
            Sign In
          </button>

          <div className="flex items-center gap-2 mb-4">
            <hr className="flex-grow border-gray-300" />
            <span className="text-gray-500 text-sm">or continue with</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-4 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md">
            
              <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4" />
              <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853" />
              <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04" />
              <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335" />
            </svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md">
              <Facebook className="w-5 h-5" /> Facebook
            </button>
          </div>

          <p className="text-sm text-center">
            Don&apos;t have an account?{' '}
            <span  onClick={()=>router.push("/signup")} className="text-[#1d1d4f] font-semibold hover:underline">
              Create Account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

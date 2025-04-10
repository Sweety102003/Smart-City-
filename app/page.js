"use client";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(100, 50);
    scene.add(gridHelper);

    const buildings = [];
    for (let i = 0; i < 50; i++) {
      const height = Math.random() * 8 + 2;
      const geometry = new THREE.BoxGeometry(2, height, 2);
      const material = new THREE.MeshStandardMaterial({ color: 0x800080 }); // Purple color
      const building = new THREE.Mesh(geometry, material);
      building.position.x = Math.random() * 40 - 20;
      building.position.z = Math.random() * 40 - 20;
      building.position.y = height / 2;
      building.userData = {
        name: `Building ${i + 1}`,
        height: height.toFixed(2),
        occupants: Math.floor(Math.random() * 100) + 1,
      };
      scene.add(building);
      buildings.push(building);
    }

    camera.position.set(20, 25, 20);
    camera.lookAt(scene.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildings);

      if (intersects.length > 0) {
        const selected = intersects[0].object;
        setSelectedBuilding(selected.userData);
      } else {
        setSelectedBuilding(null);
      }
    };

    const handleResize = () => {
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener("click", handleMouseClick);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("click", handleMouseClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="text-xl font-bold text-purple-400">SmartCityOS</div>
        <nav className="space-x-6 hidden md:block">
          <a href="#features" className="hover:text-purple-400">Features</a>
          <a href="#solutions" className="hover:text-purple-400">Solutions</a>
          <a href="#pricing" className="hover:text-purple-400">Pricing</a>
          <a href="#about" className="hover:text-purple-400">About</a>
        </nav>
        <div className="space-x-4">
          <button className="border px-4 py-2 rounded border-gray-600 hover:border-white">Login</button>
          <button className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600">Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-8 md:flex md:items-center md:justify-between">
        <div className="max-w-2xl mx-auto md:text-left md:w-1/2">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Transform Your City with Intelligent Solutions
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Real-time monitoring, 3D visualization, and smart analytics made for urban management.
          </p>
          <button className="bg-purple-500 px-6 py-3 rounded text-lg hover:bg-purple-600">Get Started</button>
        </div>
        <div className="mt-12 md:mt-0 md:ml-12 w-full md:w-[550px] h-[400px]">
          <div ref={containerRef} className="w-full h-full object-contain" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-900 py-20 px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Live City Insights</h3>
            <p className="text-gray-400">Monitor your city's pulse in real-time with our advanced data feeds.</p>
            <a href="#" className="text-purple-400 mt-4 inline-block hover:underline">Learn More</a>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Interactive 3D Visualization</h3>
            <p className="text-gray-400">Explore dynamic cityscapes with detailed, interactive 3D maps.</p>
            <a href="#" className="text-purple-400 mt-4 inline-block hover:underline">Learn More</a>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Intelligent Analytics</h3>
            <p className="text-gray-400">Gain actionable insights using our predictive analytics engine.</p>
            <a href="#" className="text-purple-400 mt-4 inline-block hover:underline">Learn More</a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black text-center border-t border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div>
            <div className="text-3xl font-bold">200+</div>
            <div className="text-gray-400">Cities</div>
          </div>
          <div>
            <div className="text-3xl font-bold">1M+</div>
            <div className="text-gray-400">Data Points</div>
          </div>
          <div>
            <div className="text-3xl font-bold">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold">24/7</div>
            <div className="text-gray-400">Support</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-8 text-sm text-gray-400">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">SmartCityOS</h3>
            <p>Empowering cities with technology for a smarter tomorrow.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Company</h4>
            <ul>
              <li><a href="#" className="hover:underline">About</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Product</h4>
            <ul>
              <li><a href="#" className="hover:underline">Features</a></li>
              <li><a href="#" className="hover:underline">Pricing</a></li>
              <li><a href="#" className="hover:underline">Updates</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Support</h4>
            <ul>
              <li><a href="#" className="hover:underline">Help Center</a></li>
              <li><a href="#" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">&copy; 2025 SmartCityOS. All rights reserved.</div>
      </footer>
    </div>
  );
}

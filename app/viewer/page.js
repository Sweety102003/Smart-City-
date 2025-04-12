'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function ViewerPage() {
  const mountRef = useRef(null);
  const fileInputRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controlsRef.current = controls;

    // ✅ Add Grid and Axes Helpers
    const grid = new THREE.GridHelper(20, 40);
    scene.add(grid);

    const axes = new THREE.AxesHelper(5);
    scene.add(axes);

    // ✅ Animation loop with model rotation
    const animate = function () {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();

      // Auto-rotate the model
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const contents = e.target.result;
        const loader = new GLTFLoader();
        loader.parse(
          contents,
          '',
          function (gltf) {
            // Remove existing model if any
            if (modelRef.current) {
              sceneRef.current.remove(modelRef.current);
              modelRef.current.traverse((child) => {
                if (child.isMesh) {
                  child.geometry.dispose();
                  if (child.material.isMaterial) {
                    cleanMaterial(child.material);
                  } else {
                    for (const material of child.material) cleanMaterial(material);
                  }
                }
              });
            }

            const model = gltf.scene;

            // Center and scale the model and lift it above the grid
            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);
            const bottomY = box.min.y;
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;

            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            model.position.y -= bottomY * scale; // ✅ lift above grid

            sceneRef.current.add(model);
            modelRef.current = model;
          },
          undefined,
          function (error) {
            console.error('An error occurred while loading the model:', error);
          }
        );
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const cleanMaterial = (material) => {
    material.dispose();
    for (const key in material) {
      const value = material[key];
      if (value && typeof value === 'object' && 'minFilter' in value) {
        value.dispose();
      }
    }
  };

  return (
    <div style={{ width: '95vw', height: '95vh', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <input
        type="file"
        accept=".glb"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1,
          backgroundColor: 'white',
          padding: '5px',
          borderRadius: '5px',
          width: '45%',
        }}
      />
    </div>
  );
}

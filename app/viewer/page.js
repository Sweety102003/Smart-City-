'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

export default function ViewerPage() {
  const mountRef = useRef(null);
  const fileInputRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const dragControlsRef = useRef(null);
  const animationIdRef = useRef(null);
  const modelsRef = useRef([]);
  const [modelList, setModelList] = useState([]);

  useEffect(() => {
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const axes = new THREE.AxesHelper(5);
    scene.add(axes);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      dragControlsRef.current?.dispose?.();
      renderer.dispose();
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const loader = new GLTFLoader();
      const newModels = [];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          loader.parse(
            e.target.result,
            '',
            function (gltf) {
              const model = gltf.scene;

              const box = new THREE.Box3().setFromObject(model);
              const size = new THREE.Vector3();
              box.getSize(size);
              const center = new THREE.Vector3();
              box.getCenter(center);

              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 10 / maxDim;
              model.scale.setScalar(scale);
              model.position.sub(center.multiplyScalar(scale));
              model.position.y = 0;

              const spacing = 10;
              const totalModels = [...modelsRef.current, ...newModels];
              const index = totalModels.length;
              model.position.x = (index % 5) * spacing;
              model.position.z = Math.floor(index / 5) * spacing;

              sceneRef.current.add(model);

              const modelData = { id: Date.now() + Math.random(), name: file.name, mesh: model };
              modelsRef.current.push(modelData);
              newModels.push(modelData);

              if (newModels.length === files.length) {
                setModelList([...modelsRef.current]);

                if (dragControlsRef.current) dragControlsRef.current.dispose();
                dragControlsRef.current = new DragControls(
                  modelsRef.current.map((m) => m.mesh),
                  cameraRef.current,
                  rendererRef.current.domElement
                );

                dragControlsRef.current.addEventListener('dragstart', () => {
                  controlsRef.current.enabled = false;
                });
                dragControlsRef.current.addEventListener('dragend', () => {
                  controlsRef.current.enabled = true;
                });
              }
            },
            undefined,
            function (error) {
              console.error('Error loading model:', error);
            }
          );
        };
        reader.readAsArrayBuffer(file);
      });
    }
  };

  const removeModel = (idToRemove) => {
    modelsRef.current = modelsRef.current.filter((m) => {
      if (m.id === idToRemove) {
        sceneRef.current.remove(m.mesh);
        m.mesh.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (child.material.isMaterial) {
              cleanMaterial(child.material);
            } else {
              for (const mat of child.material) cleanMaterial(mat);
            }
          }
        });
        return false;
      }
      return true;
    });
    setModelList([...modelsRef.current]);
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

  const exportGLB = (sceneToExport, fileName) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      sceneToExport,
      (result) => {
        const output = result instanceof ArrayBuffer ? result : JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: 'application/octet-stream' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      },
      { binary: true }
    );
  };

  const handleSaveIndividual = (model) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('User not authenticated');

    const exporter = new GLTFExporter();
    exporter.parse(
      model.mesh,
      (result) => {
        const blob = new Blob([result], { type: 'model/gltf-binary' });
        const formData = new FormData();
        formData.append('file', blob, `${model.name.replace(/\.[^/.]+$/, "")}_${Date.now()}.glb`);

        fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('Uploaded model:', data);
            alert('Model saved to MongoDB!');
          })
          .catch((err) => {
            console.error('Upload error:', err);
            alert('Error uploading model');
          });
      },
      { binary: true }
    );
  };

  // const handleSaveGrouped = () => {
  //   const token = localStorage.getItem('token');
  //   if (!token) return alert('User not authenticated');

  //   const group = new THREE.Group();
  //   modelsRef.current.forEach((model) => {
  //     group.add(model.mesh.clone());
  //   });
  //   exportGLB(group, `grouped_scene_${Date.now()}.glb`);
  // };
  const handleSaveGrouped = () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('User not authenticated');
  
    const group = new THREE.Group();
    modelsRef.current.forEach((model) => {
      group.add(model.mesh.clone());
    });
  
    const exporter = new GLTFExporter();
    exporter.parse(
      group,
      (result) => {
        const blob = new Blob([result], { type: 'model/gltf-binary' });
        const formData = new FormData();
        formData.append('file', blob, `grouped_scene_${Date.now()}.glb`);
  
        fetch('/api/upload-grouped', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('Uploaded grouped model:', data);
            alert('Grouped model saved to MongoDB!');
          })
          .catch((err) => {
            console.error('Upload error:', err);
            alert('Error uploading grouped model');
          });
      },
      { binary: true }
    );
  };
  

  return (
    <div style={{ width: '100vw', height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        <input
          type="file"
          accept=".glb"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1,
            opacity: 0.7,
          }}
        />
      </div>
      <div style={{ padding: '10px', display: 'flex' }}>
        <button
          onClick={() => handleSaveGrouped()}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Save Grouped Models
        </button>
        {modelList.map((model) => (
          <div key={model.id} className="flex items-center mr-2">
            <span>{model.name}</span>
            <button
              onClick={() => removeModel(model.id)}
              className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Remove
            </button>
            <button
              onClick={() => handleSaveIndividual(model)}
              className="ml-2 bg-green-500 text-white px-2 py-1 rounded"
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

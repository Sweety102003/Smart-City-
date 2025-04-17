'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { showNotification, NotificationTypes } from '../components/Notification';

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
  const [selectedModel, setSelectedModel] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  // Parameters for primitives
  const [primitiveParams, setPrimitiveParams] = useState({
    width: 5,
    height: 5,
    depth: 5,
    radius: 2.5,
    segments: 32,
    color: '#3080ff'
  });

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

              const modelData = { id: Date.now() + Math.random(), name: file.name, mesh: model, type: 'gltf' };
              modelsRef.current.push(modelData);
              newModels.push(modelData);

              if (newModels.length === files.length) {
                setModelList([...modelsRef.current]);
                updateDragControls();
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

  const updateDragControls = () => {
    if (dragControlsRef.current) dragControlsRef.current.dispose();

    dragControlsRef.current = new DragControls(
      modelsRef.current.map((m) => m.mesh),
      cameraRef.current,
      rendererRef.current.domElement
    );

    dragControlsRef.current.addEventListener('dragstart', (event) => {
      controlsRef.current.enabled = false;
      // Find and set the selected model
      const selectedModelData = modelsRef.current.find(m => m.mesh === event.object);
      setSelectedModel(selectedModelData);
    });

    dragControlsRef.current.addEventListener('dragend', () => {
      controlsRef.current.enabled = true;
    });

    dragControlsRef.current.addEventListener('click', (event) => {
      // Find and set the selected model on click
      const selectedModelData = modelsRef.current.find(m => m.mesh === event.object);
      setSelectedModel(selectedModelData || null);
    });
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

        // Clear selection if the removed model was selected
        if (selectedModel && selectedModel.id === idToRemove) {
          setSelectedModel(null);
        }

        return false;
      }
      return true;
    });
    setModelList([...modelsRef.current]);
    updateDragControls();
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

  const addPrimitive = (type) => {
    let geometry, mesh;
    const material = new THREE.MeshStandardMaterial({
      color: primitiveParams.color,
      roughness: 0.5,
      metalness: 0.5
    });

    switch (type) {
      case 'box':
        geometry = new THREE.BoxGeometry(
          primitiveParams.width,
          primitiveParams.height,
          primitiveParams.depth
        );
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, primitiveParams.height / 2, 0); // Place on floor
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          primitiveParams.radius,
          primitiveParams.segments,
          primitiveParams.segments
        );
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, primitiveParams.radius, 0); // Place on floor
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          primitiveParams.radius,
          primitiveParams.radius,
          primitiveParams.height,
          primitiveParams.segments
        );
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, primitiveParams.height / 2, 0); // Place on floor
        break;
    }

    // Set a random position offset to avoid stacking
    const offset = 5;
    mesh.position.x += (Math.random() - 0.5) * offset;
    mesh.position.z += (Math.random() - 0.5) * offset;

    sceneRef.current.add(mesh);

    const modelData = {
      id: Date.now() + Math.random(),
      name: `${type}-${modelsRef.current.length + 1}`,
      mesh: mesh,
      type: type,
      parameters: { ...primitiveParams }
    };

    modelsRef.current.push(modelData);
    setModelList([...modelsRef.current]);
    setSelectedModel(modelData); // Select the newly added model
    updateDragControls();
  };

  const updatePrimitiveModel = () => {
    if (!selectedModel || !selectedModel.type || selectedModel.type === 'gltf') return;

    // Store the current position
    const currentPosition = selectedModel.mesh.position.clone();

    // Remove the old mesh from the scene
    sceneRef.current.remove(selectedModel.mesh);

    // Create new geometry based on type
    let geometry;
    switch (selectedModel.type) {
      case 'box':
        geometry = new THREE.BoxGeometry(
          primitiveParams.width,
          primitiveParams.height,
          primitiveParams.depth
        );
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          primitiveParams.radius,
          primitiveParams.segments,
          primitiveParams.segments
        );
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          primitiveParams.radius,
          primitiveParams.radius,
          primitiveParams.height,
          primitiveParams.segments
        );
        break;
    }

    // Update material
    const material = new THREE.MeshStandardMaterial({
      color: primitiveParams.color,
      roughness: 0.5,
      metalness: 0.5
    });

    const newMesh = new THREE.Mesh(geometry, material);
    newMesh.position.copy(currentPosition); // Keep the same position

    // Add the new mesh to the scene
    sceneRef.current.add(newMesh);

    // Update the reference in the model list
    selectedModel.mesh = newMesh;
    selectedModel.parameters = { ...primitiveParams };

    // Update model list and drag controls
    setModelList([...modelsRef.current]);
    updateDragControls();
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
    if (!token) {
      showNotification('Authentication Required', NotificationTypes.ERROR, 'Please log in to save your model');
      return;
    }
  
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
            showNotification('Model Saved', NotificationTypes.SUCCESS, 'Model uploaded successfully!');
          })
          .catch((err) => {
            console.error('Upload error:', err);
            showNotification('Upload Failed', NotificationTypes.ERROR, 'Failed to upload model');
          });
      },
      { binary: true }
    );
  };
  
  const handleSaveGrouped = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Authentication Required', NotificationTypes.ERROR, 'Please log in to save your model');
      return;
    }
  
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
            showNotification('Grouped Model Saved', NotificationTypes.SUCCESS, 'Grouped model uploaded successfully!');
          })
          .catch((err) => {
            console.error('Upload error:', err);
            showNotification('Upload Failed', NotificationTypes.ERROR, 'Failed to upload grouped model');
          });
      },
      { binary: true }
    );
  };
  

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = name === 'color' ? value : parseFloat(value);

    setPrimitiveParams(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  return (
    <div className="flex h-full w-full relative">

      {/* Sidebar */}
      <div className={`bg-gray-100 p-4 border-r border-gray-300 h-full ${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <div className="mb-6">
          <h2 className="text-lg text-black font-semibold mb-3">Add Primitives</h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addPrimitive('box')}
              className="bg-blue-500 p-2 rounded hover:bg-blue-600 hover:cursor-pointer transition"
            >
              Box
            </button>
            <button
              onClick={() => addPrimitive('sphere')}
              className="bg-blue-500 p-2 rounded hover:bg-blue-600 hover:cursor-pointer transition"
            >
              Sphere
            </button>
            <button
              onClick={() => addPrimitive('cylinder')}
              className="bg-blue-500 p-2 rounded hover:bg-blue-600 hover:cursor-pointer transition"
            >
              Cylinder
            </button>
          </div>
        </div>

        {/* Parameters Control */}
        <div className="mb-6">
          <h2 className="text-lg text-black font-semibold mb-3">Parameters</h2>

          <div className="space-y-3">
            <div>
              <label className="bloc0 text-black text-sm mb-1">Color</label>
              <input
                type="color"
                name="color"
                value={primitiveParams.color}
                onChange={handleParamChange}
                className="w-full text-black h-8 hover:cursor-pointer"
              />
            </div>

            <div>
              <label className="inline-block w-1/2 text-black text-sm mb-1">Width</label>
              <input
                type="number"
                name="width"
                min="0.1"
                max="20"
                step="0.1"
                value={primitiveParams.width}
                onChange={handleParamChange}
                className="w-1/2 p-1 border text-black rounded hover:cursor-text"
              />
            </div>

            <div>
              <label className="inline-block w-1/2 text-black text-sm mb-1">Height</label>
              <input
                type="number"
                name="height"
                min="0.1"
                max="20"
                step="0.1"
                value={primitiveParams.height}
                onChange={handleParamChange}
                className="w-1/2 text-black p-1 border rounded hover:cursor-text"
              />
            </div>

            <div>
              <label className="inline-block w-1/2 text-black text-sm mb-1">Depth</label>
              <input
                type="number"
                name="depth"
                min="0.1"
                max="20"
                step="0.1"
                value={primitiveParams.depth}
                onChange={handleParamChange}
                className="w-1/2 p-1 text-black border rounded hover:cursor-text"
              />
            </div>

            <div>
              <label className="inline-block w-1/2 text-black text-sm mb-1">Radius</label>
              <input
                type="number"
                name="radius"
                min="0.1"
                max="10"
                step="0.1"
                value={primitiveParams.radius}
                onChange={handleParamChange}
                className="w-1/2 p-1 text-black border rounded hover:cursor-text"
              />
            </div>

            <div>
              <label className="inline-block w-1/2 text-black text-sm mb-1">Segments</label>
              <input
                type="number"
                name="segments"
                min="3"
                max="64"
                step="1"
                value={primitiveParams.segments}
                onChange={handleParamChange}
                className="w-1/2 p-1 text-black border rounded hover:cursor-text"
              />
            </div>

            {selectedModel && selectedModel.type !== 'gltf' && (
              <button
                onClick={updatePrimitiveModel}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 hover:cursor-pointer transition mt-4"
              >
                Update Model
              </button>
            )}
          </div>
        </div>


        {/* Model List */}
        <div>
          <h2 className="text-lg text-black font-semibold mb-3">Models</h2>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {modelList.map((model) => (
              <div
                key={model.id}
                className={`p-2 border rounded flex justify-between items-center ${selectedModel && selectedModel.id === model.id ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}
                onClick={() => setSelectedModel(model)}
              >
                <div className="truncate text-black flex-1">{model.name}</div>

                <button onClick={() => handleSaveIndividual(model)}
                  className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 hover:cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeModel(model.id);
                  }}
                  className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 hover:cursor-pointer"
                > X
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      {/* <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-r z-10 hover:bg-blue-600 hover:cursor-pointer"
      >
        {showSidebar ? '←' : '→'}
      </button> */}

      {/* Main Content */}
      <div className="flex-1 relative">
        <div ref={mountRef} className="w-full h-full" />
        <input
          className="absolute top-4 left-4 z-10 bg-gray-300 text-black hover:cursor-pointer"
          type="file"
          accept=".glb"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <button
          onClick={() => handleSaveGrouped()}
          className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 hover:cursor-pointer"
        >
          Save Grouped Models
        </button>

      </div>
    </div>
  );
}
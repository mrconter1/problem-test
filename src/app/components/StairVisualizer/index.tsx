'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraState, MovementState, StairModel } from './types';
import { 
  initializeScene, 
  initializeRenderer,
  initializeCamera, 
  addAxisLabels,
  handleResize 
} from './SceneSetup';
import { 
  setupCameraControls, 
  updateCameraPosition, 
  updateCameraDirection 
} from './CameraControls';
import { 
  visualizeStairModel, 
  loadStairModels 
} from './ModelRenderer';
import { InfoPanel, ControlsPanel, CameraInfo } from './UIComponents';

// Add some global styles to ensure the canvas is visible
const globalStyles = `
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .stair-visualizer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
  }
  .stair-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
`;

/**
 * StairVisualizer component
 */
export default function StairVisualizer() {
  // Refs for DOM elements and Three.js objects
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const isFirstLoadRef = useRef<boolean>(true);
  
  // Camera state management
  const cameraStateRef = useRef<CameraState>({
    yaw: Math.PI, // Initial yaw (face -Y direction)
    pitch: 0      // Initial pitch (horizontal view)
  });
  
  // Movement state management
  const movementRef = useRef<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    slowMode: false,
    // Initialize velocity components to zero
    velocityX: 0,
    velocityY: 0,
    velocityZ: 0
  });
  
  // State for models and UI
  const [stairModels, setStairModels] = useState<StairModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("Loading stair model...");
  
  // Animation frame management
  const requestRef = useRef<number | null>(null);
  
  // Add global styles to document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) {
      console.error("Container ref is null");
      return;
    }
    
    console.log('Initializing Three.js scene...');
    console.log('Container element:', containerRef.current);
    
    // Initialize Three.js components
    const scene = initializeScene();
    const renderer = initializeRenderer(containerRef.current);
    const camera = initializeCamera();
    
    // Create a group for the model
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    
    // Add axis labels
    addAxisLabels(scene);
    
    // Set initial camera position closer to the scene center
    camera.position.set(30, -30, 20);
    camera.lookAt(0, 0, 0);
    
    // Update camera state to match camera position
    const direction = new THREE.Vector3();
    direction.subVectors(new THREE.Vector3(0, 0, 0), camera.position).normalize();
    
    // Calculate yaw (rotation around Z axis)
    cameraStateRef.current.yaw = Math.atan2(direction.x, direction.y);
    
    // Calculate pitch (rotation up/down)
    const horizontalDistance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    cameraStateRef.current.pitch = Math.atan2(direction.z, horizontalDistance);
    
    // Store refs
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    modelGroupRef.current = modelGroup;
    
    // Log the scene setup
    console.log('Scene setup complete with camera at:', camera.position);
    console.log('Camera state:', cameraStateRef.current);
    
    // Force an initial render to ensure the canvas is populated
    renderer.render(scene, camera);
    
    // Set up camera controls
    const cleanupControls = setupCameraControls(
      camera, 
      renderer, 
      cameraStateRef.current, 
      movementRef.current
    );
    
    // Handle window resize
    const handleWindowResize = () => {
      if (camera && renderer) {
        handleResize(camera, renderer);
      }
    };
    window.addEventListener('resize', handleWindowResize);
    
    console.log('Fetching stair.json...');
    // Load stair models
    loadStairModels()
      .then(models => {
        console.log('Stair data loaded:', models);
        setStairModels(models);
        
        // Initialize with the first model
        if (models.length > 0) {
          console.log(`Initializing with first model: ${models[0].name}`);
          setSelectedModelId(models[0].id);
        } else {
          console.warn('No stair models found');
        }
      })
      .catch(error => {
        console.error("Failed to load stair models:", error);
        setLoadingText("Error loading stair models");
      });
    
    // Animation loop
    const animate = () => {
      if (cameraRef.current && sceneRef.current && rendererRef.current) {
        // Update camera position based on keyboard input
        updateCameraPosition(
          cameraRef.current, 
          movementRef.current, 
          cameraStateRef.current
        );
        
        // Render scene
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      // Request next frame
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    requestRef.current = requestAnimationFrame(animate);
    console.log('Animation loop started');
    
    // Cleanup on unmount
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleWindowResize);
      cleanupControls();
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);
  
  // Handle model changes
  useEffect(() => {
    if (!selectedModelId || !sceneRef.current) return;
    
    console.log(`Selected model changed to: ${selectedModelId}`);
    setLoadingText("Loading stair model...");
    
    // Find the selected model
    const model = stairModels.find(m => m.id === selectedModelId);
    if (model) {
      console.log(`Visualizing model: ${model.name}`);
      
      // Visualize the model
      try {
        visualizeStairModel(
          sceneRef.current, 
          model,
          (text) => setLoadingText(text)
        );
        
        // Only set camera position on initial load
        if (cameraRef.current && isFirstLoadRef.current) {
          // Position camera closer to the model
          cameraRef.current.position.set(30, -30, 25);
          cameraRef.current.lookAt(0, 0, 0);
          
          // Update camera state
          const direction = new THREE.Vector3();
          direction.subVectors(new THREE.Vector3(0, 0, 0), cameraRef.current.position).normalize();
          
          // Calculate yaw (rotation around Z axis)
          cameraStateRef.current.yaw = Math.atan2(direction.x, direction.y);
          
          // Calculate pitch (rotation up/down)
          const horizontalDistance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
          cameraStateRef.current.pitch = Math.atan2(direction.z, horizontalDistance);
          
          updateCameraDirection(cameraRef.current, cameraStateRef.current);
          
          console.log('Camera positioned at:', cameraRef.current.position);
          
          // Set first load flag to false
          isFirstLoadRef.current = false;
        }
      } catch (error) {
        console.error('Error visualizing model:', error);
        setLoadingText(`Error visualizing model: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      console.warn(`Model not found: ${selectedModelId}`);
    }
  }, [selectedModelId, stairModels]);
  
  // Handle model selection
  const handleModelChange = (modelId: string) => {
    console.log(`Model selection changed to: ${modelId}`);
    setSelectedModelId(modelId);
  };
  
  return (
    <>
      <div className="stair-visualizer">
        <div 
          ref={containerRef} 
          className="stair-container"
        ></div>
        
        {/* UI Components */}
        <InfoPanel loadingText={loadingText} />
        <ControlsPanel 
          stairModels={stairModels} 
          onModelChange={handleModelChange}
          selectedModelId={selectedModelId || ''} 
        />
        <CameraInfo />
      </div>
    </>
  );
} 
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraState, MovementState, StairModel, RenderingMode } from './types';
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
import { InfoPanel, ControlsPanel, CameraInfo, RenderingModeToggle } from './UIComponents';

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
    yaw: 18.8 * (Math.PI / 180), // Initial yaw in radians (converted from 18.8°)
    pitch: -17.5 * (Math.PI / 180) // Initial pitch in radians (converted from -17.5°)
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
  const [renderingMode, setRenderingMode] = useState<RenderingMode>(RenderingMode.LONG_SIDE_LINES);
  
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
    
    // Set initial camera position to the specified values
    camera.position.set(-1.479, -8.422, 0.898);
    
    // Update camera direction based on the set yaw and pitch
    updateCameraDirection(camera, cameraStateRef.current);
    
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
          (text) => setLoadingText(text),
          renderingMode
        );
        
        // Only set camera position on initial load
        if (cameraRef.current && isFirstLoadRef.current) {
          // Set camera to our specific position instead of positioning relative to model
          cameraRef.current.position.set(-1.479, -8.422, 0.898);
          
          // Use our specific rotation
          cameraStateRef.current.yaw = 18.8 * (Math.PI / 180); // 18.8 degrees in radians
          cameraStateRef.current.pitch = -17.5 * (Math.PI / 180); // -17.5 degrees in radians
          
          // Update camera direction based on our yaw and pitch
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
  }, [selectedModelId, stairModels, renderingMode]);
  
  // Handle model selection
  const handleModelChange = (modelId: string) => {
    console.log(`Model selection changed to: ${modelId}`);
    setSelectedModelId(modelId);
  };
  
  // Handle rendering mode change
  const handleRenderingModeChange = (mode: RenderingMode) => {
    console.log(`Rendering mode changed to: ${mode}`);
    setRenderingMode(mode);
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
        <RenderingModeToggle 
          currentMode={renderingMode}
          onModeChange={handleRenderingModeChange}
        />
      </div>
    </>
  );
} 
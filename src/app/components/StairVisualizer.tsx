'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Point {
  x: number;
  y: number;
  z: number;
}

interface Line {
  start: Point;
  end: Point;
}

interface Loop extends Array<Line> {
  // This interface extends Array<Line> with no additional members
  // but we need it for type clarity in our application
}

interface Face {
  loops: Loop[];
}

interface Solid {
  faces: Face[];
}

interface StairModel {
  id: string;
  name: string;
  boundingBox: {
    min: Point;
    max: Point;
  };
  solids: Solid[];
}

export default function StairVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Store a reference to the container element for cleanup
    const container = containerRef.current;
    
    console.log('Initializing Three.js scene...');
    
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Set initial camera position to a reasonable viewing angle
    camera.position.set(20, -20, 15);
    camera.up.set(0, 0, 1); // Set Z as up direction
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add a grid helper aligned with XY plane (where Z is up)
    const gridSize = 100;
    const gridDivisions = 100;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444);
    // Rotate the grid to align with XY plane (where Z is up)
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);
    
    // Add axes helper
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);
    
    // Add axis labels using text sprites instead of boxes
    function createAxisLabel(text: string, position: THREE.Vector3, color: number): void {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      
      // Create a canvas texture for the text
      canvas.width = 64;
      canvas.height = 64;
      
      context.font = "Bold 40px Arial";
      context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(2, 2, 1);
      scene.add(sprite);
    }
    
    createAxisLabel("X", new THREE.Vector3(11, 0, 0), 0xff0000);
    createAxisLabel("Y", new THREE.Vector3(0, 11, 0), 0x00ff00);
    createAxisLabel("Z", new THREE.Vector3(0, 0, 11), 0x0000ff);
    
    // Create model group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    
    // FPS-style controls
    const moveSpeed = 0.5;
    const lookSpeed = 0.002;
    
    // Camera state
    const cameraState = {
      yaw: 0,
      pitch: 0
    };
    
    // Movement state
    const movement = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false
    };
    
    // Update camera direction based on yaw and pitch
    function updateCameraDirection(): void {
      // Calculate the forward direction vector
      const forward = new THREE.Vector3(
        Math.sin(cameraState.yaw) * Math.cos(cameraState.pitch),
        Math.cos(cameraState.yaw) * Math.cos(cameraState.pitch),
        Math.sin(cameraState.pitch)
      );
      
      // Calculate the target point
      const target = new THREE.Vector3();
      target.addVectors(camera.position, forward);
      
      // Look at the target
      camera.lookAt(target);
      
      // Ensure Z stays as up direction
      camera.up.set(0, 0, 1);
    }
    
    // Update camera position based on keyboard input
    function updateCameraPosition(): void {
      if (!Object.values(movement).some(Boolean)) return; // Skip if no movement
      
      // Get the camera's forward and right directions
      const forward = new THREE.Vector3(0, 0, 0);
      forward.setFromMatrixColumn(camera.matrix, 2);
      forward.z = 0; // Keep movement in XY plane
      forward.normalize();
      
      const right = new THREE.Vector3(0, 0, 0);
      right.setFromMatrixColumn(camera.matrix, 0);
      right.z = 0; // Keep movement in XY plane
      right.normalize();
      
      // Apply movement
      if (movement.forward) {
        camera.position.addScaledVector(forward, -moveSpeed);
      }
      if (movement.backward) {
        camera.position.addScaledVector(forward, moveSpeed);
      }
      if (movement.left) {
        camera.position.addScaledVector(right, -moveSpeed);
      }
      if (movement.right) {
        camera.position.addScaledVector(right, moveSpeed);
      }
      
      // Up/down movement along Z axis
      if (movement.up) {
        camera.position.z += moveSpeed;
      }
      if (movement.down) {
        camera.position.z -= moveSpeed;
      }
      
      // Update camera direction after position change
      updateCameraDirection();
    }
    
    // Set up pointer lock for mouse control - left-click to toggle
    renderer.domElement.addEventListener('mousedown', (event) => {
      // Only respond to left-click (button 0)
      if (event.button !== 0) return;
      
      if (document.pointerLockElement === renderer.domElement) {
        // If already locked, exit pointer lock
        console.log('Exiting pointer lock via left-click');
        document.exitPointerLock();
      } else {
        // If not locked, request pointer lock
        console.log('Entering pointer lock via left-click');
        renderer.domElement.requestPointerLock();
      }
    });
    
    // Prevent default context menu behavior
    renderer.domElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
    
    document.addEventListener('pointerlockchange', () => {
      const isLocked = document.pointerLockElement === renderer.domElement;
      
      // Add a visual indicator when controls are active
      if (isLocked) {
        // Add a small dot in the center of the screen to indicate active controls
        const controlIndicator = document.createElement('div');
        controlIndicator.id = 'controlIndicator';
        controlIndicator.style.position = 'fixed';
        controlIndicator.style.top = '50%';
        controlIndicator.style.left = '50%';
        controlIndicator.style.width = '4px';
        controlIndicator.style.height = '4px';
        controlIndicator.style.backgroundColor = 'white';
        controlIndicator.style.borderRadius = '50%';
        controlIndicator.style.transform = 'translate(-50%, -50%)';
        controlIndicator.style.zIndex = '10001';
        controlIndicator.style.pointerEvents = 'none';
        document.body.appendChild(controlIndicator);
      } else {
        // Remove the indicator when controls are inactive
        const controlIndicator = document.getElementById('controlIndicator');
        if (controlIndicator) {
          controlIndicator.remove();
        }
      }
      
      // Reset all movement states when exiting pointer lock
      if (!isLocked) {
        movement.forward = false;
        movement.backward = false;
        movement.left = false;
        movement.right = false;
        movement.up = false;
        movement.down = false;
      }
    });
    
    // Mouse movement handler
    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement === renderer.domElement) {
        // Update camera rotation based on mouse movement
        cameraState.yaw += event.movementX * lookSpeed;
        cameraState.pitch -= event.movementY * lookSpeed;
        
        // Limit vertical rotation to prevent flipping
        cameraState.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, cameraState.pitch));
        
        updateCameraDirection();
      }
    });
    
    // Keyboard handlers
    document.addEventListener('keydown', (event) => {
      // Only handle movement keys when in pointer lock mode
      if (document.pointerLockElement === renderer.domElement) {
        switch (event.code) {
          case 'KeyW': movement.forward = true; break;
          case 'KeyS': movement.backward = true; break;
          case 'KeyA': movement.left = true; break;
          case 'KeyD': movement.right = true; break;
          case 'Space': movement.up = true; break;
          case 'ShiftLeft': 
          case 'ShiftRight': 
            movement.down = true; 
            event.preventDefault(); // Prevent browser from capturing Shift key
            break;
          // Add Escape key to exit pointer lock
          case 'Escape':
            console.log('Exiting pointer lock via Escape key');
            document.exitPointerLock();
            break;
        }
      }
    });
    
    document.addEventListener('keyup', (event) => {
      // Only handle movement keys when in pointer lock mode
      if (document.pointerLockElement === renderer.domElement) {
        switch (event.code) {
          case 'KeyW': movement.forward = false; break;
          case 'KeyS': movement.backward = false; break;
          case 'KeyA': movement.left = false; break;
          case 'KeyD': movement.right = false; break;
          case 'Space': movement.up = false; break;
          case 'ShiftLeft': 
          case 'ShiftRight': movement.down = false; break;
        }
      }
    });
    
    // Function to create a rectangle from 4 points
    function createRectangle(points: { x: number, y: number }[], z: number, color: number): THREE.Mesh {
      const shape = new THREE.Shape();
      shape.moveTo(points[0].x, points[0].y);
      shape.lineTo(points[1].x, points[1].y);
      shape.lineTo(points[2].x, points[2].y);
      shape.lineTo(points[3].x, points[3].y);
      shape.lineTo(points[0].x, points[0].y);
      
      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshLambertMaterial({ 
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = z;
      
      return mesh;
    }
    
    // Load the stair models
    console.log('Fetching stair.json...');
    fetch('/stair.json')
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Stair data loaded:', data);
        
        // Handle both single object and array
        const stairModels: StairModel[] = Array.isArray(data) ? data : [data];
        console.log(`Found ${stairModels.length} stair models`);
        
        // Populate the dropdown
        const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
        if (modelSelect) {
          // Clear existing options
          while (modelSelect.firstChild) {
            modelSelect.removeChild(modelSelect.firstChild);
          }
          
          stairModels.forEach((model, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = `${model.name} (ID: ${model.id})`;
            modelSelect.appendChild(option);
          });
          
          // Add event listener for dropdown changes
          modelSelect.addEventListener('change', function(this: HTMLSelectElement) {
            const selectedIndex = parseInt(this.value);
            console.log(`Switching to model ${selectedIndex}: ${stairModels[selectedIndex].name}`);
            visualizeStairModel(stairModels[selectedIndex]);
          });
        }
        
        // Function to visualize a stair model
        function visualizeStairModel(stairModel: StairModel): void {
          console.log('Visualizing stair model:', stairModel.name);
          
          // Clear previous model
          while(modelGroup.children.length > 0) { 
            modelGroup.remove(modelGroup.children[0]); 
          }
          
          // Get the info element
          const infoElement = document.getElementById('info');
          if (infoElement) {
            infoElement.textContent = `Stair Model: ${stairModel.name} (ID: ${stairModel.id})`;
          }
          
          // Center the model
          const boundingBox = stairModel.boundingBox;
          const centerX = (boundingBox.min.x + boundingBox.max.x) / 2;
          const centerY = (boundingBox.min.y + boundingBox.max.y) / 2;
          console.log('Model center:', { centerX, centerY });
          
          // Find horizontal 4-line loops
          const horizontalRectangles = [];
          let colorIndex = 0;
          const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
          
          console.log(`Processing ${stairModel.solids.length} solids...`);
          stairModel.solids.forEach((solid: Solid, solidIndex: number) => {
            console.log(`Solid ${solidIndex}: ${solid.faces.length} faces`);
            solid.faces.forEach((face: Face) => {
              face.loops.forEach((loop: Loop) => {
                // Check if it's a 4-line loop
                if (loop.length === 4) {
                  // Check if all points have the same z-value
                  const referenceZ = loop[0].start.z;
                  let isHorizontal = true;
                  
                  for (const line of loop) {
                    if (line.start.z !== referenceZ || line.end.z !== referenceZ) {
                      isHorizontal = false;
                      break;
                    }
                  }
                  
                  if (isHorizontal) {
                    // Extract the points
                    const points = [
                      { x: loop[0].start.x - centerX, y: loop[0].start.y - centerY },
                      { x: loop[1].start.x - centerX, y: loop[1].start.y - centerY },
                      { x: loop[2].start.x - centerX, y: loop[2].start.y - centerY },
                      { x: loop[3].start.x - centerX, y: loop[3].start.y - centerY }
                    ];
                    
                    // Create a rectangle and add it to the scene
                    const color = colors[colorIndex % colors.length];
                    const rectangle = createRectangle(points, referenceZ, color);
                    modelGroup.add(rectangle);
                    
                    horizontalRectangles.push({
                      z: referenceZ,
                      mesh: rectangle
                    });
                    
                    colorIndex++;
                  }
                }
              });
            });
          });
          
          console.log(`Found ${horizontalRectangles.length} horizontal rectangles`);
          
          // Update info text
          if (infoElement) {
            infoElement.textContent = `Stair Model: ${stairModel.name} (ID: ${stairModel.id})
Found ${horizontalRectangles.length} horizontal rectangles`;
          }
          
          // Position camera to see the model
          const bbox = new THREE.Box3().setFromObject(modelGroup);
          const center = bbox.getCenter(new THREE.Vector3());
          const size = bbox.getSize(new THREE.Vector3());
          console.log('Bounding box:', { center, size });
          
          // Calculate a better camera position that looks at the model
          // Position the camera at a distance that ensures the entire model is visible
          const maxDimension = Math.max(size.x, size.y, size.z);
          const distance = maxDimension * 1.5; // Adjust this multiplier as needed
          
          // Position camera at a good viewing angle (front-ish view)
          camera.position.set(
            center.x + distance * 0.7, // Slightly to the right
            center.y - distance * 0.7, // Slightly in front
            center.z + distance * 0.5  // Above the model
          );
          console.log('Camera position:', camera.position);
          
          // Look directly at the center of the model
          camera.lookAt(center);
          
          // Calculate the yaw and pitch based on the camera's direction
          const direction = new THREE.Vector3();
          direction.subVectors(center, camera.position).normalize();
          
          // Calculate yaw (rotation around Z axis)
          cameraState.yaw = Math.atan2(direction.x, direction.y);
          
          // Calculate pitch (rotation up/down)
          const horizontalDistance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
          cameraState.pitch = Math.atan2(direction.z, horizontalDistance);
          
          // Ensure Z stays as up direction
          camera.up.set(0, 0, 1);
        }
        
        // Visualize the first model initially
        if (stairModels.length > 0) {
          console.log(`Visualizing first model: ${stairModels[0].name}`);
          visualizeStairModel(stairModels[0]);
        }
      })
      .catch(error => {
        console.error('Error loading stair model:', error);
        const infoElement = document.getElementById('info');
        if (infoElement) {
          infoElement.textContent = `Error loading stair model: ${error.message}`;
        }
      });
    
    // Animation loop
    function animate(): void {
      requestAnimationFrame(animate);
      updateCameraPosition();
      renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    function handleResize(): void {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerlockchange', () => {});
      document.removeEventListener('mousemove', () => {});
      document.removeEventListener('keydown', () => {});
      document.removeEventListener('keyup', () => {});
      
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="relative w-full h-screen">
      {/* Three.js container */}
      <div 
        ref={containerRef} 
        className="w-full h-full absolute top-0 left-0"
      />
      
      {/* Fixed overlays with !important styles to ensure visibility */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10000
      }}>
        {/* Info panel */}
        <div 
          id="info"
          style={{ 
            position: 'absolute',
            top: '16px',
            left: '16px',
            color: 'white',
            fontFamily: 'monospace',
            whiteSpace: 'pre-line',
            pointerEvents: 'none',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '16px',
            maxWidth: '400px',
            minWidth: '300px',
            zIndex: 10000,
            borderRadius: '8px',
            border: '1px solid #666',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
          }}
        >
          Loading stair model...
        </div>
        
        {/* Controls panel */}
        <div 
          id="controls"
          style={{ 
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            color: 'white',
            fontFamily: 'sans-serif',
            pointerEvents: 'auto',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '16px',
            minWidth: '250px',
            zIndex: 10000,
            borderRadius: '8px',
            border: '1px solid #666',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
          }}
        >
          <label 
            htmlFor="modelSelect" 
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              fontSize: '18px'
            }}
          >
            Select Stair Model:
          </label>
          <select 
            id="modelSelect"
            style={{
              width: '100%',
              padding: '8px',
              color: 'white',
              backgroundColor: '#444',
              border: '1px solid #666',
              borderRadius: '4px'
            }}
          >
            {/* Options will be populated by JavaScript */}
          </select>
        </div>
        
        {/* Camera controls info */}
        <div 
          id="cameraInfo"
          style={{ 
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            color: 'white',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '12px',
            zIndex: 10000,
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '14px'
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <strong>Click</strong> to toggle camera controls
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <span>Mouse:</span><span>Look around</span>
            <span>W/A/S/D:</span><span>Move</span>
            <span>Space:</span><span>Up</span>
            <span>Shift:</span><span>Down</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
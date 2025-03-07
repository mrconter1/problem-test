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

interface Loop extends Array<Line> {}

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
    
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -20, 20);
    camera.up.set(0, 0, 1); // Set Z as up direction
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    // FPS-style controls
    const moveSpeed = 0.5;
    const lookSpeed = 0.002;
    
    // Movement state
    const movement = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false
    };
    
    // Camera state
    const cameraState = {
      yaw: 0,   // Rotation around Z axis (left/right)
      pitch: 0  // Rotation around X/Y plane (up/down)
    };
    
    // Set up pointer lock for mouse control
    renderer.domElement.addEventListener('click', () => {
      renderer.domElement.requestPointerLock();
    });
    
    document.addEventListener('pointerlockchange', () => {
      const isLocked = document.pointerLockElement === renderer.domElement;
      const cameraInfoElement = document.getElementById('cameraInfo');
      if (cameraInfoElement) {
        cameraInfoElement.style.display = isLocked ? 'none' : 'block';
      }
    });
    
    // Mouse movement handler
    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement === renderer.domElement) {
        // Update camera rotation based on mouse movement
        // Inverted left/right movement (positive sign for yaw)
        cameraState.yaw += event.movementX * lookSpeed;
        cameraState.pitch -= event.movementY * lookSpeed;
        
        // Limit vertical rotation to prevent flipping
        cameraState.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, cameraState.pitch));
        
        updateCameraDirection();
      }
    });
    
    // Keyboard handlers
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW': movement.forward = true; break;
        case 'KeyS': movement.backward = true; break;
        case 'KeyA': movement.left = true; break;
        case 'KeyD': movement.right = true; break;
        case 'Space': movement.up = true; break;
        case 'ControlLeft': 
          movement.down = true; 
          event.preventDefault(); // Prevent browser from capturing Ctrl key
          break;
      }
    });
    
    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW': movement.forward = false; break;
        case 'KeyS': movement.backward = false; break;
        case 'KeyA': movement.left = false; break;
        case 'KeyD': movement.right = false; break;
        case 'Space': movement.up = false; break;
        case 'ControlLeft': movement.down = false; break;
      }
    });
    
    // Update camera direction based on yaw and pitch
    function updateCameraDirection() {
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
    function updateCameraPosition() {
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
    
    // Function to create text sprite for axis labels
    function createTextSprite(text: string, color: string) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return new THREE.Sprite();
      
      canvas.width = 256;
      canvas.height = 256;
      
      context.font = "Bold 60px Arial";
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 128, 128);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(5, 5, 1);
      
      return sprite;
    }
    
    // Add axis labels
    const xLabel = createTextSprite("X", "#ff0000");
    xLabel.position.set(12, 0, 0);
    scene.add(xLabel);
    
    const yLabel = createTextSprite("Y", "#00ff00");
    yLabel.position.set(0, 12, 0);
    scene.add(yLabel);
    
    const zLabel = createTextSprite("Z", "#0000ff");
    zLabel.position.set(0, 0, 12);
    scene.add(zLabel);
    
    // Function to create a rectangle from 4 points
    function createRectangle(points: { x: number, y: number }[], z: number, color: number) {
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
    
    // Store all stair models
    let allStairModels: StairModel[] = [];
    // Group to hold the current model's objects
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    
    // Function to visualize a stair model
    function visualizeStairModel(stairModel: StairModel) {
      // Clear previous model
      while(modelGroup.children.length > 0) { 
        modelGroup.remove(modelGroup.children[0]); 
      }
      
      const infoElement = document.getElementById('info');
      if (infoElement) {
        infoElement.textContent = `Stair Model: ${stairModel.name} (ID: ${stairModel.id})`;
      }
      
      // Center the model
      const boundingBox = stairModel.boundingBox;
      const centerX = (boundingBox.min.x + boundingBox.max.x) / 2;
      const centerY = (boundingBox.min.y + boundingBox.max.y) / 2;
      
      // Find horizontal 4-line loops
      let horizontalRectangles = [];
      let colorIndex = 0;
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
      
      stairModel.solids.forEach(solid => {
        solid.faces.forEach(face => {
          face.loops.forEach(loop => {
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
      
      // Update info
      if (infoElement) {
        infoElement.textContent += `\nFound ${horizontalRectangles.length} horizontal rectangles`;
        
        // Add a legend explaining the coordinate system
        infoElement.textContent += `\n\nCoordinate System:`;
        infoElement.textContent += `\nX-axis (Red): Width`;
        infoElement.textContent += `\nY-axis (Green): Depth`;
        infoElement.textContent += `\nZ-axis (Blue): Height`;
      }
      
      // Position camera to see the model
      const bbox = new THREE.Box3().setFromObject(modelGroup);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());
      
      // Position camera at a good starting point
      camera.position.set(center.x, center.y - size.y, center.z + size.z / 2);
      
      // Reset camera rotation
      cameraState.yaw = Math.PI / 2; // Look toward +Y initially
      cameraState.pitch = 0;
      updateCameraDirection();
    }
    
    // Load the stair models
    fetch('/stair.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Handle both single object and array
        allStairModels = Array.isArray(data) ? data : [data];
        
        // Populate the dropdown
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
          // Clear existing options
          while (modelSelect.firstChild) {
            modelSelect.removeChild(modelSelect.firstChild);
          }
          
          allStairModels.forEach((model, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = `${model.name} (ID: ${model.id})`;
            modelSelect.appendChild(option);
          });
          
          // Add event listener for dropdown changes
          modelSelect.addEventListener('change', function(this: HTMLSelectElement) {
            const selectedIndex = parseInt(this.value);
            visualizeStairModel(allStairModels[selectedIndex]);
          });
        }
        
        // Visualize the first model initially
        if (allStairModels.length > 0) {
          visualizeStairModel(allStairModels[0]);
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
    function animate() {
      requestAnimationFrame(animate);
      updateCameraPosition();
      renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    function handleResize() {
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
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="relative w-full h-screen">
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      
      <div 
        id="info"
        className="absolute top-4 left-4 text-white bg-black/50 p-3 font-mono whitespace-pre-line pointer-events-none"
      >
        Loading stair model...
      </div>
      
      <div 
        id="controls"
        className="absolute bottom-4 right-4 bg-black/50 p-3 rounded text-white font-sans"
      >
        <label htmlFor="modelSelect" className="block mb-1">Select Stair Model:</label>
        <select 
          id="modelSelect"
          className="w-full p-1 bg-gray-700 text-white border border-gray-600 rounded"
        >
          {/* Options will be populated by JavaScript */}
        </select>
      </div>
      
      <div 
        id="cameraInfo"
        className="absolute bottom-4 left-4 text-white bg-black/50 p-3 font-mono"
      >
        Mouse: Look around<br />
        W/A/S/D: Move<br />
        Space: Move up<br />
        Left Ctrl: Move down
      </div>
    </div>
  );
} 
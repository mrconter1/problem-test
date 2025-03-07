import * as THREE from 'three';
import { CameraState, MovementState } from './types';

/**
 * Setup pointer lock and camera controls
 */
export function setupCameraControls(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  cameraState: CameraState,
  movement: MovementState
): () => void {
  console.log('Setting up camera controls');
  
  // Set up pointer lock for mouse control - left-click to toggle
  const handleCanvasClick = (event: MouseEvent) => {
    // Only respond to left-click (button 0)
    if (event.button !== 0) return;
    
    console.log('Canvas clicked, requesting pointer lock');
    if (document.pointerLockElement === renderer.domElement) {
      // If already locked, exit pointer lock
      console.log('Exiting pointer lock via left-click');
      document.exitPointerLock();
    } else {
      // If not locked, request pointer lock
      console.log('Entering pointer lock via left-click');
      renderer.domElement.requestPointerLock();
    }
  };
  
  // Register click event
  renderer.domElement.addEventListener('click', handleCanvasClick);
  
  // Prevent default context menu behavior
  renderer.domElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
  
  // Pointer lock change handler
  const handlePointerLockChange = () => {
    const isLocked = document.pointerLockElement === renderer.domElement;
    console.log('Pointer lock changed, locked:', isLocked);
    
    // Update the control info visibility
    const cameraInfoElement = document.getElementById('cameraInfo');
    if (cameraInfoElement) {
      cameraInfoElement.style.display = isLocked ? 'none' : 'block';
    }
    
    // Add a visual indicator when controls are active
    if (isLocked) {
      // Add a small dot in the center of the screen
      console.log('Adding control indicator');
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
      console.log('Removing control indicator');
      const controlIndicator = document.getElementById('controlIndicator');
      if (controlIndicator) {
        controlIndicator.remove();
      }
    }
    
    // Reset all movement states when exiting pointer lock
    if (!isLocked) {
      console.log('Resetting movement states');
      movement.forward = false;
      movement.backward = false;
      movement.left = false;
      movement.right = false;
      movement.up = false;
      movement.down = false;
    }
  };
  
  // Mouse movement handler
  const handleMouseMove = (event: MouseEvent) => {
    if (document.pointerLockElement === renderer.domElement) {
      const lookSpeed = 0.002;
      
      // Debug mouse movement
      if (event.movementX !== 0 || event.movementY !== 0) {
        console.log('Mouse moved:', event.movementX, event.movementY);
      }
      
      // Update camera rotation based on mouse movement
      cameraState.yaw += event.movementX * lookSpeed;
      cameraState.pitch -= event.movementY * lookSpeed;
      
      // Limit vertical rotation to prevent flipping
      cameraState.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, cameraState.pitch));
      
      updateCameraDirection(camera, cameraState);
    }
  };
  
  // Keyboard handler for keydown
  const handleKeyDown = (event: KeyboardEvent) => {
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
  };
  
  // Keyboard handler for keyup
  const handleKeyUp = (event: KeyboardEvent) => {
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
  };
  
  // Add event listeners
  document.addEventListener('pointerlockchange', handlePointerLockChange);
  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  // Log that controls are set up
  console.log('Camera controls initialized');
  
  // Return cleanup function
  return () => {
    console.log('Cleaning up camera controls');
    renderer.domElement.removeEventListener('click', handleCanvasClick);
    document.removeEventListener('pointerlockchange', handlePointerLockChange);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
  };
}

/**
 * Update camera direction based on yaw and pitch
 */
export function updateCameraDirection(camera: THREE.PerspectiveCamera, cameraState: CameraState): void {
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

/**
 * Update camera position based on keyboard input
 */
export function updateCameraPosition(
  camera: THREE.PerspectiveCamera, 
  movement: MovementState, 
  cameraState: CameraState
): void {
  if (!Object.values(movement).some(Boolean)) return; // Skip if no movement
  
  const moveSpeed = 0.5;
  
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
  updateCameraDirection(camera, cameraState);
} 
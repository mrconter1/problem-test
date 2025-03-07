import * as THREE from 'three';

/**
 * Initialize the scene with grid and axes
 */
export function initializeScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333); // Match original background color
  
  // Add ambient light - make it brighter
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  
  // Add directional light with more intensity
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Add a second directional light from a different angle
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight2.position.set(-1, -1, 0.5);
  scene.add(directionalLight2);
  
  // Add grid - make it more visible
  const gridHelper = new THREE.GridHelper(200, 50, 0xaaaaaa, 0x666666);
  // Rotate to make XY plane the ground (with Z up)
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);
  
  // Add axes helper - make it larger
  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);
  
  return scene;
}

/**
 * Create a label for axis
 */
export function createAxisLabel(
  scene: THREE.Scene,
  text: string, 
  position: THREE.Vector3, 
  color: number
): void {
  // Create a canvas for the label
  const canvas = document.createElement('canvas');
  // Increase canvas size for better resolution
  canvas.width = 128;
  canvas.height = 128;
  
  // Get the context
  const context = canvas.getContext('2d');
  if (!context) {
    console.error('Could not get canvas context');
    return;
  }
  
  // Clear background
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set text properties - increase font size for better quality
  context.font = 'Bold 72px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // Draw text outline (black border)
  context.lineWidth = 6;
  context.strokeStyle = '#000000';
  context.strokeText(text, centerX, centerY);
  
  // Draw the text in the specified color
  context.fillStyle = '#ffffff';
  context.fillText(text, centerX, centerY);
  
  // Create texture with improved settings
  const texture = new THREE.CanvasTexture(canvas);
  // Add this to improve sharpness
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  
  // Create sprite material
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: color,
    depthTest: false,
    depthWrite: false,
    transparent: true
  });
  
  // Create sprite
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  // Adjust scale to match the increased canvas size
  sprite.scale.set(2.5, 2.5, 2.5);
  
  // Add to scene
  scene.add(sprite);
}

/**
 * Add axis labels to the scene
 */
export function addAxisLabels(scene: THREE.Scene): void {
  // Create axis labels
  createAxisLabel(scene, 'X', new THREE.Vector3(11, 0, 0), 0xff0000);
  createAxisLabel(scene, 'Y', new THREE.Vector3(0, 11, 0), 0x00ff00);
  createAxisLabel(scene, 'Z', new THREE.Vector3(0, 0, 11), 0x0000ff);
}

/**
 * Initialize the renderer
 */
export function initializeRenderer(container: HTMLElement): THREE.WebGLRenderer {
  console.log('Initializing renderer with container:', container);
  
  // Create renderer with better settings
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  
  // Set size to match container
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Enable shadows
  renderer.shadowMap.enabled = true;
  
  // Clear any existing canvas
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  // Append canvas to container
  container.appendChild(renderer.domElement);
  
  // Style the canvas
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  
  console.log('Renderer initialized, canvas appended to container');
  
  return renderer;
}

/**
 * Initialize the camera
 */
export function initializeCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
  );
  
  // Set initial position and orientation
  camera.position.set(0, -10, 5);
  camera.up.set(0, 0, 1); // Set Z-up coordinate system
  
  return camera;
}

/**
 * Handle window resize
 */
export function handleResize(
  camera: THREE.PerspectiveCamera, 
  renderer: THREE.WebGLRenderer
): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
} 
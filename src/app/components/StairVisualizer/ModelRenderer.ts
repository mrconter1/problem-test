import * as THREE from 'three';
import { StairModel, Loop, Face, Point } from './types';

/**
 * Create a rectangle mesh from points
 */
export function createRectangle(
  points: { x: number, y: number }[], 
  z: number, 
  color: number
): THREE.Mesh {
  // Create a shape from points
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  shape.lineTo(points[1].x, points[1].y);
  shape.lineTo(points[2].x, points[2].y);
  shape.lineTo(points[3].x, points[3].y);
  shape.lineTo(points[0].x, points[0].y);
  
  // Create geometry
  const geometry = new THREE.ShapeGeometry(shape);
  
  // Set z-coordinate for all vertices
  const positionAttribute = geometry.getAttribute('position');
  for (let i = 0; i < positionAttribute.count; i++) {
    positionAttribute.setZ(i, z);
  }
  
  // Update normals
  geometry.computeVertexNormals();
  
  // Create material with more vibrant color and less transparency
  const material = new THREE.MeshLambertMaterial({ 
    color, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    emissive: new THREE.Color(color).multiplyScalar(0.2) // Add some emissive property to be more visible
  });
  
  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.isStairModelPart = true;
  
  return mesh;
}

/**
 * Get points from a face loop
 */
function getPointsFromLoop(loop: Loop): Point[] {
  const points: Point[] = [];
  loop.forEach(line => {
    points.push(line.start);
  });
  return points;
}

/**
 * Check if a loop is horizontal
 */
function isHorizontalLoop(loop: Loop): boolean {
  if (loop.length === 0) return false;
  
  // Check if it's a 4-line loop (rectangle)
  if (loop.length !== 4) return false;
  
  // Get z-coordinate of first point
  const z = loop[0].start.z;
  
  // Check if all points have the same z-coordinate
  return loop.every(line => 
    Math.abs(line.start.z - z) < 0.001 && 
    Math.abs(line.end.z - z) < 0.001
  );
}

/**
 * Visualize a stair model
 */
export function visualizeStairModel(
  scene: THREE.Scene, 
  stairModel: StairModel,
  updateInfoText: (text: string) => void
): number {
  console.log(`Visualizing stair model: ${stairModel.name}`);
  
  // Remove any existing model group and create a new one
  scene.children.forEach(child => {
    if (child.userData && child.userData.isModelGroup) {
      scene.remove(child);
    }
  });
  
  // Create a new group for the model
  const modelGroup = new THREE.Group();
  modelGroup.userData.isModelGroup = true;
  scene.add(modelGroup);
  
  // Clear any existing stair model parts
  scene.children.forEach(child => {
    if (child instanceof THREE.Mesh && child.userData.isStairModelPart) {
      scene.remove(child);
    }
  });
  
  // Count horizontal rectangles for info
  let horizontalRectangleCount = 0;
  const colors = [0x4287f5, 0x42f5a7, 0xf542cb, 0xf5a742, 0xf54242, 0x42f5dd];
  let colorIndex = 0;
  
  // Get the model center
  const boundingBox = stairModel.boundingBox;
  const centerX = (boundingBox.min.x + boundingBox.max.x) / 2;
  const centerY = (boundingBox.min.y + boundingBox.max.y) / 2;
  const centerZ = (boundingBox.min.z + boundingBox.max.z) / 2;
  console.log('Model center:', { centerX, centerY, centerZ });
  console.log('Model size:', {
    width: boundingBox.max.x - boundingBox.min.x,
    depth: boundingBox.max.y - boundingBox.min.y, 
    height: boundingBox.max.z - boundingBox.min.z
  });
  
  // Add a marker at the model center for debugging
  const centerMarker = new THREE.Mesh(
    new THREE.SphereGeometry(3, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  centerMarker.position.set(0, 0, 0);
  modelGroup.add(centerMarker);
  
  // Process solids
  console.log(`Processing ${stairModel.solids.length} solids...`);
  stairModel.solids.forEach((solid, solidIndex) => {
    console.log(`Solid ${solidIndex}: ${solid.faces.length} faces`);
    // Process faces in the solid
    solid.faces.forEach(face => {
      // Process loops in the face
      face.loops.forEach(loop => {
        // Check if this is a horizontal loop
        if (isHorizontalLoop(loop)) {
          horizontalRectangleCount++;
          
          // Get points from the loop
          const points = getPointsFromLoop(loop);
          
          // Get z-coordinate from the first point
          const z = points[0].z;
          
          // Convert to 2D points for ShapeGeometry, centered on model center
          const points2D = points.map(p => ({ 
            x: p.x - centerX, 
            y: p.y - centerY 
          }));
          
          // Create rectangle mesh with cycling colors
          const color = colors[colorIndex % colors.length];
          const rectangleMesh = createRectangle(points2D, z - centerZ, color);
          colorIndex++;
          
          // Add to model group
          modelGroup.add(rectangleMesh);
        }
      });
    });
  });
  
  // Compute bounding box of the model group to properly position camera
  const bbox = new THREE.Box3().setFromObject(modelGroup);
  const size = bbox.getSize(new THREE.Vector3());
  const center = bbox.getCenter(new THREE.Vector3());
  console.log('Model size:', size);
  console.log('Model center after processing:', center);
  
  // Add bounding box helper
  const bboxHelper = new THREE.Box3Helper(bbox, 0xffff00);
  scene.add(bboxHelper);
  
  console.log(`Found ${horizontalRectangleCount} horizontal rectangles`);
  
  // Update info text
  const infoContent = `Stair Model: ${stairModel.name} (ID: ${stairModel.id})\nFound ${horizontalRectangleCount} horizontal rectangles`;
  updateInfoText(infoContent);
  
  // Return the count of horizontal rectangles
  return horizontalRectangleCount;
}

/**
 * Process models data from server
 */
export async function loadStairModels(): Promise<StairModel[]> {
  try {
    // Fetch models from the server using the correct endpoint
    const response = await fetch('/stair.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle both single object and array
    const stairModels: StairModel[] = Array.isArray(data) ? data : [data];
    console.log(`Found ${stairModels.length} stair models`);
    
    return stairModels;
  } catch (error) {
    console.error('Error loading stair models:', error);
    throw error;
  }
} 

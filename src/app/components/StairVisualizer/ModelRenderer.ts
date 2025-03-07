import * as THREE from 'three';
import { StairModel, Loop, Face, Point, RenderingMode } from './types';

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
  
  // Check if it's a 4-line or 5-line loop (rectangle or pentagon)
  if (loop.length !== 4 && loop.length !== 5) return false;
  
  // Get z-coordinate of first point
  const z = loop[0].start.z;
  
  // Check if all points have the same z-coordinate
  return loop.every(line => 
    Math.abs(line.start.z - z) < 0.001 && 
    Math.abs(line.end.z - z) < 0.001
  );
}

/**
 * Create a non-rectangular face mesh from points
 */
export function createFace(
  points: Point[], 
  color: number
): THREE.Mesh {
  // Create geometry using BufferGeometry for arbitrary 3D face
  const geometry = new THREE.BufferGeometry();
  
  // Create vertices
  const vertices = [];
  for (const point of points) {
    vertices.push(point.x, point.y, point.z);
  }
  
  // Create triangulation (simple fan triangulation)
  const indices = [];
  for (let i = 1; i < points.length - 1; i++) {
    indices.push(0, i, i + 1);
  }
  
  // Set attributes
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  // Compute normals
  geometry.computeVertexNormals();
  
  // Create material
  const material = new THREE.MeshLambertMaterial({ 
    color, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    emissive: new THREE.Color(color).multiplyScalar(0.2)
  });
  
  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.isStairModelPart = true;
  
  return mesh;
}

/**
 * Visualize a stair model
 */
export function visualizeStairModel(
  scene: THREE.Scene, 
  stairModel: StairModel,
  updateInfoText: (text: string) => void,
  renderingMode: RenderingMode = RenderingMode.ALL_FACES
): number {
  console.log(`Visualizing stair model: ${stairModel.name}, Mode: ${renderingMode}`);
  
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
  
  // Count faces for info
  let horizontalRectangleCount = 0;
  let totalFaceCount = 0;
  
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
  
  // Process solids
  console.log(`Processing ${stairModel.solids.length} solids...`);
  stairModel.solids.forEach((solid, solidIndex) => {
    console.log(`Solid ${solidIndex}: ${solid.faces.length} faces`);
    
    // Process faces in the solid
    solid.faces.forEach(face => {
      // Process loops in the face
      face.loops.forEach(loop => {
        const isHorizontalRectangle = isHorizontalLoop(loop);
        totalFaceCount++;
        
        // Get points from the loop
        const points = getPointsFromLoop(loop);
        
        if (renderingMode === RenderingMode.ALL_FACES) {
          // Choose color
          const color = colors[colorIndex % colors.length];
          colorIndex++;
          
          if (isHorizontalRectangle) {
            // Get z-coordinate from the first point
            const z = points[0].z;
            
            // Convert to 2D points for ShapeGeometry, centered on model center
            const points2D = points.map(p => ({ 
              x: p.x - centerX, 
              y: p.y - centerY 
            }));
            
            // Create rectangle mesh
            const rectangleMesh = createRectangle(points2D, z - centerZ, color);
            
            // Add to model group
            modelGroup.add(rectangleMesh);
          } else {
            // For non-rectangular faces
            // Adjust points to be relative to model center
            const centeredPoints = points.map(p => ({
              x: p.x - centerX,
              y: p.y - centerY,
              z: p.z - centerZ
            }));
            
            // Create non-rectangular face mesh
            const faceMesh = createFace(centeredPoints, color);
            
            // Add to model group
            modelGroup.add(faceMesh);
          }
        } else if (renderingMode === RenderingMode.FLAT_RECTANGLES) {
          if (isHorizontalRectangle) {
            horizontalRectangleCount++;
            
            // Choose color for rectangular face
            const color = colors[colorIndex % colors.length];
            colorIndex++;
            
            // Get z-coordinate from the first point
            const z = points[0].z;
            
            // Convert to 2D points for ShapeGeometry, centered on model center
            const points2D = points.map(p => ({ 
              x: p.x - centerX, 
              y: p.y - centerY 
            }));
            
            // Create rectangle mesh
            const rectangleMesh = createRectangle(points2D, z - centerZ, color);
            
            // Add to model group
            modelGroup.add(rectangleMesh);
          } else {
            // For non-rectangular faces in FLAT_RECTANGLES mode, create with high transparency
            // Adjust points to be relative to model center
            const centeredPoints = points.map(p => ({
              x: p.x - centerX,
              y: p.y - centerY,
              z: p.z - centerZ
            }));
            
            // Create non-rectangular face mesh with high transparency and single color
            const ghostMaterial = new THREE.MeshLambertMaterial({ 
              color: 0xcccccc, // Light gray for all non-rectangular faces
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.15, // Very transparent
              depthWrite: false // Allow seeing through overlapping faces
            });
            
            // Create geometry using BufferGeometry for arbitrary 3D face
            const geometry = new THREE.BufferGeometry();
            
            // Create vertices
            const vertices = [];
            for (const point of centeredPoints) {
              vertices.push(point.x, point.y, point.z);
            }
            
            // Create triangulation (simple fan triangulation)
            const indices = [];
            for (let i = 1; i < centeredPoints.length - 1; i++) {
              indices.push(0, i, i + 1);
            }
            
            // Set attributes
            geometry.setIndex(indices);
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            
            // Compute normals
            geometry.computeVertexNormals();
            
            // Create mesh
            const ghostMesh = new THREE.Mesh(geometry, ghostMaterial);
            ghostMesh.userData.isStairModelPart = true;
            
            // Add to model group
            modelGroup.add(ghostMesh);
          }
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
  
  // Update info text based on rendering mode
  let infoContent = `Stair Model: ${stairModel.name} (ID: ${stairModel.id})\n`;
  if (renderingMode === RenderingMode.ALL_FACES) {
    infoContent += `Showing all faces (${totalFaceCount} faces total)`;
  } else {
    infoContent += `Highlighting ${horizontalRectangleCount} flat rectangles of ${totalFaceCount} total faces`;
  }
  updateInfoText(infoContent);
  
  // Return the count of rendered faces
  return renderingMode === RenderingMode.FLAT_RECTANGLES ? horizontalRectangleCount : totalFaceCount;
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

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
 * Check if a loop is a closed rectangle
 * A closed rectangle has 4 lines forming a complete circuit
 * with the end of each line connecting to the start of the next
 */
function isClosedRectangle(loop: Loop): boolean {
  // Must have exactly 4 lines to be a rectangle
  if (loop.length !== 4) return false;
  
  // First check that it forms a closed circuit
  for (let i = 0; i < loop.length; i++) {
    const currentLine = loop[i];
    const nextLine = loop[(i + 1) % loop.length]; // Wrap around to the first line
    
    // Check if the end of current line connects to the start of next line
    if (Math.abs(currentLine.end.x - nextLine.start.x) > 0.001 ||
        Math.abs(currentLine.end.y - nextLine.start.y) > 0.001 ||
        Math.abs(currentLine.end.z - nextLine.start.z) > 0.001) {
      return false; // Not connected
    }
  }
  
  // Check if it has right angles (perpendicular sides)
  // For a rectangle, alternate sides should be parallel
  const vectors = loop.map(line => ({
    x: line.end.x - line.start.x,
    y: line.end.y - line.start.y,
    z: line.end.z - line.start.z
  }));
  
  // Normalize vectors
  const normalizedVectors = vectors.map(v => {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return {
      x: v.x / length,
      y: v.y / length,
      z: v.z / length
    };
  });
  
  // For a rectangle, opposite sides should be parallel (dot product near 1 or -1)
  // and adjacent sides should be perpendicular (dot product near 0)
  const dot02 = normalizedVectors[0].x * normalizedVectors[2].x + 
                normalizedVectors[0].y * normalizedVectors[2].y + 
                normalizedVectors[0].z * normalizedVectors[2].z;
                
  const dot13 = normalizedVectors[1].x * normalizedVectors[3].x + 
                normalizedVectors[1].y * normalizedVectors[3].y + 
                normalizedVectors[1].z * normalizedVectors[3].z;
                
  const dot01 = normalizedVectors[0].x * normalizedVectors[1].x + 
                normalizedVectors[0].y * normalizedVectors[1].y + 
                normalizedVectors[0].z * normalizedVectors[1].z;
  
  // Check if opposite sides are parallel (dot product close to 1 or -1)
  // and adjacent sides are perpendicular (dot product close to 0)
  return (Math.abs(Math.abs(dot02) - 1) < 0.1) && 
         (Math.abs(Math.abs(dot13) - 1) < 0.1) && 
         (Math.abs(dot01) < 0.1);
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
 * Create a center marker for a rectangle
 */
function createCenterMarker(
  centerPoint: Point,
  size: number = 0.2,
  color: number = 0xff0000,
  faceSize: number = 1 // Added parameter for face size
): THREE.Mesh {
  // Scale marker size based on face size, but with min and max bounds
  const scaledSize = Math.max(0.2, Math.min(0.8, size * Math.sqrt(faceSize) * 0.2));
  
  // Create a small sphere to mark the center
  const geometry = new THREE.SphereGeometry(scaledSize, 16, 16);
  const material = new THREE.MeshPhongMaterial({ 
    color, 
    emissive: new THREE.Color(color).multiplyScalar(0.7),
    transparent: false,
    shininess: 80,
    specular: 0xffffff,
    depthTest: true
  });
  
  const marker = new THREE.Mesh(geometry, material);
  marker.position.set(centerPoint.x, centerPoint.y, centerPoint.z);
  marker.userData.isStairModelPart = true;
  marker.userData.isCenterMarker = true;
  
  // Add a small offset in the y-direction to ensure markers don't get hidden
  marker.position.z += scaledSize * 0.5;
  
  return marker;
}

/**
 * Calculate the center point of a rectangle from its points
 */
function calculateRectangleCenter(points: Point[]): Point {
  if (points.length < 3) {
    console.warn('Not enough points to calculate center');
    return { x: 0, y: 0, z: 0 };
  }
  
  // Calculate the average of all points
  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
      z: acc.z + point.z
    }),
    { x: 0, y: 0, z: 0 }
  );
  
  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
    z: sum.z / points.length
  };
}

/**
 * Calculate approximate area of a face from its points
 */
function calculateFaceArea(points: Point[]): number {
  if (points.length < 3) return 0;
  
  // Find the two largest distances between any two points as an estimate of length and width
  let maxDist1 = 0;
  let maxDist2 = 0;
  
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = Math.sqrt(
        Math.pow(points[i].x - points[j].x, 2) +
        Math.pow(points[i].y - points[j].y, 2) +
        Math.pow(points[i].z - points[j].z, 2)
      );
      
      if (dist > maxDist1) {
        maxDist2 = maxDist1;
        maxDist1 = dist;
      } else if (dist > maxDist2) {
        maxDist2 = dist;
      }
    }
  }
  
  // Approximate area as product of the two largest distances
  return maxDist1 * maxDist2;
}

/**
 * Filter rectangles to keep only the uppermost ones when stacked
 * @param rectangles Array of rectangles with their center points and z-coordinates
 * @param xyTolerance Tolerance for considering rectangles to be stacked (in same x,y position)
 * @returns Array of rectangle indices to keep
 */
function filterUppermostRectangles(
  rectangles: Array<{
    index: number;
    center: { x: number; y: number; z: number };
    points: Point[];
  }>,
  xyTolerance: number = 0.1
): number[] {
  // Group rectangles by similar x,y coordinates
  const groups: { [key: string]: number[] } = {};
  
  // First, create an index for each rectangle
  rectangles.forEach((rect, rectIndex) => {
    // Check against existing groups
    let foundGroup = false;
    
    Object.keys(groups).forEach(groupKey => {
      // Get a representative rectangle from this group
      const representativeRectIndex = groups[groupKey][0];
      const representativeRect = rectangles[representativeRectIndex];
      
      // Calculate distance in XY plane
      const xyDistance = Math.sqrt(
        Math.pow(rect.center.x - representativeRect.center.x, 2) +
        Math.pow(rect.center.y - representativeRect.center.y, 2)
      );
      
      // If within tolerance, add to this group
      if (xyDistance < xyTolerance) {
        groups[groupKey].push(rectIndex);
        foundGroup = true;
      }
    });
    
    // If no matching group, create a new one
    if (!foundGroup) {
      const newGroupKey = `group_${rectIndex}`;
      groups[newGroupKey] = [rectIndex];
    }
  });
  
  // For each group, keep only the rectangle with highest Z
  const indicesToKeep: number[] = [];
  
  Object.values(groups).forEach(group => {
    if (group.length === 0) return;
    
    // Find rectangle with highest Z in this group
    let highestZIndex = group[0];
    let highestZ = rectangles[highestZIndex].center.z;
    
    for (let i = 1; i < group.length; i++) {
      const currentZ = rectangles[group[i]].center.z;
      if (currentZ > highestZ) {
        highestZ = currentZ;
        highestZIndex = group[i];
      }
    }
    
    // Keep only the highest rectangle
    indicesToKeep.push(highestZIndex);
  });
  
  return indicesToKeep;
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
  
  // Add specific lighting for markers if in RECTANGLES_WITH_CENTERS mode
  if (renderingMode === RenderingMode.RECTANGLES_WITH_CENTERS) {
    // Remove any existing marker lights
    scene.children.forEach(child => {
      if (child.userData && child.userData.isMarkerLight) {
        scene.remove(child);
      }
    });
    
    // Add a directional light to better illuminate markers
    const markerLight = new THREE.DirectionalLight(0xffffff, 1.5);
    markerLight.position.set(0, 0, 10); // Light from above
    markerLight.userData.isMarkerLight = true;
    scene.add(markerLight);
  } else {
    // Remove any existing marker lights if not in center markers mode
    scene.children.forEach(child => {
      if (child.userData && child.userData.isMarkerLight) {
        scene.remove(child);
      }
    });
  }
  
  // Count faces for info
  let horizontalRectangleCount = 0;
  let closedRectangleCount = 0;
  let centerMarkersCount = 0;
  let uppermostRectanglesCount = 0;
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
  
  // Special handling for UPPERMOST_RECTANGLES mode to filter stacked rectangles
  if (renderingMode === RenderingMode.UPPERMOST_RECTANGLES) {
    // First pass: collect all closed horizontal rectangles
    const allRectangles: Array<{
      index: number;
      loopIndex: number;
      solidIndex: number;
      faceIndex: number;
      center: { x: number; y: number; z: number };
      points: Point[];
      color: number;
    }> = [];
    
    let rectangleIndex = 0;
    
    // Process solids to collect rectangles without rendering
    stairModel.solids.forEach((solid, solidIndex) => {
      solid.faces.forEach((face, faceIndex) => {
        face.loops.forEach((loop, loopIndex) => {
          const isRectangle = isClosedRectangle(loop);
          const isHorizontalRectangle = isHorizontalLoop(loop);
          totalFaceCount++;
          
          // Only collect closed horizontal rectangles
          if (isRectangle && isHorizontalRectangle) {
            const points = getPointsFromLoop(loop);
            const center = calculateRectangleCenter(points);
            const color = colors[colorIndex % colors.length];
            colorIndex++;
            
            allRectangles.push({
              index: rectangleIndex++,
              loopIndex,
              solidIndex,
              faceIndex,
              center,
              points,
              color
            });
          }
        });
      });
    });
    
    console.log(`Found ${allRectangles.length} closed horizontal rectangles`);
    
    // Filter to keep only uppermost rectangles
    const indicesToKeep = filterUppermostRectangles(allRectangles);
    
    console.log(`After filtering, keeping ${indicesToKeep.length} uppermost rectangles`);
    uppermostRectanglesCount = indicesToKeep.length;
    
    // Render the filtered rectangles
    indicesToKeep.forEach(rectIndex => {
      const rectangle = allRectangles[rectIndex];
      
      // Convert to 2D points for ShapeGeometry, centered on model center
      const points2D = rectangle.points.map(p => ({ 
        x: p.x - centerX, 
        y: p.y - centerY 
      }));
      
      // Get z-coordinate from the center
      const z = rectangle.points[0].z;
      
      // Create rectangle mesh
      const rectangleMesh = createRectangle(points2D, z - centerZ, rectangle.color);
      
      // Add to model group
      modelGroup.add(rectangleMesh);
    });
    
    // Create ghost meshes for all non-selected faces
    stairModel.solids.forEach((solid, solidIndex) => {
      solid.faces.forEach((face, faceIndex) => {
        face.loops.forEach((loop, loopIndex) => {
          // Skip the rectangles we've already rendered
          const isRectangle = isClosedRectangle(loop);
          const isHorizontalRectangle = isHorizontalLoop(loop);
          
          if (isRectangle && isHorizontalRectangle) {
            // Find if this is one of our rendered rectangles
            const matchIndex = allRectangles.findIndex(rect => 
              rect.solidIndex === solidIndex && 
              rect.faceIndex === faceIndex && 
              rect.loopIndex === loopIndex
            );
            
            // If this rectangle is rendered, skip creating a ghost mesh
            if (matchIndex >= 0 && indicesToKeep.includes(matchIndex)) {
              return;
            }
          }
          
          // Create ghost mesh for all other faces
          const points = getPointsFromLoop(loop);
          const centeredPoints = points.map(p => ({
            x: p.x - centerX,
            y: p.y - centerY,
            z: p.z - centerZ
          }));
          
          // Create non-rectangular face mesh with high transparency and single color
          const ghostMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xcccccc, // Light gray for all non-selected faces
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
        });
      });
    });
  } else {
    // Standard processing for other modes
    // Process solids
    console.log(`Processing ${stairModel.solids.length} solids...`);
    stairModel.solids.forEach((solid, solidIndex) => {
      console.log(`Solid ${solidIndex}: ${solid.faces.length} faces`);
      
      // Process faces in the solid
      solid.faces.forEach(face => {
        // Process loops in the face
        face.loops.forEach(loop => {
          const isHorizontalRectangle = isHorizontalLoop(loop);
          const isRectangle = isClosedRectangle(loop);
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
                color: 0xcccccc, // Light gray for all non-matching faces
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
          } else if (renderingMode === RenderingMode.CLOSED_RECTANGLES) {
            // Only show faces that are both closed rectangles AND horizontal
            if (isRectangle && isHorizontalRectangle) {
              closedRectangleCount++;
              
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
              // For non-rectangular or non-horizontal faces, create with high transparency
              const centeredPoints = points.map(p => ({
                x: p.x - centerX,
                y: p.y - centerY,
                z: p.z - centerZ
              }));
              
              // Create non-rectangular face mesh with high transparency and single color
              const ghostMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xcccccc, // Light gray for all non-matching faces
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
          } else if (renderingMode === RenderingMode.RECTANGLES_WITH_CENTERS) {
            // Draw closed horizontal rectangles with center markers
            if (isRectangle && isHorizontalRectangle) {
              closedRectangleCount++;
              centerMarkersCount++;
              
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
              
              // Calculate center point of the rectangle
              const originalPoints = points.map(p => ({
                x: p.x,
                y: p.y,
                z: p.z
              }));
              
              // Calculate face area to determine marker size
              const faceArea = calculateFaceArea(originalPoints);
              
              const centerPoint = calculateRectangleCenter(originalPoints);
              
              // Create center marker with bright red color
              // Position it slightly above the face to avoid z-fighting
              const centeredMarker = createCenterMarker(
                {
                  x: centerPoint.x - centerX,
                  y: centerPoint.y - centerY,
                  z: centerPoint.z - centerZ + 0.05
                },
                0.15, // Base size
                0xff0000, // Bright red
                faceArea // Pass face area for scaling
              );
              
              // Add center marker to model group
              modelGroup.add(centeredMarker);
              
              // Log debug info for face sizes
              console.log(`Added center marker for face with area: ${faceArea.toFixed(2)}`);
            } else {
              // For non-rectangular or non-horizontal faces, create with high transparency
              const centeredPoints = points.map(p => ({
                x: p.x - centerX,
                y: p.y - centerY,
                z: p.z - centerZ
              }));
              
              // Create non-rectangular face mesh with high transparency and single color
              const ghostMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xcccccc, // Light gray for all non-matching faces
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
  }
  
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
  } else if (renderingMode === RenderingMode.FLAT_RECTANGLES) {
    infoContent += `Highlighting ${horizontalRectangleCount} flat rectangles of ${totalFaceCount} total faces`;
  } else if (renderingMode === RenderingMode.CLOSED_RECTANGLES) {
    infoContent += `Highlighting ${closedRectangleCount} closed horizontal rectangles of ${totalFaceCount} total faces`;
  } else if (renderingMode === RenderingMode.RECTANGLES_WITH_CENTERS) {
    infoContent += `Showing ${centerMarkersCount} closed horizontal rectangles with center markers`;
  } else if (renderingMode === RenderingMode.UPPERMOST_RECTANGLES) {
    infoContent += `Showing ${uppermostRectanglesCount} uppermost closed horizontal rectangles`;
  }
  updateInfoText(infoContent);
  
  // Return the count of rendered faces based on mode
  if (renderingMode === RenderingMode.FLAT_RECTANGLES) {
    return horizontalRectangleCount;
  } else if (renderingMode === RenderingMode.CLOSED_RECTANGLES ||
             renderingMode === RenderingMode.RECTANGLES_WITH_CENTERS) {
    return closedRectangleCount;
  } else if (renderingMode === RenderingMode.UPPERMOST_RECTANGLES) {
    return uppermostRectanglesCount;
  }
  return totalFaceCount;
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

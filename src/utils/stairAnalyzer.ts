// stairAnalyzer.ts
import * as fs from 'fs';

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

// Calculate the length of a line
function calculateLineLength(line: Line): number {
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  const dz = line.end.z - line.start.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Check if a loop is horizontal (all points have the exact same z-value)
function isHorizontalLoop(loop: Loop): boolean {
  if (loop.length === 0) return false;
  
  const referenceZ = loop[0].start.z;
  
  // Check all points in the loop for exact equality
  for (const line of loop) {
    if (line.start.z !== referenceZ || line.end.z !== referenceZ) {
      return false; // Not horizontal if any z-value differs
    }
  }
  
  return true; // All z-values are exactly the same, it's a horizontal loop
}

// Main function
function analyzeStairs(filePath: string): void {
  try {
    // Read and parse the JSON file
    const data = fs.readFileSync(filePath, 'utf8');
    const stairModels: StairModel[] = JSON.parse(data);
    
    // Handle both single object and array of objects
    const modelsArray = Array.isArray(stairModels) ? stairModels : [stairModels];
    
    console.log(`Analyzing ${modelsArray.length} stair model(s)...\n`);
    
    // Analyze each stair model
    modelsArray.forEach((stairModel, index) => {
      console.log(`Stair Model #${index + 1} (ID: ${stairModel.id}, Name: ${stairModel.name})`);
      
      // Store horizontal 4-line loops
      let horizontalRectangles: { 
        solidIndex: number;
        faceIndex: number;
        loopIndex: number;
        z: number;
      }[] = [];
      
      let totalLoops = 0;
      let fourLineLoops = 0;
      
      // Process each loop
      stairModel.solids.forEach((solid, solidIndex) => {
        solid.faces.forEach((face, faceIndex) => {
          face.loops.forEach((loop, loopIndex) => {
            // Skip empty loops
            if (loop.length === 0) return;
            
            totalLoops++;
            
            // Check if it's a 4-line loop
            if (loop.length === 4) {
              fourLineLoops++;
              
              // Check if it's horizontal
              if (isHorizontalLoop(loop)) {
                horizontalRectangles.push({
                  solidIndex,
                  faceIndex,
                  loopIndex,
                  z: loop[0].start.z
                });
              }
            }
          });
        });
      });
      
      // Sort horizontal rectangles by z-value (ascending)
      horizontalRectangles.sort((a, b) => a.z - b.z);
      
      // Print results
      console.log(`\n  Summary:`);
      console.log(`    Total loops: ${totalLoops}`);
      console.log(`    4-line loops: ${fourLineLoops} (${((fourLineLoops / totalLoops) * 100).toFixed(1)}%)`);
      console.log(`    Horizontal 4-line loops (exact z-value): ${horizontalRectangles.length} (${((horizontalRectangles.length / fourLineLoops) * 100).toFixed(1)}% of 4-line loops)`);
      
      console.log(`\n  Horizontal 4-line loops (sorted by z-value):`);
      
      // Group by z-value
      const zGroups: { [z: string]: number } = {};
      
      horizontalRectangles.forEach(rect => {
        const zKey = rect.z.toFixed(4);
        if (!zGroups[zKey]) {
          zGroups[zKey] = 0;
        }
        zGroups[zKey]++;
      });
      
      // Print z-value groups
      Object.entries(zGroups).forEach(([z, count]) => {
        console.log(`    z = ${z}: ${count} horizontal rectangles`);
      });
      
      console.log('');
    });
    
  } catch (error) {
    console.error('Error processing the file:', error);
  }
}

// Run the function with the stair model file
analyzeStairs('./stair.json'); 
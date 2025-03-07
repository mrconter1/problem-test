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

// Function to check if a loop forms a flat horizontal surface
function isFlatHorizontal(loop: Loop): boolean {
  if (loop.length === 0) return false;
  
  // Get the z-value of the first point
  const referenceZ = loop[0].start.z;
  
  // Check all points in the loop
  for (const line of loop) {
    if (Math.abs(line.start.z - referenceZ) > 0.00001 || 
        Math.abs(line.end.z - referenceZ) > 0.00001) {
      return false; // Not flat if any z-value differs
    }
  }
  
  return true; // All z-values match, it's a flat horizontal surface
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
      
      let flatFaceCount = 0;
      
      // Iterate through all solids and their faces
      stairModel.solids.forEach((solid, solidIndex) => {
        let solidFlatFaces = 0;
        
        solid.faces.forEach(face => {
          face.loops.forEach(loop => {
            if (isFlatHorizontal(loop)) {
              flatFaceCount++;
              solidFlatFaces++;
            }
          });
        });
        
        console.log(`  Solid #${solidIndex + 1}: ${solidFlatFaces} flat horizontal faces`);
      });
      
      console.log(`  Total flat horizontal faces: ${flatFaceCount}\n`);
    });
    
  } catch (error) {
    console.error('Error processing the file:', error);
  }
}

// Run the function with the stair model file
analyzeStairs('./stair.json'); 
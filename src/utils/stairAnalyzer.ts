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

// Check if a loop is horizontal (all points have the exact same z-value)
function isHorizontalLoop(loop: Loop): boolean {
  if (loop.length === 0) return false;
  
  const referenceZ = loop[0].start.z;
  
  // Check all points in the loop are within 0.0001 of the reference z-value
  for (const line of loop) {
    if (Math.abs(line.start.z - referenceZ) > 0.0001 || Math.abs(line.end.z - referenceZ) > 0.0001) {
      return false; // Not horizontal if any z-value differs more than the threshold
    }
  }
  
  return true; // All z-values are within the threshold, it's a horizontal loop
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
      const horizontalRectangles: { 
        solidIndex: number;
        faceIndex: number;
        loopIndex: number;
        z: number;
        lineCount: number; // Added to track whether it's a 4-line or 5-line loop
      }[] = [];
      
      let totalLoops = 0;
      let fourLineLoops = 0;
      let fiveLineLoops = 0;
      
      // Process each loop
      stairModel.solids.forEach((solid, solidIndex) => {
        solid.faces.forEach((face, faceIndex) => {
          face.loops.forEach((loop, loopIndex) => {
            // Skip empty loops
            if (loop.length === 0) return;
            
            totalLoops++;
            
            // Check if it's a 4-line or 5-line loop
            if (loop.length === 4) {
              fourLineLoops++;
              
              // Check if it's horizontal
              if (isHorizontalLoop(loop)) {
                horizontalRectangles.push({
                  solidIndex,
                  faceIndex,
                  loopIndex,
                  z: loop[0].start.z,
                  lineCount: 4
                });
              }
            } else if (loop.length === 5) {
              fiveLineLoops++;
              
              // Print detailed information about the 5-line loop
              console.log(`\n  Found 5-line loop at solid=${solidIndex}, face=${faceIndex}, loop=${loopIndex}`);
              
              // Print the JSON data of each line in the loop
              console.log(`  5-line loop details:`);
              loop.forEach((line, lineIndex) => {
                console.log(`    Line ${lineIndex}:`);
                console.log(`      Start: x=${line.start.x.toFixed(4)}, y=${line.start.y.toFixed(4)}, z=${line.start.z.toFixed(4)}`);
                console.log(`      End:   x=${line.end.x.toFixed(4)}, y=${line.end.y.toFixed(4)}, z=${line.end.z.toFixed(4)}`);
              });
              
              // Check if it's horizontal
              const isHorizontal = isHorizontalLoop(loop);
              console.log(`    Is horizontal: ${isHorizontal}`);
              
              if (isHorizontal) {
                horizontalRectangles.push({
                  solidIndex,
                  faceIndex,
                  loopIndex,
                  z: loop[0].start.z,
                  lineCount: 5
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
      console.log(`    5-line loops: ${fiveLineLoops} (${((fiveLineLoops / totalLoops) * 100).toFixed(1)}%)`);
      console.log(`    Horizontal 4 or 5-line loops: ${horizontalRectangles.length} (${((horizontalRectangles.length / (fourLineLoops + fiveLineLoops)) * 100).toFixed(1)}% of 4 and 5-line loops)`);
      
      console.log(`\n  Horizontal loops (sorted by z-value):`);
      
      // Group by z-value
      const zGroups: { [z: string]: { total: number, fourLine: number, fiveLine: number } } = {};
      
      horizontalRectangles.forEach(rect => {
        const zKey = rect.z.toFixed(4);
        if (!zGroups[zKey]) {
          zGroups[zKey] = { total: 0, fourLine: 0, fiveLine: 0 };
        }
        zGroups[zKey].total++;
        if (rect.lineCount === 4) {
          zGroups[zKey].fourLine++;
        } else if (rect.lineCount === 5) {
          zGroups[zKey].fiveLine++;
        }
      });
      
      // Print z-value groups
      Object.entries(zGroups).forEach(([z, counts]) => {
        console.log(`    z = ${z}:`);
        console.log(`      Total loops: ${counts.total}`);
        console.log(`      4-line loops: ${counts.fourLine} (${((counts.fourLine / counts.total) * 100).toFixed(1)}%)`);
        console.log(`      5-line loops: ${counts.fiveLine} (${((counts.fiveLine / counts.total) * 100).toFixed(1)}%)`);
      });
      
      // Print a detailed summary of all horizontal 5-line loops
      const horizontalFiveLineLoops = horizontalRectangles.filter(rect => rect.lineCount === 5);
      
      if (horizontalFiveLineLoops.length > 0) {
        console.log(`\n  Detailed summary of all horizontal 5-line loops:`);
        
        horizontalFiveLineLoops.forEach((rect, index) => {
          console.log(`\n    5-line loop #${index + 1}:`);
          console.log(`      Located at: solid=${rect.solidIndex}, face=${rect.faceIndex}, loop=${rect.loopIndex}`);
          console.log(`      Z-value: ${rect.z.toFixed(6)}`);
          
          // Get and print the loop details
          const loop = stairModel.solids[rect.solidIndex].faces[rect.faceIndex].loops[rect.loopIndex];
          
          // Get points from the loop for visualization
          const points: Point[] = [];
          loop.forEach(line => {
            points.push(line.start);
          });
          
          console.log(`      Points (${points.length}):`);
          points.forEach((point, pointIndex) => {
            console.log(`        Point ${pointIndex}: x=${point.x.toFixed(4)}, y=${point.y.toFixed(4)}, z=${point.z.toFixed(6)}`);
          });
        });
      } else {
        console.log(`\n  No horizontal 5-line loops found in this model.`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('Error processing the file:', error);
  }
}

// Run the function with the stair model file
analyzeStairs('./stair.json'); 
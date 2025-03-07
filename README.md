# Finding the Smallest Stair Step

I needed to identify the stair step with the smallest depth in architectural 3D models.

## My Process

1. First, I examined the attached 3D stair models to get familiar with how they look in three dimensions.

2. After examining the data format, I discovered:
   - The file contains 3D data for multiple stairs (although the filename "Stair" is singular - sneaky!)
   - The "loops" data object contains the lines that make up each face
   - From my experience with 3D modeling, I assumed z dimension represents the vertical direction (up and down)

3. I spent some time grasping the core problem. Initially considering line-fitting approaches, I realized the challenge perhaps is a bit more simple. If I can identify the stair step faces it would be trivial to measure the depth of each face.

4. So... What is a stair step? It reminds me of when I tried to define what a tree is. A tree is a tall vertical thin object. A stair step is a flat, horizontal surface and often rectangular in shape. In other words, a stair step can be defined as:
   - A flat, horizontal surface
   - Often rectangular in shape
   - "Human-sized"

5. Now when we have a definition a good idea would be to divide the problem into smaller problems. Let us start by finding all flat horizontal faces. My approach to finding flat faces:
   ```
   For each loop object:
     Get z value for the first point (start of first line)
     Check all other points in the loop
     If any z value is different, discard the loop, otherwise keep it
   ```

6. I used AI to write a simple TypeScript script (`stairAnalyzer.ts`) that reads the stair JSON file and prints out the number of flat horizontal faces found per stair.

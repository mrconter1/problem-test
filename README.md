# Finding the Smallest Stair Step

I needed to identify the stair step with the smallest depth in architectural 3D models.

## My Process

1. First, I examined the attached 3D stair models to get familiar with how they look in three dimensions.

2. I initially thought about simply fitting lines along the stair profile, but realized that wouldn't work well for various stair designs such as spiral stairs.

3. Instead, I focused on what makes a stair step a stair step:
   - It's relatively small and sized for humans
   - It has a level, horizontal surface 
   - It's typically rectangular in shape

4. With these criteria, I could:
   - Find all planar surfaces in the model
   - Filter out non-step surfaces based on size, orientation, and shape
   - Measure the depth of each identified step
   - Return the step with the smallest depth

This approach handles different stair designs while focusing specifically on finding that smallest step, which could be a safety concern in architectural reviews. 

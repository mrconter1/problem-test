# Stair Model Visualization

This project provides an interactive 3D visualization tool for analyzing stair models in architectural designs, with a specific focus on validating stair step depth for safety compliance.

![image](https://github.com/user-attachments/assets/4f5f777f-522d-4302-922a-6662ac065abd)

## Purpose

The primary goal of this tool is to detect and measure stair step depths to validate if they meet the standard safety requirement of at least 25cm depth per step. The visualization provides intuitive interfaces for:

- Loading and visualizing 3D stair models
- Precise measurement of stair step dimensions
- Visual indicators for step depths
- Multiple rendering modes for different analysis approaches

## Features

- Interactive 3D visualization with FPS-style camera controls
- Multiple specialized rendering modes:
  - ALL_FACES: Complete model rendering
  - FLAT_RECTANGLES: Horizontal rectangles only
  - CLOSED_RECTANGLES: Complete closed shapes only
  - UPPERMOST_RECTANGLES: Only topmost horizontal rectangles
  - ASPECT_RATIO_RECTANGLES: Rectangles filtered by aspect ratio
  - LONG_SIDE_LINES: Highlights and measures stair step depths
- High-precision measurement display with outlined text for clarity
- Intuitive camera movement and rotation controls
- Ability to switch between different stair models
- Comprehensive UI with controls and information panels

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the visualization.

## Controls

- **Mouse**: Look around the 3D environment
- **W/A/S/D**: Move horizontally through the scene
- **Space**: Move upward
- **Shift**: Move downward
- **Left-click**: Toggle mouse control (locks pointer for camera rotation)
- **Right-click**: Hold for slow, precise movement
- **ESC**: Exit pointer lock mode

## Technical Details

This project is built with:

- [Next.js](https://nextjs.org) - React framework
- [Three.js](https://threejs.org) - 3D visualization library
- [TypeScript](https://www.typescriptlang.org) - For type-safe development

### Technical Approach

The visualization works by:

1. Parsing and loading 3D stair models
2. Analyzing geometry to identify horizontal surfaces and rectangular shapes
3. Filtering rectangles based on orientation, position, and aspect ratio
4. Measuring distances between parallel long sides to determine step depths
5. Visualizing measurements with dimension lines and clear text labels
6. Providing an interactive 3D environment for comprehensive analysis

The LONG_SIDE_LINES rendering mode (filter #6) is specialized for identifying and measuring correctly designed stair steps, displaying precise depth measurements for each step.

### Rendering Mode Pipeline

The visualization uses a progressive filtering approach, where each step builds upon the previous one:

#### 1. ALL_FACES
Reads and parses 3D data from the raw data files and renders a face for every loop in the model. This step serves as a baseline representation while also facilitating understanding of what the 3D data actually consists of. By visualizing the complete model, users can see the entire stair structure before any filtering is applied.

#### 2. FLAT_RECTANGLES
Only keeps horizontal surfaces by filtering loops that have the same z-value. This step identifies potential walking surfaces by isolating horizontal planes in the model. By focusing on flat surfaces, we begin to narrow down the areas that could represent actual stair steps.

#### 3. CLOSED_RECTANGLES
Filters out broken (non-closed) loops where the geometry is not properly designed (such as, in this case, the last step before the middle platform in each model). By focusing only on well-formed steps, we avoid the complexity of handling the countless ways a stair step could be incorrectly designed. This approach assumes that this tool is continuously used throughout the design process, allowing designers to correct issues as they arise.

#### 4. UPPERMOST_RECTANGLES
Each stair step is a cuboid and therefore has both a top and bottom face. This step filters out the bottom faces by examining each possible pair of remaining faces and checking if they are within a certain xy distance from each other. If they are, it keeps only the topmost face and discards the lower one.

#### 5. ASPECT_RATIO_RECTANGLES
Filters out stair step shaped faces by looking at the aspect ratio. For each rectangle, it calculates the average length of long sides and short sides, then determines the ratio between them. This approach further distinguishes actual stair steps from other horizontal surfaces like landings or platforms that have different proportions.

#### 6. LONG_SIDE_LINES
If we assume that each remaining face is the top rectangle of a stair step cuboid, the depth would simply be the width (shorter dimension) of the rectangle. This step measures and visualizes these depths directly, creating visual indicators with dimension lines and clear text labels.

## Deployment

The application can be deployed using [Vercel](https://vercel.com/new) for a seamless experience.

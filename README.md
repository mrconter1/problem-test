# Stair Model Visualization

This project provides an interactive 3D visualization tool for analyzing stair models in architectural designs, with a specific focus on validating stair step depth for safety compliance.

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

## Deployment

The application can be deployed using [Vercel](https://vercel.com/new) for a seamless experience.

## Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Stair Model Visualization

This project provides an interactive 3D visualization of stair models, allowing users to analyze stair steps in architectural designs.

## Features

- Interactive 3D visualization of stair models
- FPS-style camera controls for intuitive navigation
- Ability to switch between different stair models
- Identification of horizontal stair steps with color coding
- Coordinate system with labeled axes

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

- **Mouse**: Look around
- **W/A/S/D**: Move horizontally
- **Space**: Move up
- **Left Ctrl**: Move down
- **Click**: Lock pointer for camera control (ESC to exit)

## Technical Details

This project is built with:

- [Next.js](https://nextjs.org) - React framework
- [Three.js](https://threejs.org) - 3D visualization library
- [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript

The visualization identifies horizontal surfaces in 3D stair models by analyzing the z-coordinates of points in each face loop.

## Deployment

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

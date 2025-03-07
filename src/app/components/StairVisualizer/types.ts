/**
 * Shared types for the stair visualizer
 */

export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface Line {
  start: Point;
  end: Point;
}

export interface Loop extends Array<Line> {
  // This interface extends Array<Line> with no additional members
  // but we need it for type clarity in our application
}

export interface Face {
  loops: Loop[];
}

export interface Solid {
  faces: Face[];
}

export interface StairModel {
  id: string;
  name: string;
  boundingBox: {
    min: Point;
    max: Point;
  };
  solids: Solid[];
}

export interface CameraState {
  yaw: number;
  pitch: number;
}

export interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  slowMode: boolean;
  // Velocity components for smooth movement
  velocityX: number;
  velocityY: number;
  velocityZ: number;
} 
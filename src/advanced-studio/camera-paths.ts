import type React from "react";

export type AdvancedStudioCameraPathPreset =
  | "static"
  | "push-in"
  | "pull-back"
  | "push-left"
  | "push-right"
  | "drift-left"
  | "drift-right"
  | "rise-up"
  | "settle-down"
  | "tilt-down"
  | "tilt-up"
  | "diagonal-in"
  | "diagonal-out"
  | "orbit-left"
  | "orbit-right"
  | "overview-sweep"
  | "snap-focus";

export type CameraPathPoint = {
  x: number;
  y: number;
  scale: number;
};

export type AdvancedStudioCameraPath = {
  id: AdvancedStudioCameraPathPreset;
  label: string;
  description: string;
  points: [CameraPathPoint, CameraPathPoint];
};

export const advancedStudioCameraPaths: AdvancedStudioCameraPath[] = [
  {
    id: "static",
    label: "Static",
    description: "Hold the scene without camera movement.",
    points: [
      {x: 0, y: 0, scale: 1},
      {x: 0, y: 0, scale: 1},
    ],
  },
  {
    id: "push-in",
    label: "Push In",
    description: "Slowly move closer to the subject.",
    points: [
      {x: 0, y: 0, scale: 1},
      {x: 0, y: -18, scale: 1.08},
    ],
  },
  {
    id: "pull-back",
    label: "Pull Back",
    description: "Start tight and reveal more context.",
    points: [
      {x: 0, y: -10, scale: 1.1},
      {x: 0, y: 0, scale: 1},
    ],
  },
  {
    id: "push-left",
    label: "Push Left",
    description: "Push toward content on the left side.",
    points: [
      {x: 0, y: 0, scale: 1},
      {x: 24, y: -8, scale: 1.075},
    ],
  },
  {
    id: "push-right",
    label: "Push Right",
    description: "Push toward content on the right side.",
    points: [
      {x: 0, y: 0, scale: 1},
      {x: -24, y: -8, scale: 1.075},
    ],
  },
  {
    id: "drift-left",
    label: "Drift Left",
    description: "Create a gentle lateral camera move.",
    points: [
      {x: 20, y: 0, scale: 1.035},
      {x: -20, y: 0, scale: 1.035},
    ],
  },
  {
    id: "drift-right",
    label: "Drift Right",
    description: "Move laterally in the opposite direction.",
    points: [
      {x: -20, y: 0, scale: 1.035},
      {x: 20, y: 0, scale: 1.035},
    ],
  },
  {
    id: "rise-up",
    label: "Rise Up",
    description: "Lift the frame while pushing in slightly.",
    points: [
      {x: 0, y: 22, scale: 1.02},
      {x: 0, y: -24, scale: 1.075},
    ],
  },
  {
    id: "settle-down",
    label: "Settle Down",
    description: "Float down into a calm final frame.",
    points: [
      {x: 0, y: -28, scale: 1.055},
      {x: 0, y: 6, scale: 1.015},
    ],
  },
  {
    id: "tilt-down",
    label: "Tilt Down",
    description: "Move attention from top content to lower content.",
    points: [
      {x: 0, y: -34, scale: 1.045},
      {x: 0, y: 24, scale: 1.045},
    ],
  },
  {
    id: "tilt-up",
    label: "Tilt Up",
    description: "Move attention from lower content to the headline.",
    points: [
      {x: 0, y: 28, scale: 1.045},
      {x: 0, y: -30, scale: 1.045},
    ],
  },
  {
    id: "diagonal-in",
    label: "Diagonal In",
    description: "Push in diagonally for a dynamic reveal.",
    points: [
      {x: 26, y: 20, scale: 1},
      {x: -16, y: -18, scale: 1.085},
    ],
  },
  {
    id: "diagonal-out",
    label: "Diagonal Out",
    description: "Pull diagonally outward to restore context.",
    points: [
      {x: -18, y: -18, scale: 1.085},
      {x: 24, y: 18, scale: 1.015},
    ],
  },
  {
    id: "orbit-left",
    label: "Orbit Left",
    description: "Arc gently across the scene from right to left.",
    points: [
      {x: 26, y: -12, scale: 1.055},
      {x: -26, y: 12, scale: 1.055},
    ],
  },
  {
    id: "orbit-right",
    label: "Orbit Right",
    description: "Arc gently across the scene from left to right.",
    points: [
      {x: -26, y: -12, scale: 1.055},
      {x: 26, y: 12, scale: 1.055},
    ],
  },
  {
    id: "overview-sweep",
    label: "Overview Sweep",
    description: "Sweep across the scene while keeping context.",
    points: [
      {x: 24, y: 12, scale: 1.02},
      {x: -24, y: -12, scale: 1.055},
    ],
  },
  {
    id: "snap-focus",
    label: "Snap Focus",
    description: "A tighter editorial punch into the scene.",
    points: [
      {x: 0, y: 0, scale: 1},
      {x: 0, y: -10, scale: 1.14},
    ],
  },
];

export const getAdvancedStudioCameraPath = (
  preset: AdvancedStudioCameraPathPreset | undefined,
) =>
  advancedStudioCameraPaths.find((path) => path.id === preset) ??
  advancedStudioCameraPaths[0];

export const cameraPathStyle = (
  preset: AdvancedStudioCameraPathPreset | undefined,
  progress: number,
  includeScale = true,
): React.CSSProperties => {
  const path = getAdvancedStudioCameraPath(preset);
  if (path.id === "static") return {};

  const eased = 1 - Math.pow(1 - Math.max(0, Math.min(1, progress)), 3);
  const [from, to] = path.points;
  const x = from.x + (to.x - from.x) * eased;
  const y = from.y + (to.y - from.y) * eased;
  const scale = from.scale + (to.scale - from.scale) * eased;

  return {
    transform: includeScale
      ? `translate(${x}px, ${y}px) scale(${scale})`
      : `translate(${x}px, ${y}px)`,
    transformOrigin: "center center",
  };
};

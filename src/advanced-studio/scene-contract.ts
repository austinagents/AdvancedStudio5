import type {StudioFormat} from "../antv-studio/studio-formats";
import type {
  AntVEngine,
  StudioContent,
  StudioControls,
} from "../antv-studio/types";
import type {BoardSceneContent} from "./BoardSceneRenderer";
import type {AdvancedStudioCameraPathPreset} from "./camera-paths";

export type SceneBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SceneRendererProps<TContent = unknown> = {
  sceneId: string;
  format: StudioFormat;
  fps: number;
  absoluteFrame: number;
  localFrame: number;
  durationFrames: number;
  progress: number;
  bounds: SceneBounds;
  content: TContent;
  onReady?: () => void;
  onError?: (message: string) => void;
};

export type AdvancedStudioSceneType = "board" | "g2" | "g6" | "s2";

export type AdvancedStudioInfographicContent = {
  designId: string;
  content?: StudioContent;
  controls?: StudioControls;
  stableTextMotion?: boolean;
};

export type AdvancedStudioScene = {
  id: string;
  type: AdvancedStudioSceneType;
  title: string;
  durationFrames: number;
  content: BoardSceneContent | AdvancedStudioInfographicContent;
  transitionIn?: {
    preset: "crossfade";
    durationFrames: number;
  };
  transitionOut?: {
    preset: "crossfade";
    durationFrames: number;
  };
  cameraPath?: {
    preset: AdvancedStudioCameraPathPreset;
  };
  cameraPreset?: "push-in";
};

export type AdvancedStudioTimedScene = AdvancedStudioScene & {
  startFrame: number;
  endFrame: number;
};

export type AdvancedStudioProject = {
  title: string;
  scenes: AdvancedStudioScene[];
};

export const getAdvancedStudioProjectDuration = (
  project: AdvancedStudioProject,
) => {
  const duration = project.scenes.reduce((sum, scene) => {
    if (!Number.isSafeInteger(scene.durationFrames) || scene.durationFrames <= 0) {
      throw new Error(
        `Advanced Studio scene ${scene.id} durationFrames must be a positive integer.`,
      );
    }
    return sum + scene.durationFrames;
  }, 0);

  if (!Number.isSafeInteger(duration) || duration <= 0) {
    throw new Error(
      "Advanced Studio project duration must be a positive integer.",
    );
  }

  return duration;
};

export const getAdvancedStudioTimedScenes = (
  project: AdvancedStudioProject,
) => {
  getAdvancedStudioProjectDuration(project);
  return project.scenes.reduce<AdvancedStudioTimedScene[]>((items, scene) => {
    const startFrame = items.at(-1)?.endFrame ?? 0;
    items.push({
      ...scene,
      startFrame,
      endFrame: startFrame + scene.durationFrames,
    });
    return items;
  }, []);
};

export const isInfographicSceneType = (
  type: AdvancedStudioSceneType,
): type is AntVEngine => type === "g2" || type === "g6" || type === "s2";

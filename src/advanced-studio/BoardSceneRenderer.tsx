import React from "react";
import {AntVBlock} from "../../shared/AntVBlock";
import {antVBlockInternalScale} from "../../shared/antv/resolve";
import {getBoardSemanticMotion} from "../../shared/board-motion";
import {Board} from "../../shared/Board";
import {defaultProject} from "../../shared/project";
import type {
  AnimationPreset,
  StudioBlock,
  StudioProject,
} from "../../shared/project";
import type {SceneRendererProps} from "./scene-contract";

export type BoardSceneContent = {
  project?: StudioProject;
  activeBlockId: string | null;
  animation: AnimationPreset;
  stableTextMotion?: boolean;
  infographic?: StudioBlock;
};

export const BoardSceneRenderer: React.FC<
  SceneRendererProps<BoardSceneContent>
> = ({
  localFrame,
  durationFrames,
  fps,
  bounds,
  content,
  onReady,
}) => {
  React.useEffect(() => {
    onReady?.();
  }, [onReady]);

  const infographic = React.useMemo(
    () => {
      if (!content.infographic) {
        return null;
      }

      const providerDesignWidth = 800;
      const providerDesignHeight =
        providerDesignWidth * (bounds.height / bounds.width);

      return {
        ...content.infographic,
        width: providerDesignWidth / antVBlockInternalScale,
        height: providerDesignHeight / antVBlockInternalScale,
      };
    },
    [bounds.height, bounds.width, content.infographic],
  );

  if (infographic) {
    return (
      <div
        data-antv-infographic-scene={infographic.id}
        style={{
          position: "absolute",
          left: bounds.x,
          top: bounds.y,
          width: bounds.width,
          height: bounds.height,
          overflow: "hidden",
        }}
      >
        <AntVBlock block={infographic} />
      </div>
    );
  }

  const project = content.project ?? defaultProject;
  const boardWidth = 1000;
  const boardHeight = 640;
  const fit = Math.min(bounds.width / boardWidth, bounds.height / boardHeight);
  const motion = getBoardSemanticMotion({
    project,
    activeBlockId: content.activeBlockId,
    animation: content.animation,
    frame: localFrame,
    sceneStartFrame: 0,
    sceneEndFrame: durationFrames,
    fps,
    outputScale: fit,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={
          content.stableTextMotion
            ? {
                position: "relative",
                left: motion.translateX * fit,
                top: motion.translateY * fit,
                opacity: motion.opacity,
                transform: `scale(${fit})`,
                transformOrigin: "center center",
              }
            : motion.style
        }
      >
        <Board
          project={project}
          activeBlockId={motion.activeBlockId}
          dimInactive={motion.dimInactive}
        />
      </div>
    </div>
  );
};

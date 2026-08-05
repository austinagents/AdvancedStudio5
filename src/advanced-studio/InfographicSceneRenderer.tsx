import React from "react";
import {continueRender, delayRender, interpolate} from "remotion";
import {G2StudioRenderer} from "../antv-studio/renderers/G2StudioRenderer";
import {G6StudioRenderer} from "../antv-studio/renderers/G6StudioRenderer";
import {S2StudioRenderer} from "../antv-studio/renderers/S2StudioRenderer";
import {cloneContent} from "../antv-studio/sample-content";
import {getStudioLayout} from "../antv-studio/studio-formats";
import {defaultControls, studioTheme} from "../antv-studio/theme";
import type {
  AntVStudioDesign,
  StudioContent,
  StudioControls,
} from "../antv-studio/types";
import type {SceneRendererProps} from "./scene-contract";

export type InfographicSceneContent = {
  design: AntVStudioDesign;
  content?: StudioContent;
  controls?: StudioControls;
};

type InfographicSceneRendererProps =
  SceneRendererProps<InfographicSceneContent> & {
    visualStyle?: React.CSSProperties;
  };

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const designAnimationStyle = (
  design: AntVStudioDesign,
  progress: number,
): React.CSSProperties => {
  const eased = Math.max(0, Math.min(1, progress));
  const opacity = interpolate(eased, [0, 0.2, 1], [0, 1, 1], clamp);
  const scale = interpolate(eased, [0, 1], [0.96, 1], clamp);

  if (design.animation === "grow-right") {
    return {
      opacity,
      clipPath: `inset(0 ${100 - eased * 100}% 0 0)`,
      transform: `translateX(${(1 - eased) * -24}px)`,
    };
  }

  if (design.animation === "grow-up") {
    return {
      opacity,
      clipPath: `inset(${100 - eased * 100}% 0 0 0)`,
      transform: `translateY(${(1 - eased) * 24}px)`,
    };
  }

  if (design.animation === "row-reveal") {
    return {
      opacity,
      clipPath: `inset(${100 - eased * 100}% 0 0 0)`,
      transform: `translateY(${(1 - eased) * 18}px)`,
    };
  }

  if (design.animation === "radial-reveal") {
    return {
      opacity,
      clipPath: `circle(${eased * 76}% at 50% 50%)`,
      transform: `scale(${scale})`,
    };
  }

  if (design.animation === "top-down-tree") {
    return {
      opacity,
      clipPath: `inset(0 0 ${100 - eased * 100}% 0)`,
      transform: `translateY(${(1 - eased) * -16}px)`,
    };
  }

  if (design.animation === "path-style-reveal") {
    return {
      opacity,
      clipPath: `inset(0 ${100 - eased * 100}% 0 0)`,
      transform: `scale(${scale})`,
    };
  }

  return {opacity, transform: `scale(${scale})`};
};

export const InfographicSceneRenderer: React.FC<
  InfographicSceneRendererProps
> = ({
  sceneId,
  format,
  progress,
  bounds,
  content,
  onReady,
  onError,
  visualStyle,
}) => {
  const renderHandleRef = React.useRef<number | null>(null);
  const completedRef = React.useRef(false);
  const onReadyRef = React.useRef(onReady);
  const onErrorRef = React.useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;
  const design = content.design;
  const editableContent = React.useMemo(
    () => cloneContent(content.content ?? design.defaultContent),
    [content.content, design.defaultContent],
  );
  const controls = content.controls ?? defaultControls;
  const layout = React.useMemo(
    () => getStudioLayout(format, bounds.width, bounds.height),
    [bounds.height, bounds.width, format],
  );

  React.useEffect(() => {
    renderHandleRef.current = delayRender(`Infographic scene: ${sceneId}`);
    completedRef.current = false;

    return () => {
      if (!completedRef.current && renderHandleRef.current !== null) {
        continueRender(renderHandleRef.current);
      }
      renderHandleRef.current = null;
    };
  }, [sceneId]);

  const finish = React.useCallback(() => {
    if (!completedRef.current && renderHandleRef.current !== null) {
      completedRef.current = true;
      continueRender(renderHandleRef.current);
    }
    onReadyRef.current?.();
  }, []);

  const fail = React.useCallback(
    (message: string) => {
      if (!completedRef.current && renderHandleRef.current !== null) {
        completedRef.current = true;
        continueRender(renderHandleRef.current);
      }
      onErrorRef.current?.(message);
    },
    [],
  );

  return (
    <div
      style={{
        position: "absolute",
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        overflow: "hidden",
        background: studioTheme.canvas,
        color: studioTheme.text,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: layout.paddingX,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: layout.titleFontSize,
            lineHeight: 1.04,
            fontWeight: 900,
            color: studioTheme.text,
          }}
        >
          {editableContent.title}
        </div>
        {editableContent.subtitle ? (
          <div
            style={{
              marginTop: Math.round(bounds.height * 0.012),
              fontSize: layout.subtitleFontSize,
              lineHeight: 1.3,
              color: studioTheme.muted,
            }}
          >
            {editableContent.subtitle}
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          ...visualStyle,
        }}
      >
        <div
          data-advanced-scene={sceneId}
          data-selected-design={design.id}
          data-engine={design.engine}
          style={{
            position: "absolute",
            left: layout.contentLeft,
            top: layout.contentTop,
            width: layout.contentWidth,
            height: layout.contentHeight,
            overflow: "hidden",
            ...designAnimationStyle(design, progress),
          }}
        >
          {design.engine === "g2" ? (
            <G2StudioRenderer
              design={design}
              content={editableContent}
              controls={controls}
              width={layout.contentWidth}
              height={layout.contentHeight}
              frameWidth={format.width}
              frameHeight={format.height}
              onReady={finish}
              onError={fail}
            />
          ) : design.engine === "g6" ? (
            <G6StudioRenderer
              design={design}
              content={editableContent}
              controls={controls}
              width={layout.contentWidth}
              height={layout.contentHeight}
              frameWidth={format.width}
              frameHeight={format.height}
              onReady={finish}
              onError={fail}
            />
          ) : (
            <S2StudioRenderer
              design={design}
              content={editableContent}
              controls={controls}
              width={layout.contentWidth}
              height={layout.contentHeight}
              frameWidth={format.width}
              frameHeight={format.height}
              onReady={finish}
              onError={fail}
            />
          )}
        </div>
      </div>

    </div>
  );
};

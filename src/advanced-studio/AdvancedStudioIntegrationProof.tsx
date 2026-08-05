import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {antVStudioDesigns} from "../antv-studio/registry";
import {
  formatCompatibilityError,
  validateStudioDesignCompatibility,
} from "../antv-studio/compatibility";
import {cloneContent, content, edge, node, row} from "../antv-studio/sample-content";
import {STUDIO_FORMATS, type StudioFormatId} from "../antv-studio/studio-formats";
import {defaultControls} from "../antv-studio/theme";
import {studioTheme} from "../antv-studio/theme";
import type {AntVEngine, AntVStudioDesign} from "../antv-studio/types";
import type {StudioProject} from "../../shared/project";
import {
  BoardSceneRenderer,
  type BoardSceneContent,
} from "./BoardSceneRenderer";
import {
  InfographicSceneRenderer,
  type InfographicSceneContent,
} from "./InfographicSceneRenderer";
import {cameraPathStyle} from "./camera-paths";
import type {
  AdvancedStudioInfographicContent,
  AdvancedStudioProject,
  AdvancedStudioScene,
  SceneBounds,
} from "./scene-contract";
import {
  getAdvancedStudioProjectDuration,
  getAdvancedStudioTimedScenes,
} from "./scene-contract";
import type {AdvancedStudioTimedScene} from "./scene-contract";

export {
  getAdvancedStudioProjectDuration,
  getAdvancedStudioTimedScenes,
} from "./scene-contract";

const fps = 30;
const transitionFrames = 18;

const findDesign = (designId: string, engine?: AntVEngine) =>
  antVStudioDesigns.find(
    (design) => design.id === designId && (!engine || design.engine === engine),
  );

const requireDesign = (designId: string, engine?: AntVEngine) => {
  const design = findDesign(designId, engine);
  if (!design) {
    throw new Error(`Advanced Studio requires registered design ${designId}.`);
  }
  return design;
};

const donutBreakdownDesign = requireDesign("g2-donut-breakdown", "g2");
const conversionFunnelDesign = requireDesign("g2-conversion-funnel", "g2");
const smoothTrendDesign = requireDesign("g2-smooth-trend", "g2");
const kpiSnapshotDesign = requireDesign("g2-kpi-sparkline", "g2");
const organizationTreeDesign = requireDesign("g6-organization-tree", "g6");
const diagnosticFlowDesign = requireDesign("g6-diagnostic-flow", "g6");
const decisionTreeDesign = requireDesign("g6-decision-tree", "g6");
const scorecardDesign = requireDesign("s2-monthly-scorecard", "s2");

export const createAdvancedStudioInfographicContent = (
  design: AntVStudioDesign,
): AdvancedStudioInfographicContent => ({
  designId: design.id,
  content: cloneContent(design.defaultContent),
  controls: defaultControls,
});

const createReferenceInfographicContent = (
  design: AntVStudioDesign,
  overrideContent: AdvancedStudioInfographicContent["content"],
): AdvancedStudioInfographicContent => ({
  designId: design.id,
  content: overrideContent,
  controls: defaultControls,
  stableTextMotion: true,
});

const styleReferenceBoardProject: StudioProject = {
  title: "DOCUMENT FLOW",
  subtitle: "A concise visual argument, built one proof point at a time",
  blocks: [
    {
      id: "hook",
      type: "metric",
      title: "OPEN WITH ONE CLAIM",
      x: 42,
      y: 104,
      width: 238,
      height: 176,
      designPreset: "hero",
    },
    {
      id: "structure",
      type: "process",
      title: "STRUCTURE THE IDEA",
      x: 300,
      y: 104,
      width: 380,
      height: 176,
      designPreset: "technical",
    },
    {
      id: "proof",
      type: "bars",
      title: "SHOW THE PROOF",
      x: 700,
      y: 104,
      width: 258,
      height: 176,
      designPreset: "data",
    },
    {
      id: "path",
      type: "timeline",
      title: "MOVE THROUGH THE PATH",
      x: 42,
      y: 304,
      width: 916,
      height: 150,
      designPreset: "process",
    },
    {
      id: "friction",
      type: "funnel",
      title: "REMOVE FRICTION",
      x: 42,
      y: 478,
      width: 292,
      height: 130,
      designPreset: "supporting",
    },
    {
      id: "decision",
      type: "comparison",
      title: "MAKE THE DECISION SIMPLE",
      x: 354,
      y: 478,
      width: 292,
      height: 130,
      designPreset: "balanced",
    },
    {
      id: "close",
      type: "metrics",
      title: "END WITH ACTION",
      x: 666,
      y: 478,
      width: 292,
      height: 130,
      designPreset: "summary",
    },
  ],
  scenes: [],
};

const crossfade = (durationFrames = transitionFrames) => ({
  preset: "crossfade" as const,
  durationFrames,
});

const scenes: AdvancedStudioScene[] = [
  {
    id: "style-01-cold-open",
    type: "board",
    title: "Cold Open Claim",
    durationFrames: 90,
    content: {
      project: styleReferenceBoardProject,
      activeBlockId: "hook",
      animation: "spotlight",
      stableTextMotion: true,
    },
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "snap-focus",
    },
  },
  {
    id: "style-02-editor-setup",
    type: "board",
    title: "Explain the Structure",
    durationFrames: 90,
    content: {
      project: styleReferenceBoardProject,
      activeBlockId: "structure",
      animation: "focus",
      stableTextMotion: true,
    },
    transitionIn: crossfade(12),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "push-left",
    },
  },
  {
    id: "style-03-cause-map",
    type: "g6",
    title: "Why the Message Fails",
    durationFrames: 90,
    content: createReferenceInfographicContent(
      organizationTreeDesign,
      content(
        "Why the Message Fails",
        "Most viewers lose the thread before the proof arrives",
        [],
        [
          node("root", "Drop-Off"),
          node("dense", "Dense copy"),
          node("late", "Late proof"),
          node("flat", "Flat pacing"),
          node("unclear", "No next step"),
          node("weak", "Weak contrast"),
        ],
        [
          edge("root", "dense"),
          edge("root", "late"),
          edge("root", "flat"),
          edge("root", "unclear"),
          edge("root", "weak"),
        ],
      ),
    ),
    transitionIn: crossfade(12),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "orbit-left",
    },
  },
  {
    id: "style-04-source-breakdown",
    type: "g2",
    title: "Attention Split",
    durationFrames: 75,
    content: createReferenceInfographicContent(
      donutBreakdownDesign,
      content("Attention Split", "Where the first ten seconds go", [
        row("claim", "Claim", 36),
        row("context", "Context", 24),
        row("proof", "Proof", 28),
        row("action", "Action", 12),
      ]),
    ),
    transitionIn: crossfade(10),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "push-in",
    },
  },
  {
    id: "style-05-proof-spotlight",
    type: "board",
    title: "Proof Spotlight",
    durationFrames: 75,
    content: {
      project: styleReferenceBoardProject,
      activeBlockId: "proof",
      animation: "spotlight",
      stableTextMotion: true,
    },
    transitionIn: crossfade(12),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "push-right",
    },
  },
  {
    id: "style-06-scorecard-cutaway",
    type: "s2",
    title: "Evidence Scorecard",
    durationFrames: 105,
    content: createReferenceInfographicContent(
      scorecardDesign,
      content("Evidence Scorecard", "Fast proof beats replace long explanation", [
        row("clarity", "Clarity", 82, "Message", 56, 88),
        row("proof", "Proof", 74, "Evidence", 42, 80),
        row("motion", "Motion", 68, "Editing", 39, 72),
        row("action", "Action", 61, "Close", 34, 68),
      ]),
    ),
    transitionIn: crossfade(12),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "tilt-down",
    },
  },
  {
    id: "style-07-path-reveal",
    type: "board",
    title: "Move Through the Path",
    durationFrames: 90,
    content: {
      project: styleReferenceBoardProject,
      activeBlockId: "path",
      animation: "reveal",
      stableTextMotion: true,
    },
    transitionIn: crossfade(12),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "drift-left",
    },
  },
  {
    id: "style-08-funnel",
    type: "g2",
    title: "Compression Funnel",
    durationFrames: 90,
    content: createReferenceInfographicContent(
      conversionFunnelDesign,
      content("Compression Funnel", "Turning a long document into a visual sequence", [
        row("doc", "Document", 100),
        row("claim", "Claim", 62),
        row("proof", "Proof", 38),
        row("action", "Action", 24),
      ]),
    ),
    transitionIn: crossfade(12),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "diagonal-in",
    },
  },
  {
    id: "style-09-resource-flow",
    type: "g6",
    title: "Visual Flow",
    durationFrames: 90,
    content: createReferenceInfographicContent(
      diagnosticFlowDesign,
      content(
        "Visual Flow",
        "Each cut turns one idea into the next visual cue",
        [],
        [
          node("claim", "Claim"),
          node("frame", "Frame"),
          node("data", "Data"),
          node("contrast", "Contrast"),
          node("decision", "Decision"),
          node("close", "Close"),
        ],
        [
          edge("claim", "frame"),
          edge("frame", "data"),
          edge("data", "contrast"),
          edge("contrast", "decision"),
          edge("decision", "close"),
        ],
      ),
    ),
    transitionIn: crossfade(12),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "overview-sweep",
    },
  },
  {
    id: "style-10-trend-rise",
    type: "g2",
    title: "Momentum Build",
    durationFrames: 105,
    content: createReferenceInfographicContent(
      smoothTrendDesign,
      content("Momentum Build", "The edit accelerates as the proof becomes clearer", [
        row("one", "1", 12),
        row("two", "2", 18),
        row("three", "3", 27),
        row("four", "4", 35),
        row("five", "5", 48),
        row("six", "6", 62),
      ]),
    ),
    transitionIn: crossfade(12),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "rise-up",
    },
  },
  {
    id: "style-11-decision-focus",
    type: "board",
    title: "Decision Focus",
    durationFrames: 75,
    content: {
      project: styleReferenceBoardProject,
      activeBlockId: "decision",
      animation: "compare",
      stableTextMotion: true,
    },
    transitionIn: crossfade(12),
    transitionOut: crossfade(10),
    cameraPath: {
      preset: "push-in",
    },
  },
  {
    id: "style-12-kpi-punch",
    type: "g2",
    title: "Performance Punch",
    durationFrames: 90,
    content: createReferenceInfographicContent(
      kpiSnapshotDesign,
      content("Performance Punch", "Short sections keep the viewer oriented", [
        row("hook", "Hook", 22),
        row("setup", "Setup", 31),
        row("proof", "Proof", 45),
        row("close", "Close", 58),
        row("act", "Action", 70),
      ]),
    ),
    transitionIn: crossfade(10),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "snap-focus",
    },
  },
  {
    id: "style-13-decision-tree",
    type: "g6",
    title: "Choose the Next Step",
    durationFrames: 90,
    content: createReferenceInfographicContent(
      decisionTreeDesign,
      content(
        "Choose the Next Step",
        "The final beat resolves the edit into a simple action",
        [],
        [
          node("root", "Ready?"),
          node("skim", "Skim"),
          node("proof", "Need proof"),
          node("book", "Book edit"),
          node("send", "Send brief"),
          node("revise", "Revise claim"),
        ],
        [
          edge("root", "skim", "No"),
          edge("root", "proof", "Maybe"),
          edge("skim", "revise"),
          edge("proof", "send"),
          edge("proof", "book"),
        ],
      ),
    ),
    transitionIn: crossfade(12),
    transitionOut: crossfade(12),
    cameraPath: {
      preset: "tilt-up",
    },
  },
  {
    id: "style-14-final-overview",
    type: "board",
    title: "Final Overview",
    durationFrames: 105,
    content: {
      project: styleReferenceBoardProject,
      activeBlockId: null,
      animation: "overview",
      stableTextMotion: true,
    },
    transitionIn: crossfade(12),
    cameraPath: {
      preset: "pull-back",
    },
  },
];

export const advancedStudioDefaultProject: AdvancedStudioProject = {
  title: "Advanced Studio Proof",
  scenes,
};

export const advancedStudioIntegrationProofDuration =
  getAdvancedStudioProjectDuration(advancedStudioDefaultProject);

export const advancedStudioIntegrationTimedScenes =
  getAdvancedStudioTimedScenes(advancedStudioDefaultProject);

export const advancedStudioIntegrationScenes = scenes;

export const getAdvancedStudioSceneAtFrame = (
  frame: number,
  project: AdvancedStudioProject = advancedStudioDefaultProject,
) => {
  const timedScenes = getAdvancedStudioTimedScenes(project);
  return timedScenes.find(
    (scene) => frame >= scene.startFrame && frame < scene.endFrame,
  ) ?? timedScenes.at(-1);
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const CompatibilityErrorScene: React.FC<{
  message: string;
  onReady: () => void;
  onError: (message: string) => void;
}> = ({message, onReady, onError}) => {
  React.useEffect(() => {
    onError(message);
    onReady();
  }, [message, onError, onReady]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        padding: 48,
        background: studioTheme.canvas,
        color: "#ffb4b4",
        fontSize: 22,
        lineHeight: 1.25,
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
};

const sceneOpacity = (scene: AdvancedStudioTimedScene, frame: number) => {
  let opacity = 1;

  if (scene.transitionIn && frame < scene.startFrame) {
    opacity *= interpolate(
      frame,
      [
        scene.startFrame - scene.transitionIn.durationFrames,
        scene.startFrame,
      ],
      [0, 1],
      clamp,
    );
  }

  if (scene.transitionOut && frame >= scene.endFrame - scene.transitionOut.durationFrames) {
    opacity *= interpolate(
      frame,
      [
        scene.endFrame - scene.transitionOut.durationFrames,
        scene.endFrame,
      ],
      [1, 0],
      clamp,
    );
  }

  return opacity;
};

const shouldRenderScene = (scene: AdvancedStudioTimedScene, frame: number) => {
  const visibleStart =
    scene.startFrame - (scene.transitionIn?.durationFrames ?? 0);
  return frame >= visibleStart && frame < scene.endFrame;
};

const renderScene = ({
  scene,
  formatId,
  frame,
  fpsValue,
  bounds,
  onReady,
  onError,
}: {
  scene: AdvancedStudioTimedScene;
  formatId: StudioFormatId;
  frame: number;
  fpsValue: number;
  bounds: SceneBounds;
  onReady: (id: string) => void;
  onError: (id: string, message: string) => void;
}) => {
  const format = STUDIO_FORMATS[formatId];
  const localFrame = Math.max(
    0,
    Math.min(scene.durationFrames, frame - scene.startFrame),
  );
  const progress = scene.durationFrames <= 0 ? 1 : localFrame / scene.durationFrames;
  const rendererProps = {
    sceneId: scene.id,
    format,
    fps: fpsValue,
    absoluteFrame: frame,
    localFrame,
    durationFrames: scene.durationFrames,
    progress,
    bounds,
    content: scene.content,
    onReady: () => onReady(scene.id),
    onError: (message: string) => onError(scene.id, message),
  };

  const sceneContent = scene.content as
    | AdvancedStudioInfographicContent
    | BoardSceneContent;
  const pathStyle = cameraPathStyle(
    scene.cameraPath?.preset ?? scene.cameraPreset ?? "static",
    progress,
    !sceneContent.stableTextMotion,
  );

  if (scene.type === "g2" || scene.type === "g6" || scene.type === "s2") {
    const content = scene.content as AdvancedStudioInfographicContent;
    const design = requireDesign(content.designId, scene.type);
    const compatibility = validateStudioDesignCompatibility({
      design,
      content: content.content ?? design.defaultContent,
      expectedEngine: scene.type,
    });
    if (!compatibility.ok) {
      const message = formatCompatibilityError(compatibility);
      return (
        <CompatibilityErrorScene
          message={message}
          onReady={() => onReady(scene.id)}
          onError={(errorMessage) => onError(scene.id, errorMessage)}
        />
      );
    }
    const infographicContent: InfographicSceneContent = {
      design,
      content: content.content,
      controls: content.controls,
    };
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        <InfographicSceneRenderer
          {...rendererProps}
          content={infographicContent}
          visualStyle={pathStyle}
        />
      </div>
    );
  }

  const boardPathStyle = cameraPathStyle(
    scene.cameraPath?.preset ?? scene.cameraPreset ?? "static",
    progress,
    !sceneContent.stableTextMotion,
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        ...boardPathStyle,
      }}
    >
      <BoardSceneRenderer
        {...rendererProps}
        content={scene.content as BoardSceneContent}
      />
    </div>
  );
};

export const AdvancedStudioIntegrationProof: React.FC<{
  formatId?: StudioFormatId;
  project?: AdvancedStudioProject;
}> = ({formatId = "portrait", project = advancedStudioDefaultProject}) => {
  const frame = useCurrentFrame();
  const {fps: fpsValue} = useVideoConfig();
  const format = STUDIO_FORMATS[formatId];
  const [readyScenes, setReadyScenes] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const bounds = React.useMemo<SceneBounds>(
    () => ({
      x: 0,
      y: 0,
      width: format.width,
      height: format.height,
    }),
    [format.height, format.width],
  );

  const markReady = React.useCallback((id: string) => {
    setReadyScenes((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const markError = React.useCallback((id: string, message: string) => {
    setErrors((current) => ({...current, [id]: message}));
  }, []);

  const timedScenes = React.useMemo(
    () => getAdvancedStudioTimedScenes(project),
    [project],
  );
  const renderedScenes = timedScenes.filter((scene) =>
    shouldRenderScene(scene, frame),
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #202735 0%, #0a0d12 72%)",
        color: "#ffffff",
        overflow: "hidden",
      }}
    >
      {renderedScenes.map((scene) => {
        const opacity = sceneOpacity(scene, frame);
        return (
          <div
            key={scene.id}
            data-advanced-scene-layer={scene.id}
            data-scene-ready={readyScenes.has(scene.id)}
            style={{
              position: "absolute",
              inset: 0,
              opacity,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {renderScene({
              scene,
              formatId,
              frame,
              fpsValue,
              bounds,
              onReady: markReady,
              onError: markError,
            })}
          </div>
        );
      })}

      {Object.entries(errors).map(([sceneId, message]) => (
        <div
          key={sceneId}
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            bottom: 40,
            padding: 18,
            borderRadius: 8,
            background: "rgba(0,0,0,0.72)",
            border: `1px solid ${studioTheme.danger}`,
            color: studioTheme.danger,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 22,
          }}
        >
          {sceneId}: {message}
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const advancedStudioIntegrationFormats = STUDIO_FORMATS;
export const advancedStudioIntegrationFps = fps;

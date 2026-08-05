import React from "react";
import {Player, type PlayerRef} from "@remotion/player";
import {
  BarChart3,
  ChevronDown,
  Crosshair,
  Download,
  Eye,
  Film,
  Fullscreen,
  GitCompareArrows,
  Pause,
  Play,
  Ratio,
  Settings,
  Share2,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  Trash2,
  Wand2,
  WandSparkles,
  ZoomIn,
} from "lucide-react";
import {
  AdvancedStudioIntegrationProof,
  advancedStudioDefaultProject,
  advancedStudioIntegrationFormats,
  advancedStudioIntegrationFps,
  createAdvancedStudioInfographicContent,
  getAdvancedStudioProjectDuration,
  getAdvancedStudioSceneAtFrame,
  getAdvancedStudioTimedScenes,
} from "../../src/advanced-studio/AdvancedStudioIntegrationProof";
import {animationPresets} from "../../shared/animation-presets";
import type {BoardSceneContent} from "../../src/advanced-studio/BoardSceneRenderer";
import type {
  AdvancedStudioInfographicContent,
  AdvancedStudioProject,
  AdvancedStudioScene,
  AdvancedStudioSceneType,
  AdvancedStudioTimedScene,
} from "../../src/advanced-studio/scene-contract";
import {
  advancedStudioCameraPaths,
  getAdvancedStudioCameraPath,
} from "../../src/advanced-studio/camera-paths";
import {
  formatCompatibilityError,
  validateStudioDesignCompatibility,
} from "../../src/antv-studio/compatibility";
import {antVStudioDesigns} from "../../src/antv-studio/registry";
import {cloneContent} from "../../src/antv-studio/sample-content";
import {defaultControls} from "../../src/antv-studio/theme";
import type {StudioFormatId} from "../../src/antv-studio/studio-formats";
import type {
  AntVEngine,
  AntVStudioDesign,
  StudioContent,
} from "../../src/antv-studio/types";
import {defaultProject} from "../../shared/project";
import type {StudioProject} from "../../shared/project";
import {advancedStudioTemplate2Project} from "../../src/advanced-studio/template-2-project";

const formatOrder: StudioFormatId[] = ["portrait", "square", "vertical"];
const inspectorTabs = ["Scene", "Camera", "Transition"] as const;
const engineOrder: AntVEngine[] = ["g2", "g6"];
const appDesigns = antVStudioDesigns.filter((design) =>
  engineOrder.includes(design.engine),
);
const appCategories = Array.from(
  new Set(appDesigns.map((design) => design.category)),
).sort();

const copyProject = (project: AdvancedStudioProject): AdvancedStudioProject =>
  JSON.parse(JSON.stringify(project)) as AdvancedStudioProject;

const boardProjectCopy = (): StudioProject =>
  JSON.parse(JSON.stringify(defaultProject)) as StudioProject;

const titleForScene = (scene: AdvancedStudioScene) => scene.title;

const subtitleForScene = (scene: AdvancedStudioScene) =>
  scene.type === "board" ? "Board Scene" : `${scene.type.toUpperCase()} Infographic`;

const sceneTone = (scene: AdvancedStudioScene): "board" | "chart" | "cta" =>
  scene.type === "board"
    ? (scene.content as BoardSceneContent).activeBlockId
      ? "board"
      : "cta"
    : "chart";

const formatFrameTime = (frame: number) => {
  const totalSeconds = Math.floor(frame / advancedStudioIntegrationFps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const frameRemainder = frame % advancedStudioIntegrationFps;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}:${String(frameRemainder).padStart(2, "0")}`;
};

const formatRange = (scene: AdvancedStudioTimedScene) =>
  `${formatFrameTime(scene.startFrame).slice(0, 5)} - ${formatFrameTime(
    scene.endFrame,
  ).slice(0, 5)}`;

const animationLabel = (animation?: string) => {
  if (!animation) return "None";
  return animation
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
};

const AnimationPresetIcon = ({
  preset,
}: {
  preset: (typeof animationPresets)[number]["id"];
}) => {
  if (preset === "focus") return <Crosshair size={18} />;
  if (preset === "reveal") return <Eye size={18} />;
  if (preset === "compare") return <GitCompareArrows size={18} />;
  if (preset === "overview") return <Fullscreen size={18} />;
  if (preset === "spotlight") return <Wand2 size={18} />;
  if (preset === "build" || preset === "count") return <WandSparkles size={18} />;
  return <Sparkles size={18} />;
};

const nonDistinctBoardSemantics = new Set(["build", "trace", "compare"]);

const designForScene = (scene: AdvancedStudioScene) => {
  if (scene.type === "board") return null;
  const content = scene.content as AdvancedStudioInfographicContent;
  return appDesigns.find(
    (design) => design.id === content.designId && design.engine === scene.type,
  );
};

const compatibilityMessageForDesign = (
  scene: AdvancedStudioScene,
  design: AntVStudioDesign,
  content: StudioContent,
) => {
  const compatibility = validateStudioDesignCompatibility({
    design,
    content,
    expectedEngine: scene.type === "board" ? design.engine : scene.type,
  });
  return compatibility.ok ? "" : formatCompatibilityError(compatibility);
};

const firstDesignForEngine = (engine: AntVEngine) => {
  const design = appDesigns.find((item) => item.engine === engine);
  if (!design) throw new Error(`No ${engine} designs registered.`);
  return design;
};

export const AdvancedStudioApp: React.FC = () => {
  const playerRef = React.useRef<PlayerRef>(null);
  const rulerRef = React.useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<
    "template-1" | "template-2"
  >("template-1");
  const [project, setProject] = React.useState<AdvancedStudioProject>(() =>
    copyProject(advancedStudioDefaultProject),
  );
  const [formatId, setFormatId] = React.useState<StudioFormatId>("portrait");
  const [selectedSceneId, setSelectedSceneId] = React.useState(
    project.scenes[1]?.id ?? project.scenes[0]?.id,
  );
  const [currentFrame, setCurrentFrame] = React.useState(152);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [inspectorTab, setInspectorTab] =
    React.useState<(typeof inspectorTabs)[number]>("Scene");
  const [zoomLabel, setZoomLabel] = React.useState("100%");
  const [renderStatus, setRenderStatus] = React.useState<
    "idle" | "rendering" | "complete" | "error"
  >("idle");
  const [renderOutput, setRenderOutput] = React.useState("");
  const [renderError, setRenderError] = React.useState("");
  const [compatibilityNotice, setCompatibilityNotice] = React.useState("");

  const timedScenes = React.useMemo(
    () => getAdvancedStudioTimedScenes(project),
    [project],
  );
  const duration = getAdvancedStudioProjectDuration(project);
  const selectedScene =
    timedScenes.find((scene) => scene.id === selectedSceneId) ?? timedScenes[0];
  const activeScene = getAdvancedStudioSceneAtFrame(currentFrame, project);
  const format = advancedStudioIntegrationFormats[formatId];

  React.useEffect(() => {
    if (activeScene && activeScene.id !== selectedSceneId) {
      setSelectedSceneId(activeScene.id);
    }
  }, [activeScene, selectedSceneId]);

  React.useEffect(() => {
    if (currentFrame >= duration) {
      const next = Math.max(0, duration - 1);
      setCurrentFrame(next);
      playerRef.current?.seekTo(next);
    }
  }, [currentFrame, duration]);

  React.useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = ({detail}: {detail: {frame: number}}) =>
      setCurrentFrame(Math.round(detail.frame));
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("seeked", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);
    player.seekTo(currentFrame);

    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("seeked", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
    };
  }, []);

  const seekToFrame = React.useCallback(
    (frame: number) => {
      const nextFrame = Math.max(0, Math.min(duration - 1, Math.round(frame)));
      playerRef.current?.seekTo(nextFrame);
      setCurrentFrame(nextFrame);
    },
    [duration],
  );

  const selectScene = (scene: AdvancedStudioTimedScene) => {
    setCompatibilityNotice("");
    setSelectedSceneId(scene.id);
    seekToFrame(scene.startFrame);
  };

  const updateScene = (
    id: string,
    updater: (scene: AdvancedStudioScene) => AdvancedStudioScene,
  ) => {
    setCompatibilityNotice("");
    setProject((current) => ({
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === id ? updater(scene) : scene,
      ),
    }));
  };

  const deleteScene = (id: string) => {
    if (project.scenes.length <= 1) return;
    const index = project.scenes.findIndex((scene) => scene.id === id);
    const nextScenes = project.scenes.filter((scene) => scene.id !== id);
    const nextSelected = nextScenes[Math.max(0, index - 1)] ?? nextScenes[0];
    setProject((current) => ({...current, scenes: nextScenes}));
    setSelectedSceneId(nextSelected.id);
    seekToFrame(0);
  };

  const moveScene = (id: string, direction: -1 | 1) => {
    const index = project.scenes.findIndex((scene) => scene.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= project.scenes.length) return;
    const nextScenes = [...project.scenes];
    const [scene] = nextScenes.splice(index, 1);
    nextScenes.splice(target, 0, scene);
    setProject((current) => ({...current, scenes: nextScenes}));
  };

  const togglePlayback = () => {
    if (!playerRef.current) return;
    playerRef.current.toggle();
    setIsPlaying(playerRef.current.isPlaying());
  };

  const stepScene = (direction: -1 | 1) => {
    const currentIndex = timedScenes.findIndex(
      (scene) => scene.id === selectedSceneId,
    );
    const next =
      timedScenes[
        Math.max(0, Math.min(timedScenes.length - 1, currentIndex + direction))
      ];
    if (next) selectScene(next);
  };

  const scrubTimeline = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = rulerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    seekToFrame(((event.clientX - bounds.left) / bounds.width) * duration);
  };

  const previewSelectedScene = () => {
    if (!selectedScene) return;
    seekToFrame(selectedScene.startFrame);
    requestAnimationFrame(() => playerRef.current?.play());
  };

  const loadTemplate = (template: "template-1" | "template-2") => {
    const nextProject = copyProject(
      template === "template-1"
        ? advancedStudioDefaultProject
        : advancedStudioTemplate2Project,
    );
    setSelectedTemplate(template);
    setProject(nextProject);
    setSelectedSceneId(nextProject.scenes[0].id);
    setCurrentFrame(0);
    setIsPlaying(false);
    setCompatibilityNotice("");
    setRenderStatus("idle");
    setRenderOutput("");
    setRenderError("");
    playerRef.current?.pause();
    playerRef.current?.seekTo(0);
  };

  const applyDesignToSelectedScene = (design: AntVStudioDesign) => {
    if (!selectedScene) return;
    const nextContent = createAdvancedStudioInfographicContent(design);
    const message = compatibilityMessageForDesign(
      {...selectedScene, type: design.engine},
      design,
      nextContent.content ?? design.defaultContent,
    );
    if (message) {
      setCompatibilityNotice(message);
      return;
    }
    updateScene(selectedScene.id, (current) => ({
      ...current,
      type: design.engine,
      title: design.name,
      content: nextContent,
    }));
    seekToFrame(selectedScene.startFrame);
    requestAnimationFrame(() => playerRef.current?.play());
  };

  const exportAdvanced = async () => {
    setRenderStatus("rendering");
    setRenderOutput("");
    setRenderError("");
    setCompatibilityNotice("");
    try {
      for (const scene of project.scenes) {
        if (scene.type === "board") continue;
        const content = scene.content as AdvancedStudioInfographicContent;
        const design = antVStudioDesigns.find(
          (item) => item.id === content.designId && item.engine === scene.type,
        );
        if (!design) {
          throw new Error(`Advanced Studio requires registered design ${content.designId}.`);
        }
        const compatibility = validateStudioDesignCompatibility({
          design,
          content: content.content ?? design.defaultContent,
          expectedEngine: scene.type,
        });
        if (!compatibility.ok) {
          throw new Error(`${scene.id}: ${formatCompatibilityError(compatibility)}`);
        }
      }
      const response = await fetch("/api/render-advanced", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({project, formatId}),
      });
      const result = (await response.json().catch(() => ({}))) as {
        output?: string;
        downloadUrl?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "Export failed");
      }
      setRenderOutput(result.output ?? "");
      setRenderStatus("complete");
      if (result.downloadUrl) {
        const download = document.createElement("a");
        download.href = result.downloadUrl;
        download.download = "";
        document.body.appendChild(download);
        download.click();
        download.remove();
      }
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : "Export failed");
      setRenderStatus("error");
    }
  };

  return (
    <div className="advanced-shell">
      <header className="advanced-topbar">
        <div className="brand-lockup">
          <div className="fp-mark">FP</div>
          <div className="brand-divider" />
          <button className="studio-title-button" type="button">
            Advanced Studio <ChevronDown size={16} />
          </button>
          <select
            className="advanced-input"
            aria-label="Advanced Studio project"
            value={selectedTemplate}
            onChange={(event) =>
              loadTemplate(event.target.value as "template-1" | "template-2")
            }
          >
            <option value="template-1">Template 1</option>
            <option value="template-2">Template 2 — Executive Signal</option>
          </select>
        </div>

        <div className="format-switcher" role="group" aria-label="Output format">
          {formatOrder.map((id) => {
            const option = advancedStudioIntegrationFormats[id];
            const active = id === formatId;
            const Icon = id === "vertical" ? Ratio : Square;
            return (
              <button
                key={id}
                className={`format-option ${active ? "active" : ""}`}
                type="button"
                onClick={() => setFormatId(id)}
              >
                <Icon size={20} />
                <span>
                  <strong>{option.label}</strong>
                  <small>
                    {option.width}x{option.height}
                  </small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="top-actions">
          <button
            className="toolbar-button"
            type="button"
            onClick={previewSelectedScene}
            title="Seek to the selected scene and play"
          >
            <Play size={16} /> Preview Scene
          </button>
          <button
            className="render-button"
            type="button"
            onClick={exportAdvanced}
            disabled={renderStatus === "rendering"}
          >
            <Download size={16} />
            {renderStatus === "rendering"
              ? "Exporting"
              : renderStatus === "complete"
                ? "Exported"
                : renderStatus === "error"
                  ? "Export Failed"
                  : "Export"}
          </button>
          {renderStatus !== "idle" ? (
            <div className={`render-feedback ${renderStatus}`}>
              <strong>
                {renderStatus === "rendering"
                  ? "Exporting"
                  : renderStatus === "complete"
                    ? "Export complete"
                    : "Export failed"}
              </strong>
              {renderOutput ? <span>{renderOutput}</span> : null}
              {renderError ? <span>{renderError}</span> : null}
            </div>
          ) : null}
          {compatibilityNotice ? (
            <div className="render-feedback error">
              <strong>Design incompatible</strong>
              <span>{compatibilityNotice}</span>
            </div>
          ) : null}
          <button className="icon-button" type="button" aria-label="Settings" disabled>
            <Settings size={18} />
          </button>
        </div>
      </header>

      <aside className="scene-browser">
        <div className="panel-heading">
          <h1>Templates</h1>
        </div>

        <div className="left-template-browser">
          <UniversalTemplateBrowser
            selectedDesignId={
              selectedScene?.type === "board"
                ? undefined
                : (selectedScene?.content as AdvancedStudioInfographicContent | undefined)
                    ?.designId
            }
            selectedEngine={
              selectedScene && selectedScene.type !== "board"
                ? (selectedScene.type as AntVEngine)
                : undefined
            }
            onApply={applyDesignToSelectedScene}
          />
        </div>

        <div className="scene-total">
          <span>Project Duration</span>
          <strong>
            {formatFrameTime(duration).slice(0, 5)} ({duration} frames)
          </strong>
        </div>
      </aside>

      <main className="preview-pane">
        <div className="preview-toolbar">
          <button
            className="zoom-button"
            type="button"
            onClick={() => setZoomLabel((label) => (label === "100%" ? "Fit" : "100%"))}
          >
            <ZoomIn size={15} /> {zoomLabel} <ChevronDown size={14} />
          </button>
        </div>

        <div className="stage-area">
          <div
            className="stage-shell"
            style={{aspectRatio: `${format.width} / ${format.height}`}}
          >
            <Player
              ref={playerRef}
              component={AdvancedStudioIntegrationProof}
              durationInFrames={Math.max(1, duration)}
              fps={advancedStudioIntegrationFps}
              compositionWidth={format.width}
              compositionHeight={format.height}
              inputProps={{formatId, project}}
              initialFrame={Math.min(currentFrame, duration - 1)}
              controls={false}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>

        <div className="playback-bar">
          <button className="icon-button" type="button" onClick={() => seekToFrame(0)}>
            <SkipBack size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => stepScene(-1)}>
            <SkipBack size={18} strokeWidth={1.5} />
          </button>
          <button className="play-button" type="button" onClick={togglePlayback}>
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button className="icon-button" type="button" onClick={() => stepScene(1)}>
            <SkipForward size={18} strokeWidth={1.5} />
          </button>
          <div className="time-readout">
            <strong>{formatFrameTime(currentFrame)}</strong>
            <span>/ {formatFrameTime(duration)}</span>
            <em>
              ({currentFrame} / {duration})
            </em>
          </div>
          <button className="fit-button" type="button" onClick={() => setZoomLabel("Fit")}>
            Fit
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => playerRef.current?.requestFullscreen()}
            aria-label="Fullscreen"
          >
            <Fullscreen size={18} />
          </button>
        </div>
      </main>

      <aside className="inspector">
        <div className="inspector-tabs">
          {inspectorTabs.map((tab) => (
            <button
              key={tab}
              className={tab === inspectorTab ? "active" : ""}
              type="button"
              onClick={() => setInspectorTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <InspectorBody
          scene={selectedScene}
          tab={inspectorTab}
          onPreview={previewSelectedScene}
          onUpdate={(updater) => selectedScene && updateScene(selectedScene.id, updater)}
          onCompatibilityError={setCompatibilityNotice}
          onDelete={() => selectedScene && deleteScene(selectedScene.id)}
          onMove={(direction) => selectedScene && moveScene(selectedScene.id, direction)}
        />
      </aside>

      <section className="timeline">
        <div className="timeline-board">
          <div className="ruler" ref={rulerRef} onPointerDown={scrubTimeline}>
            {Array.from({length: Math.floor(duration / 30) + 1}).map(
              (_, index) => {
                const frame = index * 30;
                return (
                  <span key={frame} style={{left: `${(frame / duration) * 100}%`}}>
                    {frame}f
                  </span>
                );
              },
            )}
          </div>
          <div className="tracks">
            <div className="video-track">
              {timedScenes.map((scene, index) => (
                <button
                  key={scene.id}
                  className={`timeline-segment ${
                    scene.id === selectedSceneId ? "selected" : ""
                  }`}
                  type="button"
                  onClick={() => selectScene(scene)}
                  style={{
                    left: `${(scene.startFrame / duration) * 100}%`,
                    width: `${(scene.durationFrames / duration) * 100}%`,
                  }}
                >
                  <span className="segment-index">{index + 1}</span>
                  <SceneThumbnail tone={sceneTone(scene)} small />
                  <strong>{titleForScene(scene)}</strong>
                  <em>{subtitleForScene(scene)}</em>
                </button>
              ))}
              {timedScenes.slice(1).map((scene) =>
                scene.transitionIn ? (
                  <span
                    key={scene.id}
                    className="transition-chip"
                    style={{left: `${(scene.startFrame / duration) * 100}%`}}
                  >
                    <Share2 size={14} /> {scene.transitionIn.durationFrames}f
                  </span>
                ) : null,
              )}
            </div>
            <div className="camera-track">
              <div
                className="camera-curve"
                style={{
                  left: `${((selectedScene?.startFrame ?? 0) / duration) * 100}%`,
                  width: `${
                    ((selectedScene?.durationFrames ?? 0) / duration) * 100
                  }%`,
                }}
              >
                <span>
                  {
                    getAdvancedStudioCameraPath(
                      selectedScene?.cameraPath?.preset ??
                        selectedScene?.cameraPreset ??
                        "static",
                    ).label
                  }
                </span>
                <i className="camera-path-line" />
              </div>
            </div>
            <div className="audio-track">
              <div className="waveform" />
            </div>
            <div className="music-track">
              <span>Upbeat Corporate</span>
            </div>
          </div>
          <div
            className="playhead"
            style={{left: `${(currentFrame / duration) * 100}%`}}
          />
        </div>
      </section>
    </div>
  );
};

const SceneThumbnail: React.FC<{
  tone: "board" | "chart" | "cta";
  small?: boolean;
}> = ({tone, small}) => (
  <span className={`scene-thumb ${tone} ${small ? "small" : ""}`}>
    {tone === "chart" ? (
      <span className="mini-bars">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    ) : (
      <span className="mini-board">
        <i />
        <b>{tone === "cta" ? "DRIVE" : "BUDGET"}</b>
      </span>
    )}
  </span>
);

const InspectorBody: React.FC<{
  scene?: AdvancedStudioTimedScene;
  tab: (typeof inspectorTabs)[number];
  onPreview: () => void;
  onUpdate: (updater: (scene: AdvancedStudioScene) => AdvancedStudioScene) => void;
  onCompatibilityError: (message: string) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}> = ({
  scene,
  tab,
  onPreview,
  onUpdate,
  onCompatibilityError,
  onDelete,
  onMove,
}) => {
  if (!scene) return null;

  const isBoard = scene.type === "board";
  const boardContent = scene.content as BoardSceneContent;
  const infographicContent = scene.content as AdvancedStudioInfographicContent;
  const design = designForScene(scene);

  if (tab === "Camera") {
    return (
      <div className="inspector-body">
        <CameraPathInspector
          scene={scene}
          onUpdate={onUpdate}
          onPreview={onPreview}
        />
      </div>
    );
  }

  if (tab === "Transition") {
    return (
      <div className="inspector-body">
        <TransitionInspector scene={scene} />
      </div>
    );
  }

  const updateContent = (content: StudioContent) => {
    onUpdate((current) => ({
      ...current,
      title: content.title,
      content: {
        ...(current.content as AdvancedStudioInfographicContent),
        content,
      },
    }));
  };

  return (
    <div className="inspector-body">
      <InspectorField label="Scene">
        <input
          className="advanced-input"
          value={scene.title}
          onChange={(event) =>
            onUpdate((current) => ({...current, title: event.target.value}))
          }
        />
        <div className="scene-actions">
          <button type="button" onClick={() => onMove(-1)}>Move Up</button>
          <button type="button" onClick={() => onMove(1)}>Move Down</button>
          <button type="button" onClick={onDelete}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </InspectorField>

      <InspectorField label="Scene Type">
        <select
          className="advanced-input"
          value={scene.type}
          onChange={(event) => {
            const type = event.target.value as AdvancedStudioSceneType;
            onUpdate((current) => {
              if (type === "board") {
                return {
                  ...current,
                  type,
                  title: "Board Focus",
                  content: {
                    project: boardProjectCopy(),
                    activeBlockId: "budget",
                    animation: "focus",
                  },
                };
              }
              const nextDesign = firstDesignForEngine(type);
              const nextContent = createAdvancedStudioInfographicContent(nextDesign);
              const message = compatibilityMessageForDesign(
                {...current, type},
                nextDesign,
                nextContent.content ?? nextDesign.defaultContent,
              );
              if (message) {
                onCompatibilityError(message);
                return current;
              }
              return {
                ...current,
                type,
                title: nextDesign.name,
                content: nextContent,
              };
            });
          }}
        >
          <option value="board">Board Scene</option>
          <option value="g2">G2 Infographic</option>
          <option value="g6">G6 Infographic</option>
        </select>
      </InspectorField>

      <InspectorField label="Duration">
        <div className="dual-fields">
          <label>
            <input
              className="advanced-input"
              type="number"
              min={30}
              step={15}
              value={scene.durationFrames}
              onChange={(event) => {
                const durationFrames = Number(event.target.value);
                if (!Number.isSafeInteger(durationFrames)) return;
                onUpdate((current) => ({
                  ...current,
                  durationFrames: Math.max(30, durationFrames),
                }));
              }}
            />
            frames
          </label>
          <span>
            <strong>{formatFrameTime(scene.durationFrames)}</strong> time
          </span>
        </div>
      </InspectorField>

      {isBoard ? (
        <BoardInspector
          content={boardContent}
          onPreview={onPreview}
          onChange={(content) =>
            onUpdate((current) => ({...current, content}))
          }
        />
      ) : design ? (
        <InfographicInspector
          scene={scene}
          design={design}
          content={infographicContent.content ?? cloneContent(design.defaultContent)}
          onDesign={(nextDesign) =>
            onUpdate((current) => {
              const nextContent = createAdvancedStudioInfographicContent(nextDesign);
              const message = compatibilityMessageForDesign(
                {...current, type: nextDesign.engine},
                nextDesign,
                nextContent.content ?? nextDesign.defaultContent,
              );
              if (message) {
                onCompatibilityError(message);
                return current;
              }
              return {
                ...current,
                type: nextDesign.engine,
                title: nextDesign.name,
                content: nextContent,
              };
            })
          }
          onContent={updateContent}
          onControls={(controls) =>
            onUpdate((current) => ({
              ...current,
              content: {
                ...(current.content as AdvancedStudioInfographicContent),
                controls,
              },
            }))
          }
        />
      ) : null}

      {!isBoard && design ? (
        <InspectorField label="Internal Object Animation">
          <div className="asset-row compact">
            <BarChart3 size={18} />
            <span>
              <strong>{animationLabel(design.animation)}</strong>
              <small>Controlled by the selected AntV template design.</small>
            </span>
            <button type="button" onClick={onPreview}>
              Preview
            </button>
          </div>
        </InspectorField>
      ) : null}

      <InspectorField label="Preview">
        <div className="asset-row compact">
          <Film size={18} />
          <span>
            <strong>Selected scene</strong>
            <small>Seek to this scene and play.</small>
          </span>
          <button type="button" onClick={onPreview}>
            Preview
          </button>
        </div>
      </InspectorField>
    </div>
  );
};

const CameraPathInspector: React.FC<{
  scene: AdvancedStudioScene;
  onUpdate: (updater: (scene: AdvancedStudioScene) => AdvancedStudioScene) => void;
  onPreview: () => void;
}> = ({scene, onUpdate, onPreview}) => {
  const currentPath = getAdvancedStudioCameraPath(
    scene.cameraPath?.preset ?? scene.cameraPreset ?? "static",
  );
  const applyPath = (preset: (typeof advancedStudioCameraPaths)[number]["id"]) => {
    onUpdate((current) => ({
      ...current,
      cameraPath: {preset},
    }));
    requestAnimationFrame(onPreview);
  };

  return (
    <>
      <InspectorField label="Camera Path">
        <select
          className="advanced-input"
          value={currentPath.id}
          onChange={(event) =>
            applyPath(
              event.target.value as (typeof advancedStudioCameraPaths)[number]["id"],
            )
          }
        >
          {advancedStudioCameraPaths.map((path) => (
            <option key={path.id} value={path.id}>
              {path.id === "static" ? "Static / None" : path.label}
            </option>
          ))}
        </select>
        <div className="panel-subheading">{currentPath.description}</div>
        <div className="camera-path-grid">
          {advancedStudioCameraPaths.map((path) => (
            <button
              key={path.id}
              type="button"
              className={currentPath.id === path.id ? "active" : ""}
              onClick={() => applyPath(path.id)}
            >
              <span>
                <i
                  style={{
                    left: `${50 + path.points[0].x}%`,
                    top: `${50 + path.points[0].y}%`,
                  }}
                />
                <b
                  style={{
                    left: `${50 + path.points[1].x}%`,
                    top: `${50 + path.points[1].y}%`,
                  }}
                />
              </span>
              <strong>{path.id === "static" ? "Static / None" : path.label}</strong>
            </button>
          ))}
        </div>
      </InspectorField>
      <InspectorField label="Camera Status">
        <div className="info-row muted">
          Camera Path writes only <strong>scene.cameraPath</strong>.
        </div>
      </InspectorField>
    </>
  );
};

const SemanticMotionInspector: React.FC<{
  content: BoardSceneContent;
  onChange: (content: BoardSceneContent) => void;
  onPreview: () => void;
}> = ({content, onChange, onPreview}) => (
  <InspectorField label="Semantic Motion">
    <div className="panel-subheading">Board scene behavior from Animation Review presets.</div>
    <div className="animation-preset-grid">
      {animationPresets.map((preset) => {
        const needsTarget = preset.id !== "overview";
        const disabled = needsTarget && !content.activeBlockId;
        const status = nonDistinctBoardSemantics.has(preset.id)
          ? "No distinct Board behavior yet"
          : preset.description;

        return (
          <button
            key={preset.id}
            type="button"
            className={content.animation === preset.id ? "active" : ""}
            disabled={disabled}
            title={disabled ? "Choose a Scene Target before applying this preset." : undefined}
            onClick={() => {
              onChange({
                ...content,
                animation: preset.id,
                activeBlockId:
                  preset.id === "overview" ? null : content.activeBlockId,
              });
              requestAnimationFrame(onPreview);
            }}
          >
            <AnimationPresetIcon preset={preset.id} />
            <span>
              <strong>{preset.label}</strong>
              <small>{status}</small>
            </span>
          </button>
        );
      })}
    </div>
  </InspectorField>
);

const TransitionInspector: React.FC<{scene: AdvancedStudioTimedScene}> = ({
  scene,
}) => (
  <InspectorField label="Transitions">
    <div className="asset-row compact">
      <Share2 size={18} />
      <span>
        <strong>{scene.transitionIn?.preset ?? scene.transitionOut?.preset ?? "None"}</strong>
        <small>
          In {scene.transitionIn?.durationFrames ?? 0}f / Out{" "}
          {scene.transitionOut?.durationFrames ?? 0}f
        </small>
      </span>
    </div>
  </InspectorField>
);

const UniversalTemplateBrowser: React.FC<{
  selectedDesignId?: string;
  selectedEngine?: AntVEngine;
  onApply: (design: AntVStudioDesign) => void;
}> = ({selectedDesignId, selectedEngine, onApply}) => {
  const [engine, setEngine] = React.useState<AntVEngine | "all">(
    selectedEngine ?? "all",
  );
  const [category, setCategory] = React.useState("all");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (selectedEngine) setEngine(selectedEngine);
  }, [selectedEngine]);

  const visibleDesigns = appDesigns.filter((design) => {
    if (engine !== "all" && design.engine !== engine) return false;
    if (category !== "all" && design.category !== category) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [
      design.name,
      design.category,
      design.description,
      design.engine,
      design.industryExample,
    ].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <InspectorField label="Universal Template Browser">
      <div className="template-browser-controls">
        <input
          className="advanced-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search G2 or G6 templates"
        />
        <div className="engine-filter-row">
          <button
            type="button"
            className={engine === "all" ? "active" : ""}
            onClick={() => setEngine("all")}
          >
            All
          </button>
          {engineOrder.map((item) => (
            <button
              key={item}
              type="button"
              className={engine === item ? "active" : ""}
              onClick={() => setEngine(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
        <select
          className="advanced-input"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {appCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <div className="template-browser-count">
          {visibleDesigns.length} visible / {appDesigns.length} total
        </div>
      </div>

      <div className="template-library-grid">
        {visibleDesigns.map((design) => (
          <button
            key={design.id}
            type="button"
            className={selectedDesignId === design.id ? "active" : ""}
            onClick={() => onApply(design)}
          >
            <TemplateThumbnail templateId={design.id} />
            <span className="template-card-copy">
              <strong>{design.name}</strong>
              <small>
                {design.engine.toUpperCase()} · {design.category} ·{" "}
                {animationLabel(design.animation)}
              </small>
            </span>
          </button>
        ))}
      </div>
    </InspectorField>
  );
};

const TemplateThumbnail: React.FC<{
  templateId: string;
}> = ({templateId}) => (
  <span className="g2-template-thumbnail">
    <img
      src={`/antv-studio-previews/${templateId}.png`}
      alt=""
      loading="lazy"
    />
  </span>
);

const BoardInspector: React.FC<{
  content: BoardSceneContent;
  onPreview: () => void;
  onChange: (content: BoardSceneContent) => void;
}> = ({content, onPreview, onChange}) => {
  if (content.infographic) {
    return (
      <InspectorField label="AntV Infographic">
        <div className="asset-row compact">
          <BarChart3 size={18} />
          <span>
            <strong>{content.infographic.title}</strong>
            <small>
              {content.infographic.template} · provider-native structured data
            </small>
          </span>
        </div>
      </InspectorField>
    );
  }

  const project = content.project ?? boardProjectCopy();
  const block = content.activeBlockId
    ? project.blocks.find((item) => item.id === content.activeBlockId)
    : null;
  return (
    <>
      <InspectorField label="Board Content">
        <input
          className="advanced-input"
          value={project.title}
          onChange={(event) =>
            onChange({...content, project: {...project, title: event.target.value}})
          }
        />
        <input
          className="advanced-input"
          value={project.subtitle}
          onChange={(event) =>
            onChange({...content, project: {...project, subtitle: event.target.value}})
          }
        />
        {block ? (
          <input
            className="advanced-input"
            value={block.title}
            onChange={(event) =>
              onChange({
                ...content,
                project: {
                  ...project,
                  blocks: project.blocks.map((item) =>
                    item.id === block.id ? {...item, title: event.target.value} : item,
                  ),
                },
              })
            }
          />
        ) : null}
      </InspectorField>

      <InspectorField label="Scene Target">
        <select
          className="advanced-input"
          value={content.activeBlockId ?? "overview"}
          onChange={(event) => {
            onChange({
              ...content,
              activeBlockId:
                event.target.value === "overview" ? null : event.target.value,
            });
            requestAnimationFrame(onPreview);
          }}
        >
          <option value="overview">Full Overview</option>
          {project.blocks.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </InspectorField>

      <SemanticMotionInspector
        content={content}
        onChange={onChange}
        onPreview={onPreview}
      />

    </>
  );
};

const InfographicInspector: React.FC<{
  scene: AdvancedStudioScene;
  design: AntVStudioDesign;
  content: StudioContent;
  onDesign: (design: AntVStudioDesign) => void;
  onContent: (content: StudioContent) => void;
  onControls: (controls: AdvancedStudioInfographicContent["controls"]) => void;
}> = ({
  scene,
  design,
  content,
  onDesign,
  onContent,
  onControls,
}) => {
  const sceneContent = scene.content as AdvancedStudioInfographicContent;
  const controls = sceneContent.controls ?? defaultControls;
  const designs = appDesigns.filter((item) => item.engine === scene.type);

  return (
    <>
      <InspectorField label="Design Browser">
        <select
          className="advanced-input"
          value={design.id}
          onChange={(event) => {
            const next = appDesigns.find(
              (item) => item.id === event.target.value,
            );
            if (next) onDesign(next);
          }}
        >
          {designs.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.category}
            </option>
          ))}
        </select>
        <div className="engine-filter-row">
          {engineOrder.map((engine) => (
            <button
              key={engine}
              type="button"
              className={scene.type === engine ? "active" : ""}
              onClick={() => onDesign(firstDesignForEngine(engine))}
            >
              {engine.toUpperCase()}
            </button>
          ))}
        </div>
      </InspectorField>

      <InspectorField label="Content">
        <input
          className="advanced-input"
          value={content.title}
          onChange={(event) => onContent({...content, title: event.target.value})}
        />
        <input
          className="advanced-input"
          value={content.subtitle ?? ""}
          onChange={(event) =>
            onContent({...content, subtitle: event.target.value})
          }
        />
        {design.engine === "g6"
          ? (content.nodes ?? []).map((node, index) => (
              <input
                key={node.id}
                className="advanced-input"
                value={node.label}
                onChange={(event) =>
                  onContent({
                    ...content,
                    nodes: (content.nodes ?? []).map((item, nodeIndex) =>
                      nodeIndex === index
                        ? {...item, label: event.target.value}
                        : item,
                    ),
                  })
                }
              />
            ))
          : content.rows.map((row, index) => (
              <div className="data-row" key={row.id}>
                <input
                  className="advanced-input"
                  value={row.label}
                  onChange={(event) =>
                    onContent({
                      ...content,
                      rows: content.rows.map((item, rowIndex) =>
                        rowIndex === index
                          ? {...item, label: event.target.value}
                          : item,
                      ),
                    })
                  }
                />
                <input
                  className="advanced-input"
                  type="number"
                  value={row.value}
                  onChange={(event) =>
                    onContent({
                      ...content,
                      rows: content.rows.map((item, rowIndex) =>
                        rowIndex === index
                          ? {...item, value: Number(event.target.value) || 0}
                          : item,
                      ),
                    })
                  }
                />
              </div>
            ))}
      </InspectorField>

      <InspectorField label="Design Controls">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={controls.showLabels}
            onChange={(event) =>
              onControls({...controls, showLabels: event.target.checked})
            }
          />
          Labels
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={controls.showLegend}
            onChange={(event) =>
              onControls({...controls, showLegend: event.target.checked})
            }
          />
          Legend
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={controls.compact}
            onChange={(event) =>
              onControls({...controls, compact: event.target.checked})
            }
          />
          Compact
        </label>
      </InspectorField>
    </>
  );
};

const InspectorField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({label, children}) => (
  <section className="inspector-field">
    <h2>{label}</h2>
    {children}
  </section>
);

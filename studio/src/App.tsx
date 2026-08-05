import React, {useEffect, useMemo, useRef, useState} from "react";
import {Player} from "@remotion/player";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Copy,
  Crosshair,
  Eye,
  Funnel,
  GitCompareArrows,
  Grid2X2,
  LayoutGrid,
  Maximize,
  Network,
  PanelTop,
  PieChart,
  Plus,
  Save,
  Settings,
  Sparkles,
  Target,
  Trash2,
  WandSparkles,
  Waypoints,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {Board} from "../../shared/Board";
import {ExplainerVideo} from "../../shared/ExplainerVideo";
import {animationPresets} from "../../shared/animation-presets";
import {
  blockDefinitions,
  defaultProject,
  type AnimationPreset,
  type BlockType,
  type DesignPreset,
  type StudioBlock,
  type StudioProject,
} from "../../shared/project";

const designPresets: Array<{
  id: DesignPreset;
  label: string;
}> = [
  {id: "hero", label: "Hero Emphasis"},
  {id: "supporting", label: "Supporting Block"},
  {id: "data", label: "Data Block"},
  {id: "process", label: "Process Block"},
  {id: "summary", label: "Summary Block"},
  {id: "technical", label: "Technical Callout"},
  {id: "balanced", label: "Balanced Grid"},
  {id: "editorial", label: "Editorial Spread"},
];

const presetSize: Record<
  DesignPreset,
  {width: number; height: number}
> = {
  hero: {width: 300, height: 190},
  supporting: {width: 240, height: 160},
  data: {width: 350, height: 180},
  process: {width: 620, height: 150},
  summary: {width: 280, height: 145},
  technical: {width: 340, height: 180},
  balanced: {width: 300, height: 170},
  editorial: {width: 430, height: 200},
};

const iconForBlock = (type: BlockType) => {
  if (type === "timeline" || type === "process") return Waypoints;
  if (type === "funnel") return Funnel;
  if (type === "donut") return PieChart;
  if (type === "bars" || type === "metrics") return BarChart3;
  if (type === "comparison") return GitCompareArrows;
  if (type === "hierarchy") return Network;
  if (type === "objective") return Target;
  return Sparkles;
};

const copyProject = (project: StudioProject): StudioProject =>
  JSON.parse(JSON.stringify(project)) as StudioProject;

export const App: React.FC = () => {
  const [project, setProject] = useState<StudioProject>(() =>
    copyProject(defaultProject),
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    "budget",
  );
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    project.scenes[0].id,
  );
  const [zoom, setZoom] = useState(0.86);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [renderStatus, setRenderStatus] = useState<
    "idle" | "rendering" | "complete" | "error"
  >("idle");
  const [saved, setSaved] = useState(true);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const selectedBlock =
    project.blocks.find((block) => block.id === selectedBlockId) ?? null;

  const selectedScene =
    project.scenes.find((scene) => scene.id === selectedSceneId) ?? null;

  const totalDuration = useMemo(
    () =>
      project.scenes.reduce(
        (sum, scene) => sum + scene.durationSeconds,
        0,
      ),
    [project.scenes],
  );

  const totalFrames = Math.max(1, Math.round(totalDuration * 30));

  useEffect(() => {
    setSaved(false);

    const timeout = window.setTimeout(async () => {
      try {
        await fetch("/api/project", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(project),
        });

        setSaved(true);
      } catch {
        setSaved(false);
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [project]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;

      if (!drag) return;

      const deltaX = (event.clientX - drag.startClientX) / zoom;
      const deltaY = (event.clientY - drag.startClientY) / zoom;

      setProject((current) => ({
        ...current,
        blocks: current.blocks.map((block) =>
          block.id === drag.id
            ? {
                ...block,
                x: Math.max(
                  0,
                  Math.min(1000 - block.width, drag.startX + deltaX),
                ),
                y: Math.max(
                  95,
                  Math.min(640 - block.height, drag.startY + deltaY),
                ),
              }
            : block,
        ),
      }));
    };

    const onPointerUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [zoom]);

  const addBlock = (type: BlockType) => {
    const definition = blockDefinitions.find((item) => item.type === type);
    const id = `${type}-${Date.now()}`;

    const nextBlock: StudioBlock = {
      id,
      type,
      title: definition?.title.toUpperCase() ?? "NEW BLOCK",
      x: 360,
      y: 215,
      width: type === "timeline" ? 620 : 300,
      height: type === "timeline" ? 150 : 175,
      designPreset: type === "timeline" ? "process" : "supporting",
    };

    setProject((current) => ({
      ...current,
      blocks: [...current.blocks, nextBlock],
    }));

    setSelectedBlockId(id);
  };

  const applyDesignPreset = (preset: DesignPreset) => {
    if (!selectedBlock) return;

    const size = presetSize[preset];

    setProject((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === selectedBlock.id
          ? {
              ...block,
              designPreset: preset,
              width: size.width,
              height: size.height,
              x: Math.min(block.x, 1000 - size.width),
              y: Math.min(block.y, 640 - size.height),
            }
          : block,
      ),
    }));
  };

  const applyAnimationPreset = (animation: AnimationPreset) => {
    if (!selectedBlock && animation !== "overview") return;

    setProject((current) => {
      const existingScene = current.scenes.find(
        (scene) =>
          scene.id === selectedSceneId ||
          (selectedBlock && scene.blockId === selectedBlock.id),
      );

      if (existingScene) {
        return {
          ...current,
          scenes: current.scenes.map((scene) =>
            scene.id === existingScene.id
              ? {
                  ...scene,
                  blockId:
                    animation === "overview"
                      ? null
                      : selectedBlock?.id ?? scene.blockId,
                  animation,
                }
              : scene,
          ),
        };
      }

      const id = `scene-${Date.now()}`;

      return {
        ...current,
        scenes: [
          ...current.scenes,
          {
            id,
            blockId:
              animation === "overview" ? null : selectedBlock?.id ?? null,
            title:
              animation === "overview"
                ? "Full Overview"
                : selectedBlock?.title ?? "New Scene",
            animation,
            durationSeconds: 4,
          },
        ],
      };
    });
  };

  const deleteSelectedBlock = () => {
    if (!selectedBlock) return;

    setProject((current) => ({
      ...current,
      blocks: current.blocks.filter(
        (block) => block.id !== selectedBlock.id,
      ),
      scenes: current.scenes.filter(
        (scene) => scene.blockId !== selectedBlock.id,
      ),
    }));

    setSelectedBlockId(null);
  };

  const duplicateSelectedBlock = () => {
    if (!selectedBlock) return;

    const id = `${selectedBlock.type}-${Date.now()}`;

    setProject((current) => ({
      ...current,
      blocks: [
        ...current.blocks,
        {
          ...selectedBlock,
          id,
          x: Math.min(1000 - selectedBlock.width, selectedBlock.x + 24),
          y: Math.min(640 - selectedBlock.height, selectedBlock.y + 24),
        },
      ],
    }));

    setSelectedBlockId(id);
  };

  const addScene = () => {
    const id = `scene-${Date.now()}`;

    setProject((current) => ({
      ...current,
      scenes: [
        ...current.scenes,
        {
          id,
          blockId: selectedBlock?.id ?? null,
          title: selectedBlock?.title ?? "Full Overview",
          animation: selectedBlock ? "focus" : "overview",
          durationSeconds: 4,
        },
      ],
    }));

    setSelectedSceneId(id);
  };

  const moveScene = (direction: -1 | 1) => {
    const currentIndex = project.scenes.findIndex(
      (scene) => scene.id === selectedSceneId,
    );

    const targetIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= project.scenes.length
    ) {
      return;
    }

    setProject((current) => {
      const scenes = [...current.scenes];
      const [scene] = scenes.splice(currentIndex, 1);
      scenes.splice(targetIndex, 0, scene);

      return {...current, scenes};
    });
  };

  const renderVideo = async () => {
    setRenderStatus("rendering");

    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error("Render failed");
      }

      setRenderStatus("complete");
    } catch {
      setRenderStatus("error");
    }
  };

  return (
    <div className="studio-shell">
      <header className="topbar">
        <div className="brand-mark">F</div>
        <strong className="brand-name">Framepoint Studio</strong>

        <div className="project-path">
          <span>Project</span>
          <b>{project.title}</b>
          <ChevronDown size={14} />
          <span className={saved ? "saved saved-on" : "saved"}>
            <Save size={13} />
            {saved ? "Saved" : "Saving"}
          </span>
        </div>

        <div className="top-actions">
          <button
            className="secondary-button"
            onClick={() => setPreviewOpen(true)}
          >
            <CirclePlay size={17} />
            Preview
          </button>

          <button
            className="render-button"
            onClick={renderVideo}
            disabled={renderStatus === "rendering"}
          >
            <PanelTop size={17} />
            {renderStatus === "rendering"
              ? "Rendering…"
              : renderStatus === "complete"
                ? "Rendered"
                : "Render Video"}
          </button>

          <button
            className="icon-text-button"
            onClick={() =>
              window.alert(
                "The functionality proof intentionally exposes only proven design and animation presets.",
              )
            }
          >
            <Settings size={17} />
            Settings
          </button>
        </div>
      </header>

      <aside className="left-panel">
        <div className="panel-heading">BLOCKS</div>
        <div className="panel-subheading">
          Click to add to the canvas
        </div>

        <div className="block-library">
          {blockDefinitions.map((definition) => {
            const Icon = iconForBlock(definition.type);

            return (
              <button
                key={definition.type}
                className="library-card"
                onClick={() => addBlock(definition.type)}
              >
                <div>
                  <strong>{definition.title}</strong>
                  <span>{definition.description}</span>
                </div>
                <Icon size={34} />
              </button>
            );
          })}
        </div>
      </aside>

      <main className="workspace-column">
        <div className="canvas-toolbar">
          <div className="toolbar-group">
            <button
              className="toolbar-button"
              onClick={duplicateSelectedBlock}
              disabled={!selectedBlock}
            >
              <Copy size={17} />
              Duplicate
            </button>

            <button
              className="toolbar-button danger"
              onClick={deleteSelectedBlock}
              disabled={!selectedBlock}
            >
              <Trash2 size={17} />
              Delete
            </button>
          </div>

          <div className="toolbar-group">
            <button
              className="square-button"
              onClick={() =>
                setZoom((value) => Math.max(0.5, value - 0.08))
              }
            >
              <ZoomOut size={17} />
            </button>

            <div className="zoom-label">
              {Math.round(zoom * 100)}%
            </div>

            <button
              className="square-button"
              onClick={() =>
                setZoom((value) => Math.min(1.25, value + 0.08))
              }
            >
              <ZoomIn size={17} />
            </button>

            <button
              className="square-button"
              onClick={() => setZoom(0.86)}
            >
              <Maximize size={17} />
            </button>
          </div>
        </div>

        <div
          ref={workspaceRef}
          className="canvas-workspace"
          onClick={() => setSelectedBlockId(null)}
        >
          <div
            className="board-transform"
            style={{
              transform: `translate(-50%, -50%) scale(${zoom})`,
            }}
          >
            <Board
              project={project}
              selectedBlockId={selectedBlockId}
              interactive
              onSelectBlock={(id) =>
                setSelectedBlockId(id || null)
              }
              onStartDrag={(event, block) => {
                event.preventDefault();
                event.stopPropagation();

                setSelectedBlockId(block.id);

                dragRef.current = {
                  id: block.id,
                  startClientX: event.clientX,
                  startClientY: event.clientY,
                  startX: block.x,
                  startY: block.y,
                };
              }}
            />
          </div>
        </div>

        <section className="scene-panel">
          <div className="scene-header">
            <span>SCENE SEQUENCE</span>
            <div>
              <button
                className="small-square-button"
                onClick={() => moveScene(-1)}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                className="small-square-button"
                onClick={() => moveScene(1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="scene-strip">
            {project.scenes.map((scene, index) => {
              const active = scene.id === selectedSceneId;

              return (
                <button
                  key={scene.id}
                  className={`scene-card ${active ? "scene-active" : ""}`}
                  onClick={() => {
                    setSelectedSceneId(scene.id);
                    setSelectedBlockId(scene.blockId);
                  }}
                >
                  <span className="scene-index">{index + 1}</span>
                  <strong>{scene.title}</strong>
                  <span>{scene.animation}</span>
                  <small>{scene.durationSeconds.toFixed(1)}s</small>
                </button>
              );
            })}

            <button className="add-scene-card" onClick={addScene}>
              <Plus size={21} />
              Add Scene
            </button>
          </div>

          <div className="duration-label">
            Total Duration: {totalDuration.toFixed(1)}s
          </div>
        </section>
      </main>

      <aside className="right-panel">
        <div className="panel-heading">PRESETS</div>

        <section className="preset-section">
          <div className="preset-title">DESIGN PRESETS</div>
          <div className="panel-subheading">
            Apply proven layout and styling rules
          </div>

          <div className="design-grid">
            {designPresets.map((preset) => {
              const active =
                selectedBlock?.designPreset === preset.id;

              return (
                <button
                  key={preset.id}
                  className={`design-preset ${
                    active ? "preset-active" : ""
                  }`}
                  disabled={!selectedBlock}
                  onClick={() => applyDesignPreset(preset.id)}
                >
                  {preset.id === "data" ? (
                    <BarChart3 size={18} />
                  ) : preset.id === "process" ? (
                    <Waypoints size={18} />
                  ) : preset.id === "balanced" ? (
                    <Grid2X2 size={18} />
                  ) : preset.id === "editorial" ? (
                    <LayoutGrid size={18} />
                  ) : (
                    <PanelTop size={18} />
                  )}
                  {preset.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="preset-section">
          <div className="preset-title">ANIMATION PRESETS</div>
          <div className="panel-subheading">
            Apply proven motion behavior
          </div>

          <div className="animation-list">
            {animationPresets.map((preset) => {
              const active =
                selectedScene?.animation === preset.id &&
                (preset.id === "overview" ||
                  selectedScene?.blockId === selectedBlockId);

              return (
                <button
                  key={preset.id}
                  className={`animation-preset ${
                    active ? "preset-active" : ""
                  }`}
                  onClick={() =>
                    applyAnimationPreset(preset.id)
                  }
                >
                  {preset.id === "focus" ? (
                    <Crosshair size={18} />
                  ) : preset.id === "reveal" ? (
                    <Eye size={18} />
                  ) : preset.id === "spotlight" ? (
                    <WandSparkles size={18} />
                  ) : preset.id === "compare" ? (
                    <GitCompareArrows size={18} />
                  ) : preset.id === "overview" ? (
                    <Maximize size={18} />
                  ) : (
                    <Sparkles size={18} />
                  )}

                  <span>
                    <strong>{preset.label}</strong>
                    <small>{preset.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </aside>

      {previewOpen ? (
        <div className="preview-overlay">
          <div className="preview-dialog">
            <div className="preview-header">
              <strong>Video Preview</strong>
              <button
                className="secondary-button"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </button>
            </div>

            <Player
              component={ExplainerVideo}
              inputProps={project}
              durationInFrames={totalFrames}
              fps={30}
              compositionWidth={1536}
              compositionHeight={1024}
              controls
              autoPlay
              loop
              style={{
                width: "100%",
                aspectRatio: "3 / 2",
                background: "#000",
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

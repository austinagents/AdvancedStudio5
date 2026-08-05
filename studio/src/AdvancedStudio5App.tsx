import React from "react";
import {GeometryTemplate01} from "../../src/GeometryTemplate01";
import {GeometryTemplate02} from "../../src/GeometryTemplate02";
import {GeometryTemplate03} from "../../src/GeometryTemplate03";
import {GeometryTemplate04} from "../../src/GeometryTemplate04";
import {GeometryTemplate05} from "../../src/GeometryTemplate05";
import {GeometryTemplate06} from "../../src/GeometryTemplate06";
import {GeometryTemplate07} from "../../src/GeometryTemplate07";
import {GeometryTemplate08} from "../../src/GeometryTemplate08";
import {GeometryTemplate09} from "../../src/GeometryTemplate09";
import {GeometryTemplate10} from "../../src/GeometryTemplate10";
import {GeometryTemplate11} from "../../src/GeometryTemplate11";
import {Player, type PlayerRef} from "@remotion/player";
import {
  Check,
  ChevronDown,
  Download,
  Folder,
  Film,
  ImagePlus,
  MonitorPlay,
  Palette,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  ProductVideo,
  getProductVideoDuration,
  productVideoFormats,
  productVideoFps,
  type ProductVideoFormat,
  type ProductVideoProps,
} from "../../src/advanced-studio2/ProductVideo";
import {
  productTemplates,
  type ProductMediaSlot,
  type ProductTemplateId,
} from "../../src/advanced-studio2/product-templates";
import type {
  PolyHavenAssetSummary,
  PolyHavenAssetType,
  PolyHavenCachedAssetSelection,
  PolyHavenTextureSelection,
} from "../../src/advanced-studio2/polyhaven-assets";

type GeometryTemplateEntry = {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  component: React.ComponentType<{
    imageSrc?: string;
  }>;
};

const geometryTemplates: GeometryTemplateEntry[] = [
  {
    id: "particle-assembly",
    number: "01",
    name: "Particle Assembly",
    subtitle: "Geometry Field",
    component: GeometryTemplate01,
  },
  {
    id: "voxel-reconstruction",
    number: "02",
    name: "Voxel Reconstruction",
    subtitle: "Product Cubes",
    component: GeometryTemplate02,
  },
  {
    id: "ribbon-weave",
    number: "03",
    name: "Ribbon Weave",
    subtitle: "Product Strips",
    component: GeometryTemplate03,
  },
  {
    id: "radial-shatter",
    number: "04",
    name: "Radial Shatter",
    subtitle: "Fragment Collapse",
    component: GeometryTemplate04,
  },
  {
    id: "layer-stack",
    number: "05",
    name: "Layer Stack",
    subtitle: "Contour Slices",
    component: GeometryTemplate05,
  },
  {
    id: "helix-assembly",
    number: "06",
    name: "Helix Assembly",
    subtitle: "Spiral Geometry",
    component: GeometryTemplate06,
  },
  {
    id: "magnetic-field",
    number: "07",
    name: "Magnetic Field",
    subtitle: "Field Convergence",
    component: GeometryTemplate07,
  },
  {
    id: "liquid-pixels",
    number: "08",
    name: "Liquid Pixels",
    subtitle: "Product Droplets",
    component: GeometryTemplate08,
  },
  {
    id: "origami-fold",
    number: "09",
    name: "Origami Fold",
    subtitle: "Surface Folding",
    component: GeometryTemplate09,
  },
  {
    id: "scanline-build",
    number: "10",
    name: "Scanline Build",
    subtitle: "Sequential Slices",
    component: GeometryTemplate10,
  },
  {
    id: "implosion-tunnel",
    number: "11",
    name: "Implosion Tunnel",
    subtitle: "Depth Collapse",
    component: GeometryTemplate11,
  },
];

const formats: Array<{id: ProductVideoFormat; label: string; meta: string}> = [
  {id: "portrait", label: "Portrait", meta: "1080 × 1350"},
  {id: "square", label: "Square", meta: "1080 × 1080"},
  {id: "vertical", label: "Vertical", meta: "1080 × 1920"},
];

const archivedUserFacingTemplateIds = new Set<ProductTemplateId>([
  "porcelain-blossom",
]);
const userFacingProductTemplates = productTemplates.filter(
  (template) => !archivedUserFacingTemplateIds.has(template.id),
);

const defaultState: ProductVideoProps = {
  templateId: "obsidian",
  imageSrc: "",
  media: {},
  productName: "Aurelia One",
  headline: "",
  subheadline: "",
  eyebrow: "",
  cta: "",
  accent: "",
  formatId: "portrait",
};

export const AdvancedStudio5App: React.FC = () => {
  const playerRef = React.useRef<PlayerRef>(null);

  const [
    selectedGeometryTemplateId,
    setSelectedGeometryTemplateId,
  ] = React.useState(
    geometryTemplates[0].id,
  );
  const [project, setProject] = React.useState<ProductVideoProps>(defaultState);
  const [isTemplateLibraryExpanded, setIsTemplateLibraryExpanded] =
    React.useState(true);
  const [expandedBatch, setExpandedBatch] = React.useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | null>(null);
  const [isProcessingImage, setIsProcessingImage] = React.useState(false);
  const [imageMessage, setImageMessage] = React.useState("");
  const [renderState, setRenderState] = React.useState<
    "idle" | "rendering" | "complete" | "error"
  >("idle");
  const [renderMessage, setRenderMessage] = React.useState("");
  const [polyHavenSearch, setPolyHavenSearch] = React.useState("");
  const [polyHavenAssetType, setPolyHavenAssetType] =
    React.useState<PolyHavenAssetType>("textures");
  const [polyHavenAssets, setPolyHavenAssets] = React.useState<
    PolyHavenAssetSummary[]
  >([]);
  const [polyHavenCachedAsset, setPolyHavenCachedAsset] =
    React.useState<PolyHavenCachedAssetSelection>();
  const [polyHavenState, setPolyHavenState] = React.useState<
    "idle" | "loading" | "downloading" | "error"
  >("idle");
  const [polyHavenMessage, setPolyHavenMessage] = React.useState("");
  const selectedGeometryTemplate =
    geometryTemplates.find(
      (template) =>
        template.id ===
        selectedGeometryTemplateId,
    ) ?? geometryTemplates[0];

  const format = productVideoFormats[project.formatId];
  const selectedTemplate =
    productTemplates.find((item) => item.id === project.templateId) ??
    productTemplates[0];
  const durationInFrames = getProductVideoDuration(project.templateId);
  const selectedPolyHavenAsset =
    polyHavenAssetType === "textures"
      ? project.polyHavenTexture
      : polyHavenCachedAsset?.assetType === polyHavenAssetType
        ? polyHavenCachedAsset
        : undefined;

  React.useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setPolyHavenState("loading");
      setPolyHavenMessage("");
      try {
        const response = await fetch(
          `/api/advanced-studio2/polyhaven/assets?q=${encodeURIComponent(
            polyHavenSearch,
          )}&type=${polyHavenAssetType}`,
          {signal: controller.signal},
        );
        const result = (await response.json()) as {
          ok?: boolean;
          items?: PolyHavenAssetSummary[];
          error?: string;
        };
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "Poly Haven catalog unavailable.");
        }
        setPolyHavenAssets(result.items ?? []);
        setPolyHavenState("idle");
      } catch (error) {
        if (controller.signal.aborted) return;
        setPolyHavenState("error");
        setPolyHavenMessage(
          error instanceof Error
            ? error.message
            : "Poly Haven catalog unavailable.",
        );
      }
    }, 250);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [polyHavenAssetType, polyHavenSearch]);

  const update = <K extends keyof ProductVideoProps>(
    key: K,
    value: ProductVideoProps[K],
  ) => {
    setProject((current) => ({...current, [key]: value}));
    setRenderState("idle");
    setRenderMessage("");
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setImageMessage("Choose a PNG, JPEG, or WebP product image.");
      return;
    }
    setIsProcessingImage(true);
    setImageMessage("Apple Vision is isolating your product…");
    try {
      const response = await fetch(
        "/api/advanced-studio2/remove-background",
        {
          method: "POST",
          headers: {"Content-Type": file.type},
          body: file,
        },
      );
      if (!response.ok) {
        const result = (await response.json()) as {error?: string};
        throw new Error(result.error || "Background removal failed.");
      }
      const productImage = await response.blob();
      const reader = new FileReader();
      const imageSrc = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("The product image could not be read."));
        reader.readAsDataURL(productImage);
      });
      update("imageSrc", imageSrc);
      setImageMessage("Product isolated and converted to 3D.");
      playerRef.current?.seekTo(0);
      window.setTimeout(() => {
        playerRef.current?.play();
      }, 100);
    } catch (error) {
      setImageMessage(
        error instanceof Error ? error.message : "Background removal failed.",
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleMediaUpload = async (
    slot: ProductMediaSlot,
    file?: File,
  ) => {
    if (!file) return;
    const acceptedImages = ["image/png", "image/jpeg", "image/webp"];
    const acceptedVideos = ["video/mp4", "video/webm", "video/quicktime"];
    const accepted = slot.kind === "image" ? acceptedImages : acceptedVideos;
    if (!accepted.includes(file.type)) {
      setImageMessage(
        slot.kind === "image"
          ? "Choose a PNG, JPEG, or WebP image."
          : "Choose an MP4, WebM, or QuickTime video.",
      );
      return;
    }
    setIsProcessingImage(true);
    setImageMessage(
      slot.removeBackground
        ? `Apple Vision is isolating ${slot.label.toLowerCase()}…`
        : `Loading ${slot.label.toLowerCase()}…`,
    );
    try {
      let mediaBlob: Blob = file;
      if (slot.removeBackground) {
        const response = await fetch(
          "/api/advanced-studio2/remove-background",
          {
            method: "POST",
            headers: {"Content-Type": file.type},
            body: file,
          },
        );
        if (!response.ok) {
          const result = (await response.json()) as {error?: string};
          throw new Error(result.error || "Background removal failed.");
        }
        mediaBlob = await response.blob();
      }
      const reader = new FileReader();
      const src = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("The media could not be read."));
        reader.readAsDataURL(mediaBlob);
      });
      setProject((current) => ({
        ...current,
        imageSrc:
          slot.id === "hero" ||
          slot.id === "unpackedImage" ||
          slot.id === "packageImage"
            ? src
            : current.imageSrc,
        media: {...current.media, [slot.id]: src},
      }));
      setRenderState("idle");
      setRenderMessage("");
      setImageMessage(
        slot.removeBackground
          ? `${slot.label} isolated with Apple Vision.`
          : `${slot.label} ready.`,
      );
    } catch (error) {
      setImageMessage(
        error instanceof Error ? error.message : "Media upload failed.",
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  const selectPolyHavenAsset = async (
    assetId: string,
    assetType: PolyHavenAssetType = polyHavenAssetType,
  ) => {
    setPolyHavenState("downloading");
    setPolyHavenMessage(
      assetType === "models"
        ? "Downloading the verified 1K GLTF and dependencies…"
        : assetType === "hdris"
          ? "Downloading the verified 1K HDR environment…"
          : "Downloading the approved 2K diffuse texture…",
    );
    try {
      const response = await fetch(
        "/api/advanced-studio2/polyhaven/download",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({assetId, assetType}),
        },
      );
      const result = (await response.json()) as {
        ok?: boolean;
        selection?:
          | PolyHavenTextureSelection
          | PolyHavenCachedAssetSelection;
        error?: string;
      };
      if (!response.ok || !result.ok || !result.selection) {
        throw new Error(result.error || "Poly Haven download failed.");
      }
      if (assetType === "textures") {
        update(
          "polyHavenTexture",
          result.selection as PolyHavenTextureSelection,
        );
      } else {
        setPolyHavenCachedAsset(
          result.selection as PolyHavenCachedAssetSelection,
        );
      }
      setPolyHavenState("idle");
      setPolyHavenMessage(`${result.selection.name} is cached and render-ready.`);
    } catch (error) {
      setPolyHavenState("error");
      setPolyHavenMessage(
        error instanceof Error
          ? error.message
          : "Poly Haven download failed.",
      );
    }
  };

  React.useEffect(() => {
    if (
      (selectedTemplate.batch !== 12 &&
        selectedTemplate.batch !== 13 &&
        selectedTemplate.batch !== 14 &&
        selectedTemplate.batch !== 15 &&
        selectedTemplate.batch !== 16 &&
        selectedTemplate.batch !== 17 &&
        selectedTemplate.batch !== 18) ||
      !selectedTemplate.polyHavenDefaultAssetId
    ) {
      return;
    }
    void selectPolyHavenAsset(
      selectedTemplate.polyHavenDefaultAssetId,
      "textures",
    );
  }, [project.templateId]);

  const renderVideo = async () => {
    setRenderState("rendering");
    setRenderMessage("Rendering the exact preview composition…");
    try {
      const response = await fetch("/api/render-advanced2", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(project),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        downloadUrl?: string;
        error?: string;
      };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Render failed.");
      }
      setRenderState("complete");
      setRenderMessage("Your product video is ready.");
    } catch (error) {
      setRenderState("error");
      setRenderMessage(error instanceof Error ? error.message : "Render failed.");
    }
  };

  return (
    <div className="as2-shell">
      <header className="as2-topbar">
        <div className="as2-brand">
          <div className="as2-mark">FP</div>
          <div>
            <strong>Advanced Studio 5</strong>
            <span>Geometry Nodes Lab</span>
          </div>
        </div>
        <div className="as2-top-actions">
          <div className="as2-status">
            <Check size={15} /> Preview and export use one composition
          </div>
          {renderState === "complete" ? (
            <a
              className="as2-button secondary"
              href={`/api/export-advanced2/${project.formatId}`}
            >
              <Download size={18} /> Download MP4
            </a>
          ) : null}
          <button
            className="as2-button primary"
            type="button"
            onClick={renderVideo}
            disabled={
              renderState === "rendering" ||
              polyHavenState === "downloading" ||
              ((selectedTemplate.batch === 12 ||
                selectedTemplate.batch === 13 ||
                selectedTemplate.batch === 14 ||
                selectedTemplate.batch === 15 ||
                selectedTemplate.batch === 16 ||
                selectedTemplate.batch === 17 ||
                selectedTemplate.batch === 18) &&
                !project.polyHavenTexture)
            }
          >
            <Sparkles size={18} />
            {renderState === "rendering"
              ? "Rendering…"
              : (selectedTemplate.batch === 12 ||
                    selectedTemplate.batch === 13 ||
                    selectedTemplate.batch === 14 ||
                    selectedTemplate.batch === 15 ||
                    selectedTemplate.batch === 16 ||
                    selectedTemplate.batch === 17 ||
                    selectedTemplate.batch === 18) &&
                  (!project.polyHavenTexture ||
                    polyHavenState === "downloading")
                ? "Preparing material…"
                : "Export video"}
          </button>
        </div>
      </header>

      <main className="as2-workspace">
        <aside className="as2-library">
          <button
            className="as2-template-folder"
            type="button"
            aria-expanded={isTemplateLibraryExpanded}
            onClick={() => setIsTemplateLibraryExpanded((current) => !current)}
          >
            <span className="as2-folder-icon">
              <Folder size={20} fill="currentColor" />
            </span>
            <div>
              <strong>Product Templates 1</strong>
              <small>{geometryTemplates.length} templates</small>
            </div>
            <ChevronDown
              className="as2-folder-chevron"
              size={17}
              aria-hidden="true"
            />
          </button>

          {isTemplateLibraryExpanded ? (
            <div className="as2-template-library-folders">
              <div className="as2-template-grid">
                {geometryTemplates.map(
                  (template) => {
                    const selected =
                      selectedGeometryTemplate.id ===
                      template.id;

                    return (
                      <button
                        key={template.id}
                        className={
                          selected
                            ? "as2-template-card selected"
                            : "as2-template-card"
                        }
                        type="button"
                        onClick={() => {
                          setSelectedGeometryTemplateId(
                            template.id,
                          );

                          playerRef.current?.seekTo(0);

                          window.setTimeout(
                            () =>
                              playerRef.current?.play(),
                            50,
                          );
                        }}
                      >
                        <div
                          className="as2-template-art"
                          style={{
                            background:
                              "radial-gradient(circle at 50% 40%, #253650, #07090d 72%)",
                            color: "#ffffff",
                            borderColor:
                              selected
                                ? "#8fc5ff88"
                                : "#8fc5ff33",
                          }}
                        >
                          <span
                            style={{
                              background:
                                "#b9dcff",
                            }}
                          />

                          <b>
                            {template.number}
                          </b>

                          <em>
                            {template.number ===
                            "01"
                              ? "ASSEMBLY"
                              : "GEOMETRY"}
                          </em>
                        </div>

                        <div>
                          <strong>
                            {template.name}
                          </strong>

                          <small>
                            {template.subtitle}
                          </small>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          ) : null}
        </aside>

        <section className="as2-stage-column">
          <div className="as2-stage-toolbar">
            <div>
              <MonitorPlay size={17} />
              <strong>Live composition</strong>
              <span>{selectedGeometryTemplate.name}</span>
            </div>
            <div className="as2-format-tabs">
              {formats.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={project.formatId === item.id ? "active" : ""}
                  onClick={() => update("formatId", item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.meta}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="as2-stage">
            <div
              className="as2-player-frame"
              style={{aspectRatio: `${format.width} / ${format.height}`}}
            >
              <Player
                ref={playerRef}
                component={selectedGeometryTemplate.component}
                inputProps={{imageSrc: project.imageSrc}}
                durationInFrames={180}
                fps={30}
                compositionWidth={format.width}
                compositionHeight={format.height}
                style={{width: "100%", height: "100%"}}
                controls
                loop
                autoPlay
                acknowledgeRemotionLicense
              />
            </div>
          </div>

          <div className="as2-playback">
            <button
              type="button"
              onClick={() => playerRef.current?.toggle()}
              aria-label="Play preview"
            >
              <Play size={20} fill="currentColor" />
            </button>
            <div>
              <strong>6 second procedural product story</strong>
              <span>Disperse → assemble → product reveal</span>
            </div>
            <div className="as2-timeline">
              <span />
              <span />
              <span />
            </div>
          </div>

          {renderState !== "idle" ? (
            <div className={`as2-render-message ${renderState}`}>
              {renderMessage}
            </div>
          ) : null}
        </section>

        <aside className="as2-inspector">
          <div className="as2-panel-heading">
            <span>02</span>
            <div>
              <strong>Add your product</strong>
              <small>Only approved fields are editable</small>
            </div>
          </div>

          {selectedTemplate.mediaSlots ? (
            <div className="as2-media-slots">
              {selectedTemplate.mediaSlots.map((slot) => {
                const src = project.media?.[slot.id];
                return (
                  <label className="as2-media-slot" key={slot.id}>
                    <span className="as2-media-slot-preview">
                      {src && slot.kind === "image" ? (
                        <img src={src} alt="" />
                      ) : slot.kind === "video" ? (
                        <Film size={22} />
                      ) : (
                        <ImagePlus size={22} />
                      )}
                    </span>
                    <span>
                      <strong>{slot.label}</strong>
                      <small>
                        {slot.kind === "video"
                          ? "MP4, WebM, or QuickTime"
                          : slot.removeBackground
                            ? "Background removed automatically"
                            : "Original background preserved"}
                      </small>
                    </span>
                    <b>
                      <Upload size={14} />
                      {src ? "Replace" : "Add"}
                    </b>
                    <input
                      type="file"
                      accept={
                        slot.kind === "video"
                          ? "video/mp4,video/webm,video/quicktime"
                          : "image/png,image/jpeg,image/webp"
                      }
                      disabled={isProcessingImage}
                      onChange={(event) =>
                        handleMediaUpload(slot, event.target.files?.[0])
                      }
                    />
                  </label>
                );
              })}
            </div>
          ) : (
            <label className="as2-upload">
              {project.imageSrc ? (
                <img src={project.imageSrc} alt="Uploaded product" />
              ) : (
                <div>
                  <ImagePlus size={30} />
                  <strong>Upload product image</strong>
                  <span>Apple Vision removes the background on this Mac</span>
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={isProcessingImage}
                onChange={(event) => handleUpload(event.target.files?.[0])}
              />
              <b>
                <Upload size={15} />{" "}
                {isProcessingImage
                  ? "Removing background…"
                  : project.imageSrc
                    ? "Replace image"
                    : "Choose image"}
              </b>
            </label>
          )}
          {imageMessage ? (
            <div className="as2-image-message">{imageMessage}</div>
          ) : null}

          <section className="as2-polyhaven">
              <div className="as2-polyhaven-heading">
                <div>
                  <strong>Poly Haven assets</strong>
                  <small>
                    Official textures, HDRIs, and models
                  </small>
                </div>
                {selectedPolyHavenAsset ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (polyHavenAssetType === "textures") {
                        update("polyHavenTexture", undefined);
                      } else {
                        setPolyHavenCachedAsset(undefined);
                      }
                    }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <div className="as2-polyhaven-tabs">
                {(
                  [
                    ["textures", "Materials"],
                    ["hdris", "HDRIs"],
                    ["models", "Models"],
                  ] as const
                ).map(([assetType, label]) => (
                  <button
                    key={assetType}
                    type="button"
                    className={
                      polyHavenAssetType === assetType ? "active" : ""
                    }
                    onClick={() => {
                      setPolyHavenAssetType(assetType);
                      setPolyHavenSearch("");
                      setPolyHavenMessage("");
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {selectedPolyHavenAsset ? (
                <div className="as2-polyhaven-selected">
                  <img
                    src={selectedPolyHavenAsset.thumbnailUrl}
                    alt=""
                  />
                  <div>
                    <strong>{selectedPolyHavenAsset.name}</strong>
                    <small>
                      {polyHavenAssetType === "models"
                        ? "1K GLTF package · cached locally"
                        : polyHavenAssetType === "hdris"
                          ? "1K HDR environment · cached locally"
                          : "2K diffuse JPG · cached locally"}
                    </small>
                  </div>
                  <Check size={16} />
                </div>
              ) : null}
              <label className="as2-polyhaven-search">
                <Search size={15} />
                <input
                  value={polyHavenSearch}
                  onChange={(event) => setPolyHavenSearch(event.target.value)}
                  placeholder={
                    polyHavenAssetType === "models"
                      ? "Search rocks, architecture, objects…"
                      : polyHavenAssetType === "hdris"
                        ? "Search studio, sky, interior…"
                        : "Search stone, metal, fabric…"
                  }
                />
              </label>
              <div className="as2-polyhaven-grid">
                {polyHavenAssets.map((asset) => (
                  <button
                    key={asset.assetId}
                    type="button"
                    className={
                      selectedPolyHavenAsset?.assetId === asset.assetId
                        ? "selected"
                        : ""
                    }
                    disabled={polyHavenState === "downloading"}
                    onClick={() =>
                      selectPolyHavenAsset(
                        asset.assetId,
                        polyHavenAssetType,
                      )
                    }
                    title={asset.description}
                  >
                    <img src={asset.thumbnailUrl} alt="" />
                    <span>{asset.name}</span>
                  </button>
                ))}
              </div>
              {polyHavenState === "loading" ? (
                <div className="as2-polyhaven-message">
                  Loading Poly Haven {polyHavenAssetType}…
                </div>
              ) : null}
              {polyHavenMessage ? (
                <div className="as2-polyhaven-message">
                  {polyHavenMessage}
                </div>
              ) : null}
              <a
                className="as2-polyhaven-credit"
                href="https://polyhaven.com/"
                target="_blank"
                rel="noreferrer"
              >
                Powered by Poly Haven · CC0
              </a>
          </section>

          <div className="as2-field-group">
            <label>
              <span>Product name</span>
              <input
                value={project.productName}
                onChange={(event) => update("productName", event.target.value)}
                maxLength={42}
              />
            </label>
            <label>
              <span>Eyebrow</span>
              <input
                value={project.eyebrow ?? ""}
                placeholder={selectedTemplate.eyebrow}
                onChange={(event) => update("eyebrow", event.target.value)}
                maxLength={34}
              />
            </label>
            <label>
              <span>Headline</span>
              <textarea
                value={project.headline ?? ""}
                placeholder={selectedTemplate.headline}
                onChange={(event) => update("headline", event.target.value)}
                maxLength={68}
                rows={2}
              />
            </label>
            <label>
              <span>Supporting line</span>
              <textarea
                value={project.subheadline ?? ""}
                placeholder={selectedTemplate.subheadline}
                onChange={(event) => update("subheadline", event.target.value)}
                maxLength={110}
                rows={3}
              />
            </label>
            <label>
              <span>Call to action</span>
              <input
                value={project.cta ?? ""}
                placeholder={selectedTemplate.cta}
                onChange={(event) => update("cta", event.target.value)}
                maxLength={32}
              />
            </label>
          </div>

          <div className="as2-color-row">
            <div>
              <Palette size={17} />
              <span>
                <strong>Accent color</strong>
                <small>Template default unless overridden</small>
              </span>
            </div>
            <input
              type="color"
              value={project.accent || selectedTemplate.accent}
              onChange={(event) => update("accent", event.target.value)}
            />
          </div>

          <button
            className="as2-reset"
            type="button"
            onClick={() =>
              setProject((current) => ({
                ...defaultState,
                imageSrc: current.imageSrc,
                media: current.media,
                polyHavenTexture: current.polyHavenTexture,
                formatId: current.formatId,
              }))
            }
          >
            <RotateCcw size={15} /> Reset copy and design
          </button>

          <div className="as2-template-note">
            <div>
              <Sparkles size={17} />
              <strong>{selectedTemplate.name}</strong>
              <ChevronDown size={15} />
            </div>
            <p>{selectedTemplate.description}</p>
          </div>
        </aside>
      </main>
    </div>
  );
};

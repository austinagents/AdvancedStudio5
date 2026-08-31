import React from "react";
import { GeometryTemplate01 } from "../../src/GeometryTemplate01";
import { GeometryTemplate02 } from "../../src/GeometryTemplate02";
import { GeometryTemplate03 } from "../../src/GeometryTemplate03";
import { GeometryTemplate04 } from "../../src/GeometryTemplate04";
import { GeometryTemplate05 } from "../../src/GeometryTemplate05";
import { GeometryTemplate06 } from "../../src/GeometryTemplate06";
import { GeometryTemplate07 } from "../../src/GeometryTemplate07";
import { GeometryTemplate08 } from "../../src/GeometryTemplate08";
import { GeometryTemplate09 } from "../../src/GeometryTemplate09";
import { GeometryTemplate10 } from "../../src/GeometryTemplate10";
import { GeometryTemplate11 } from "../../src/GeometryTemplate11";
import { GeometryTemplate12 } from "../../src/GeometryTemplate12";
import { GeometryTemplate13 } from "../../src/GeometryTemplate13";
import { GeometryTemplate14 } from "../../src/GeometryTemplate14";
import { GeometryTemplate15 } from "../../src/GeometryTemplate15";
import { GeometryTemplate16 } from "../../src/GeometryTemplate16";
import { GeometryTemplate17 } from "../../src/GeometryTemplate17";
import { GeometryTemplate18 } from "../../src/GeometryTemplate18";
import { GeometryTemplate19 } from "../../src/GeometryTemplate19";
import { GeometryTemplate20 } from "../../src/GeometryTemplate20";
import { GeometryTemplate21 } from "../../src/GeometryTemplate21";
import { GeometryTemplate22 } from "../../src/GeometryTemplate22";
import { GeometryTemplate24 } from "../../src/GeometryTemplate24";
import { GeometryTemplate25 } from "../../src/GeometryTemplate25";
import { GeometryTemplate26 } from "../../src/GeometryTemplate26";
import { GeometryTemplate29 } from "../../src/GeometryTemplate29";
import { GeometryTemplate23 } from "../../src/GeometryTemplate23";
import { GeometryTemplate27 } from "../../src/GeometryTemplate27";
import { GeometryTemplate28 } from "../../src/GeometryTemplate28";
import { GeometryTemplate30 } from "../../src/GeometryTemplate30";
import { GeometryTemplate31 } from "../../src/GeometryTemplate31";
import { GeometryTemplate33 } from "../../src/GeometryTemplate33";
import { GeometryTemplate34 } from "../../src/GeometryTemplate34";
import { GeometryTemplate35 } from "../../src/GeometryTemplate35";
import { GeometryTemplate36 } from "../../src/GeometryTemplate36";
import { GeometryTemplate37 } from "../../src/GeometryTemplate37";
import { GeometryTemplate38 } from "../../src/GeometryTemplate38";
import { GeometryTemplate39 } from "../../src/GeometryTemplate39";
import { GeometryTemplate40 } from "../../src/GeometryTemplate40";
import { GeometryTemplate41 } from "../../src/GeometryTemplate41";
import { GeometryTemplate42 } from "../../src/GeometryTemplate42";
import { GeometryTemplate43 } from "../../src/GeometryTemplate43";
import { GeometryTemplate44 } from "../../src/GeometryTemplate44";
import { GeometryTemplate45 } from "../../src/GeometryTemplate45";
import { GeometryTemplate46 } from "../../src/GeometryTemplate46";
import { GeometryTemplate47 } from "../../src/GeometryTemplate47";
import { GeometryTemplate48 } from "../../src/GeometryTemplate48";
import { GeometryTemplate49 } from "../../src/GeometryTemplate49";
import { GeometryTemplate50 } from "../../src/GeometryTemplate50";
import { GeometryTemplate51 } from "../../src/GeometryTemplate51";
import { GeometryTemplate52 } from "../../src/GeometryTemplate52";
import { GeometryTemplate53 } from "../../src/GeometryTemplate53";
import { GeometryTemplate54 } from "../../src/GeometryTemplate54";
import { GeometryTemplate55 } from "../../src/GeometryTemplate55";
import { GeometryTemplate56 } from "../../src/GeometryTemplate56";
import { GeometryTemplate57 } from "../../src/GeometryTemplate57";
import { Player, type PlayerRef } from "@remotion/player";
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

import { PT2BackgroundProvider } from "../../src/advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Runtime";

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
  {
    id: "wave-field",
    number: "12",
    name: "Wave Field",
    subtitle: "Surface Wave",
    component: GeometryTemplate12,
  },
  {
    id: "sine-slice",
    number: "13",
    name: "Sine Slice",
    subtitle: "Depth Sections",
    component: GeometryTemplate13,
  },
  {
    id: "lens-warp",
    number: "14",
    name: "Lens Warp",
    subtitle: "Surface Bulge",
    component: GeometryTemplate14,
  },
  {
    id: "pinch-inflate",
    number: "15",
    name: "Pinch Inflate",
    subtitle: "Surface Compression",
    component: GeometryTemplate15,
  },
  {
    id: "twist-column",
    number: "16",
    name: "Twist Column",
    subtitle: "Progressive Rotation",
    component: GeometryTemplate16,
  },
  {
    id: "shockwave",
    number: "17",
    name: "Shockwave",
    subtitle: "Radial Surface Pulse",
    component: GeometryTemplate17,
  },
  {
    id: "noise-displacement",
    number: "18",
    name: "Noise Displacement",
    subtitle: "Organic Surface",
    component: GeometryTemplate18,
  },
  {
    id: "gravity-bend",
    number: "19",
    name: "Gravity Bend",
    subtitle: "Directional Surface",
    component: GeometryTemplate19,
  },
  {
    id: "ripple-scan",
    number: "20",
    name: "Ripple Scan",
    subtitle: "Traveling Wave",
    component: GeometryTemplate20,
  },
  {
    id: "elastic-stretch",
    number: "21",
    name: "Elastic Stretch",
    subtitle: "Spring Surface",
    component: GeometryTemplate21,
  },
  {
    id: "product-echo",
    number: "22",
    name: "Product Echo",
    subtitle: "Temporal Depth",
    component: GeometryTemplate22,
  },
  {
    id: "product-tunnel",
    number: "24",
    name: "Product Tunnel",
    subtitle: "Perspective Copies",
    component: GeometryTemplate24,
  },
  {
    id: "venetian-blinds",
    number: "25",
    name: "Venetian Blinds",
    subtitle: "Rotating Panels",
    component: GeometryTemplate25,
  },
  {
    id: "exploded-layers",
    number: "26",
    name: "Exploded Layers",
    subtitle: "Depth Slices",
    component: GeometryTemplate26,
  },
  {
    id: "accordion-fold",
    number: "29",
    name: "Accordion Fold",
    subtitle: "Zig-Zag Surface",
    component: GeometryTemplate29,
  },
  {
    id: "voronoi-fracture",
    number: "23",
    name: "Voronoi Fracture",
    subtitle: "Product Cells",
    component: GeometryTemplate23,
  },
  {
    id: "contour-growth",
    number: "27",
    name: "Contour Growth",
    subtitle: "Silhouette Propagation",
    component: GeometryTemplate27,
  },
  {
    id: "pixel-point-cloud",
    number: "28 (TEST)",
    name: "Pixel Point Cloud",
    subtitle: "Product Pixels",
    component: GeometryTemplate28,
  },
  {
    id: "adaptive-triangulation",
    number: "30",
    name: "Adaptive Triangulation",
    subtitle: "Topology Fragments",
    component: GeometryTemplate30,
  },
  {
    id: "relief-map",
    number: "31",
    name: "Relief Map",
    subtitle: "Luminance Depth",
    component: GeometryTemplate31,
  },
  {
    id: "edge-particle-growth",
    number: "33 (TEST)",
    name: "Edge Particle Growth",
    subtitle: "Perimeter Geometry",
    component: GeometryTemplate33,
  },
  {
    id: "image-cell-mosaic",
    number: "34",
    name: "Image Cell Mosaic",
    subtitle: "Image Regions",
    component: GeometryTemplate34,
  },
  {
    id: "topology-wavefront",
    number: "35",
    name: "Topology Wavefront",
    subtitle: "Edge Distance Field",
    component: GeometryTemplate35,
  },
  {
    id: "topology-voxel-reconstruction",
    number: "36 (TEST)",
    name: "Topology Voxel Reconstruction",
    subtitle: "Product-Derived Voxels",
    component: GeometryTemplate36,
  },
  {
    id: "contour-terraces",
    number: "37",
    name: "Contour Terraces",
    subtitle: "Silhouette Distance",
    component: GeometryTemplate37,
  },
  {
    id: "chromatic-field",
    number: "38",
    name: "Chromatic Field",
    subtitle: "RGB Vector Field",
    component: GeometryTemplate38,
  },
  {
    id: "contrast-emboss",
    number: "39",
    name: "Contrast Emboss",
    subtitle: "Feature Geometry",
    component: GeometryTemplate39,
  },
  {
    id: "silhouette-normal-burst",
    number: "40",
    name: "Silhouette Normal Burst",
    subtitle: "Alpha Normals",
    component: GeometryTemplate40,
  },
  {
    id: "luminance-strata",
    number: "41",
    name: "Luminance Strata",
    subtitle: "Image Depth Bands",
    component: GeometryTemplate41,
  },
  {
    id: "color-region-split",
    number: "42",
    name: "Color Region Split",
    subtitle: "Chromatic Topology",
    component: GeometryTemplate42,
  },
  {
    id: "gradient-flow",
    number: "43",
    name: "Gradient Flow",
    subtitle: "Image Gradient Field",
    component: GeometryTemplate43,
  },
  {
    id: "medial-ridge",
    number: "44",
    name: "Medial Ridge",
    subtitle: "Interior Distance",
    component: GeometryTemplate44,
  },
  {
    id: "edge-distance-cascade",
    number: "45",
    name: "Edge Distance Cascade",
    subtitle: "Contour Wavefront",
    component: GeometryTemplate45,
  },
  {
    id: "feature-torque",
    number: "46",
    name: "Feature Torque",
    subtitle: "Contrast Driven",
    component: GeometryTemplate46,
  },

  {
    id: "contour-shells",
    number: "47",
    name: "Contour Shells",
    subtitle: "Multi-Stage Silhouette",
    component: GeometryTemplate47,
  },
  {
    id: "feature-isolation",
    number: "48",
    name: "Feature Isolation",
    subtitle: "Artwork Driven",
    component: GeometryTemplate48,
  },
  {
    id: "color-layer-stack",
    number: "49",
    name: "Color Layer Stack",
    subtitle: "Chromatic Regions",
    component: GeometryTemplate49,
  },
  {
    id: "medial-skeleton",
    number: "50",
    name: "Medial Skeleton",
    subtitle: "Structural Core",
    component: GeometryTemplate50,
  },
  {
    id: "surface-compression",
    number: "51",
    name: "Surface Compression",
    subtitle: "Contrast Relief",
    component: GeometryTemplate51,
  },
  {
    id: "contour-ribbons",
    number: "52",
    name: "Contour Ribbons",
    subtitle: "Extracted Topology",
    component: GeometryTemplate52,
  },
  {
    id: "feature-wave",
    number: "53",
    name: "Feature Wave",
    subtitle: "Gradient Propagation",
    component: GeometryTemplate53,
  },
  {
    id: "chromatic-volume",
    number: "54",
    name: "Chromatic Volume",
    subtitle: "RGB Spatial Layers",
    component: GeometryTemplate54,
  },
  {
    id: "topology-crumple",
    number: "55",
    name: "Topology Crumple",
    subtitle: "Feature Creases",
    component: GeometryTemplate55,
  },
  {
    id: "field-fusion",
    number: "56",
    name: "Product Field Fusion",
    subtitle: "Multi-Field System",
    component: GeometryTemplate56,
  },
  {
    id: "beveled-volume-field",
    number: "57",
    name: "Beveled Volume Field",
    subtitle: "Product-Driven Volume",
    component: GeometryTemplate57,
  },

];

const productTemplates2Geometry = geometryTemplates.filter((template) => {
  const number = Number.parseInt(template.number, 10);
  return number >= 57;
});

const formats: Array<{ id: ProductVideoFormat; label: string; meta: string }> =
  [
    { id: "portrait", label: "Portrait", meta: "1080 × 1350" },
    { id: "square", label: "Square", meta: "1080 × 1080" },
    { id: "vertical", label: "Vertical", meta: "1080 × 1920" },
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

  const [selectedGeometryTemplateId, setSelectedGeometryTemplateId] =
    React.useState(geometryTemplates[0].id);
  const [project, setProject] = React.useState<ProductVideoProps>(defaultState);

  const [isTemplateLibrary2Expanded, setIsTemplateLibrary2Expanded] =
    React.useState(true);
  const [expandedBatch, setExpandedBatch] = React.useState<
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | null
  >(null);
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
      (template) => template.id === selectedGeometryTemplateId,
    ) ?? geometryTemplates[0];

  /*
   * Product Templates 2 timing:
   *
   * 57–66 = 12 seconds total
   * 0–10s = geometry behavior
   * 10–12s = final hold
   *
   * Existing templates remain 6 seconds.
   */
  const geometryTemplateNumber = Number.parseInt(
    selectedGeometryTemplate.number,
    10,
  );

  const isProductTemplates2 =
    geometryTemplateNumber >= 57 && geometryTemplateNumber <= 78;

  const geometryDurationInFrames =
    isProductTemplates2
      ? 30 * 12
      : 30 * 6;

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
          { signal: controller.signal },
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
    setProject((current) => ({ ...current, [key]: value }));
    setRenderState("idle");
    setRenderMessage("");
  };

  const [productModelSrc, setProductModelSrc] =
    React.useState<string>("");

  const [productModelName, setProductModelName] =
    React.useState<string>("");

  const handleUpload = async (file?: File) => {
    if (!file) return;

    const isUsdz =
      file.name.toLowerCase().endsWith(".usdz");

    if (isUsdz) {
      setIsProcessingImage(true);
      setImageMessage("Uploading USDZ product…");

      try {
        const response = await fetch(
          "/api/advanced-studio5/product-model",
          {
            method: "POST",
            headers: {
              "Content-Type": "model/vnd.usdz+zip",
            },
            body: file,
          },
        );

        const result = (await response.json()) as {
          ok?: boolean;
          src?: string;
          previewSrc?: string;
          error?: string;
        };

        if (
          !response.ok ||
          !result.ok ||
          !result.src ||
          !result.previewSrc
        ) {
          throw new Error(
            result.error || "USDZ product upload failed.",
          );
        }

        const version =
          Date.now();

        /*
         * Keep the original USDZ available.
         */
        setProductModelSrc(
          `${result.src}?v=${version}`,
        );

        setProductModelName(
          file.name,
        );

        /*
         * Feed the automatically-rendered transparent PNG
         * into the EXISTING image input.
         *
         * No geometry code changes.
         */
        update(
          "imageSrc",
          `${result.previewSrc}?v=${version}`,
        );

        setImageMessage(
          "USDZ product loaded into existing geometry.",
        );

        playerRef.current?.seekTo(0);

        window.setTimeout(
          () => {
            playerRef.current?.play();
          },
          100,
        );
      } catch (error) {
        setImageMessage(
          error instanceof Error
            ? error.message
            : "USDZ product upload failed.",
        );
      } finally {
        setIsProcessingImage(false);
      }

      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setImageMessage("Choose a PNG, JPEG, or WebP product image.");
      return;
    }
    setIsProcessingImage(true);
    setImageMessage("Apple Vision is isolating your product…");
    try {
      const response = await fetch("/api/advanced-studio2/remove-background", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "Background removal failed.");
      }
      const productImage = await response.blob();
      const reader = new FileReader();
      const imageSrc = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () =>
          reject(new Error("The product image could not be read."));
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

  const [backgroundVideoSrc, setBackgroundVideoSrc] =
    React.useState<string>("");

  const [backgroundVideoName, setBackgroundVideoName] =
    React.useState<string>("");

  const handleBackgroundVideoUpload = async (file?: File) => {
    if (!file) {
      return;
    }

    const accepted = ["video/mp4", "video/webm", "video/quicktime"];

    if (!accepted.includes(file.type)) {
      setImageMessage("Choose an MP4 background video.");

      return;
    }

    setImageMessage("Loading background video…");

    try {
      const response = await fetch("/api/advanced-studio5/background-video", {
        method: "POST",

        headers: {
          "Content-Type": file.type,
        },

        body: file,
      });

      const result = (await response.json()) as {
        ok?: boolean;
        src?: string;
        fileName?: string;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.src) {
        throw new Error(result.error || "Background video upload failed.");
      }

      /*
       * Cache bust after replacement.
       * Both Player and CLI renderer receive a real URL,
       * never a data: URL.
       */
      const src = `${result.src}?v=${Date.now()}`;

      setBackgroundVideoSrc(src);

      setBackgroundVideoName(file.name);

      setImageMessage("Background video ready.");

      playerRef.current?.seekTo(0);

      window.setTimeout(() => playerRef.current?.play(), 50);
    } catch (error) {
      setImageMessage(
        error instanceof Error
          ? error.message
          : "Background video upload failed.",
      );
    }
  };

  const handleMediaUpload = async (slot: ProductMediaSlot, file?: File) => {
    if (!file) return;
    const acceptedImages = ["image/png", "image/jpeg", "image/webp"];
    const acceptedVideos = ["video/mp4", "video/webm", "video/quicktime"];
    const accepted = slot.kind === "image" ? acceptedImages : acceptedVideos;
    if (!accepted.includes(file.type)) {
      setImageMessage(
        slot.kind === "image"
          ? "Choose a PNG, JPEG, or WebP image."
          : "Choose an MP4 background video.",
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
            headers: { "Content-Type": file.type },
            body: file,
          },
        );
        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          throw new Error(result.error || "Background removal failed.");
        }
        mediaBlob = await response.blob();
      }
      const reader = new FileReader();
      const src = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () =>
          reject(new Error("The media could not be read."));
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
        media: { ...current.media, [slot.id]: src },
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
      const response = await fetch("/api/advanced-studio2/polyhaven/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, assetType }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        selection?: PolyHavenTextureSelection | PolyHavenCachedAssetSelection;
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
      setPolyHavenMessage(
        `${result.selection.name} is cached and render-ready.`,
      );
    } catch (error) {
      setPolyHavenState("error");
      setPolyHavenMessage(
        error instanceof Error ? error.message : "Poly Haven download failed.",
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
      const templateNumber = Number.parseInt(
        selectedGeometryTemplate.number,
        10,
      );

      const isProductTemplates2 = templateNumber >= 57;

      const response = await fetch(
        isProductTemplates2
          ? "/api/render-advanced5-product-template"
          : "/api/render-advanced2",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(
            isProductTemplates2
              ? {
                  templateNumber: selectedGeometryTemplate.number,

                  imageSrc: project.imageSrc,

                  useBackgroundVideo: Boolean(backgroundVideoSrc),

                  formatId: project.formatId,
                }
              : project,
          ),
        },
      );

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
      setRenderMessage(
        error instanceof Error ? error.message : "Render failed.",
      );
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
              href={
                Number.parseInt(selectedGeometryTemplate.number, 10) >= 57
                  ? `/api/export-advanced5-product-template/${selectedGeometryTemplate.number}/${project.formatId}`
                  : `/api/export-advanced2/${project.formatId}`
              }
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
            aria-expanded={isTemplateLibrary2Expanded}
            onClick={() => setIsTemplateLibrary2Expanded((current) => !current)}
          >
            <span className="as2-folder-icon">
              <Folder size={20} fill="currentColor" />
            </span>

            <div>
              <strong>Product Templates 2</strong>
              <small>{productTemplates2Geometry.length} templates</small>
            </div>

            <ChevronDown
              className="as2-folder-chevron"
              size={17}
              aria-hidden="true"
            />
          </button>

          {isTemplateLibrary2Expanded ? (
            <div className="as2-template-library-folders">
              <div className="as2-template-grid">
                {productTemplates2Geometry.map((template) => {
                  const selected = selectedGeometryTemplate.id === template.id;

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
                        setSelectedGeometryTemplateId(template.id);
                        playerRef.current?.seekTo(0);

                        window.setTimeout(() => playerRef.current?.play(), 50);
                      }}
                    >
                      <div
                        className="as2-template-art"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 40%, #253650, #07090d 72%)",
                          color: "#ffffff",
                          borderColor: selected ? "#8fc5ff88" : "#8fc5ff33",
                        }}
                      >
                        <span
                          style={{
                            background: "#b9dcff",
                          }}
                        />

                        <b>{template.number}</b>
                        <em>GEOMETRY</em>
                      </div>

                      <div>
                        <strong>{template.name}</strong>
                        <small>{template.subtitle}</small>
                      </div>
                    </button>
                  );
                })}
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
              style={{ aspectRatio: `${format.width} / ${format.height}` }}
            >
              <PT2BackgroundProvider
                backgroundVideoSrc={backgroundVideoSrc || undefined}
              >
                <Player
                  ref={playerRef}
                  component={selectedGeometryTemplate.component}
                  inputProps={{ imageSrc: project.imageSrc }}
                  durationInFrames={geometryDurationInFrames}
                  fps={30}
                  compositionWidth={format.width}
                  compositionHeight={format.height}
                  style={{ width: "100%", height: "100%" }}
                  controls
                  loop
                  autoPlay
                  acknowledgeRemotionLicense
                />
              </PT2BackgroundProvider>
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
                  <strong>
                    {productModelSrc
                      ? "3D product uploaded"
                      : "Upload product"}
                  </strong>
                  <span>
                    {productModelSrc
                      ? productModelName
                      : "PNG, JPEG, WebP, or USDZ"}
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,.usdz,model/vnd.usdz+zip"
                disabled={isProcessingImage}
                onChange={(event) => handleUpload(event.target.files?.[0])}
              />
              <b>
                <Upload size={15} />{" "}
                {isProcessingImage
                  ? "Removing background…"
                  : project.imageSrc
                    ? "Replace image"
                    : productModelSrc
                      ? "Replace product"
                      : "Choose product"}
              </b>
            </label>
          )}
          {imageMessage ? (
            <div className="as2-image-message">{imageMessage}</div>
          ) : null}
          <section className="as2-polyhaven">
            <div className="as2-polyhaven-heading">
              <div>
                <strong>Background video</strong>
                <small>Upload an MP4 background for your product scene</small>
              </div>

              {backgroundVideoSrc ? (
                <button
                  type="button"
                  onClick={() => {
                    setBackgroundVideoSrc("");
                    setBackgroundVideoName("");
                    setImageMessage("Background video removed.");
                    playerRef.current?.seekTo(0);
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>

            <label
              className="as2-upload"
              style={{
                minHeight: 150,
                cursor: "pointer",
              }}
            >
              <div>
                <Film size={30} />

                <strong>
                  {backgroundVideoSrc
                    ? "Replace background video"
                    : "Upload background MP4"}
                </strong>

                <span>{backgroundVideoName || "MP4, WebM, or QuickTime"}</span>
              </div>

              <input
                type="file"
                accept="video/mp4"
                onChange={(event) =>
                  void handleBackgroundVideoUpload(event.target.files?.[0])
                }
              />

              <b>
                <Upload size={15} />
                {backgroundVideoSrc ? "Replace video" : "Choose video"}
              </b>
            </label>

            {backgroundVideoSrc ? (
              <video
                src={backgroundVideoSrc}
                muted
                playsInline
                controls
                style={{
                  width: "100%",
                  marginTop: 12,
                  borderRadius: 10,
                  display: "block",
                  maxHeight: 180,
                  objectFit: "cover",
                }}
              />
            ) : null}
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

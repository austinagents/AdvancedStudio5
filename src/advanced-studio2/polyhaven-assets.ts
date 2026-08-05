export type PolyHavenAssetType = "textures" | "hdris" | "models";

export type PolyHavenTextureSelection = {
  assetType?: "textures";
  assetId: string;
  name: string;
  localSrc: string;
  thumbnailUrl: string;
  filesHash: string;
  resolution: "2k";
  mapType: "Diffuse";
  format: "jpg";
  sourceUrl: string;
  authors: string[];
};

export type PolyHavenCachedAssetSelection = {
  assetType: PolyHavenAssetType;
  assetId: string;
  name: string;
  localSrc: string;
  localFiles: string[];
  thumbnailUrl: string;
  filesHash: string;
  resolution: "1k" | "2k";
  format: "gltf" | "hdr" | "jpg";
  sourceUrl: string;
  authors: string[];
};

export type PolyHavenAssetSummary = {
  assetType: PolyHavenAssetType;
  assetId: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  filesHash: string;
  authors: string[];
  downloadCount: number;
  attributes: Record<string, unknown>;
  dimensions?: number[];
  polycount?: number;
  maxResolution?: number[];
};

export type PolyHavenTextureSummary = PolyHavenAssetSummary;

import {defineConfig, type Plugin} from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import {createHash} from "node:crypto";
import {getAdvancedStudioProjectDuration} from "./src/advanced-studio/scene-contract";
import {
  getProductTemplate,
  getProductVideoDuration,
} from "./src/advanced-studio2/product-templates";

const readBody = async (request: import("node:http").IncomingMessage) => {
  return await new Promise<string>((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
};

const readBinaryBody = async (
  request: import("node:http").IncomingMessage,
  maxBytes: number,
) => {
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    request.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        reject(new Error("Product images must be 20 MB or smaller."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
};

const runProcess = (
  command: string,
  args: string[],
): Promise<{code: number | null; stderr: string}> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      shell: false,
    });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => resolve({code, stderr}));
    child.on("error", reject);
  });

const polyHavenHeaders = {
  "User-Agent": "Framepoint-Studio/advanced-studio2-experimental",
  Accept: "application/json",
};

type PolyHavenAsset = {
  name: string;
  description?: string;
  thumbnail_url: string;
  category?: string;
  tags?: string[];
  files_hash: string;
  authors?: Record<string, string>;
  download_count?: number;
  type: number;
  attributes?: Record<string, unknown>;
  dimensions?: number[];
  polycount?: number;
  max_resolution?: number[];
};

type PolyHavenAssetType = "textures" | "hdris" | "models";

const polyHavenTypeCodes: Record<PolyHavenAssetType, number> = {
  hdris: 0,
  textures: 1,
  models: 2,
};

const polyHavenCatalogs: Partial<
  Record<PolyHavenAssetType, Record<string, PolyHavenAsset>>
> = {};

const getPolyHavenCatalog = async (assetType: PolyHavenAssetType) => {
  const cached = polyHavenCatalogs[assetType];
  if (cached) return cached;
  const result = await fetch(
    `https://api.polyhaven.com/assets?type=${assetType}`,
    {headers: polyHavenHeaders},
  );
  if (!result.ok) {
    throw new Error(`Poly Haven catalog request failed (${result.status}).`);
  }
  const catalog = (await result.json()) as Record<string, PolyHavenAsset>;
  polyHavenCatalogs[assetType] = catalog;
  return catalog;
};

type PolyHavenFile = {
  size?: number;
  md5?: string;
  url?: string;
};

const downloadPolyHavenFile = async ({
  source,
  filePath,
  allowedRoot,
  maxBytes,
}: {
  source: PolyHavenFile;
  filePath: string;
  allowedRoot: "Textures" | "HDRIs" | "Models";
  maxBytes: number;
}) => {
  if (!source.url || !source.md5) {
    throw new Error("Poly Haven returned incomplete file metadata.");
  }
  if ((source.size ?? 0) <= 0 || (source.size ?? 0) > maxBytes) {
    throw new Error("Poly Haven returned an unsupported file size.");
  }
  const sourceUrl = new URL(source.url);
  if (
    sourceUrl.protocol !== "https:" ||
    sourceUrl.hostname !== "dl.polyhaven.org" ||
    !sourceUrl.pathname.startsWith(`/file/ph-assets/${allowedRoot}/`)
  ) {
    throw new Error("Poly Haven returned an unsupported file host.");
  }
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  if (!fs.existsSync(filePath)) {
    const download = await fetch(sourceUrl, {
      headers: polyHavenHeaders,
    });
    if (!download.ok) {
      throw new Error(`Poly Haven download failed (${download.status}).`);
    }
    const bytes = Buffer.from(await download.arrayBuffer());
    if (bytes.length === 0 || bytes.length > maxBytes) {
      throw new Error("Poly Haven returned an invalid file size.");
    }
    const md5 = createHash("md5").update(bytes).digest("hex");
    if (md5 !== source.md5) {
      throw new Error("Poly Haven file checksum did not match.");
    }
    const temporaryPath = `${filePath}.download`;
    fs.writeFileSync(temporaryPath, bytes);
    fs.renameSync(temporaryPath, filePath);
  }
  const existingMd5 = createHash("md5")
    .update(fs.readFileSync(filePath))
    .digest("hex");
  if (existingMd5 !== source.md5) {
    throw new Error("Cached Poly Haven file checksum did not match.");
  }
  return sourceUrl;
};

const sendJson = (
  response: import("node:http").ServerResponse,
  statusCode: number,
  body: unknown,
) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
};

const studioApi = (): Plugin => ({
  name: "studio-api",

  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      if (request.url === "/advanced-studio2") {
        request.url = "/advanced-studio2.html";
      }

      if (request.url === "/advanced-studio2-experimental") {
        request.url = "/advanced-studio2.html";
      }

      if (request.url?.startsWith("/antv-studio-previews/")) {
        const assetName = decodeURIComponent(
          request.url.replace("/antv-studio-previews/", "").split("?")[0],
        );
        const filePath = path.resolve("output", "antv-studio", "all", assetName);
        if (!assetName.endsWith(".png") || !fs.existsSync(filePath)) {
          response.statusCode = 404;
          response.end("Not found");
          return;
        }
        response.statusCode = 200;
        response.setHeader("Content-Type", "image/png");
        response.end(fs.readFileSync(filePath));
        return;
      }

      if (
        request.url?.startsWith(
          "/advanced-studio2-assets/blender/template18/",
        ) &&
        request.method === "GET"
      ) {
        const relativePath = decodeURIComponent(
          request.url
            .replace("/advanced-studio2-assets/blender/template18/", "")
            .split("?")[0],
        );
        const assetRoot = path.resolve(
          "public",
          "advanced-studio2-assets",
          "blender",
          "template18",
        );
        const filePath = path.resolve(assetRoot, relativePath);
        if (
          !filePath.startsWith(`${assetRoot}${path.sep}`) ||
          !fs.existsSync(filePath) ||
          !fs.statSync(filePath).isFile()
        ) {
          response.statusCode = 404;
          response.end("Not found");
          return;
        }
        const extension = path.extname(filePath);
        response.setHeader(
          "Content-Type",
          extension === ".mp4"
            ? "video/mp4"
            : extension === ".png"
              ? "image/png"
              : extension === ".json"
                ? "application/json"
                : "application/octet-stream",
        );
        response.setHeader("Accept-Ranges", "bytes");
        const size = fs.statSync(filePath).size;
        const range = request.headers.range;
        if (range) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(range);
          if (!match) {
            response.statusCode = 416;
            response.end();
            return;
          }
          const start = match[1] ? Number(match[1]) : 0;
          const end = match[2] ? Number(match[2]) : size - 1;
          if (start >= size || end >= size || start > end) {
            response.statusCode = 416;
            response.setHeader("Content-Range", `bytes */${size}`);
            response.end();
            return;
          }
          response.statusCode = 206;
          response.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
          response.setHeader("Content-Length", end - start + 1);
          fs.createReadStream(filePath, {start, end}).pipe(response);
          return;
        }
        response.statusCode = 200;
        response.setHeader("Content-Length", size);
        fs.createReadStream(filePath).pipe(response);
        return;
      }

      if (
        request.url?.startsWith(
          "/advanced-studio2-assets/polyhaven/models/",
        ) &&
        request.method === "GET"
      ) {
        const relativePath = decodeURIComponent(
          request.url
            .replace("/advanced-studio2-assets/polyhaven/models/", "")
            .split("?")[0],
        );
        const assetRoot = path.resolve(
          "public",
          "advanced-studio2-assets",
          "polyhaven",
          "models",
        );
        const filePath = path.resolve(assetRoot, relativePath);
        const extension = path.extname(filePath).toLowerCase();
        const allowedExtensions = new Set([
          ".bin",
          ".gltf",
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
        ]);
        if (
          !filePath.startsWith(`${assetRoot}${path.sep}`) ||
          !allowedExtensions.has(extension) ||
          !fs.existsSync(filePath) ||
          !fs.statSync(filePath).isFile()
        ) {
          response.statusCode = 404;
          response.end("Local model asset not found.");
          return;
        }
        response.statusCode = 200;
        response.setHeader(
          "Content-Type",
          extension === ".gltf"
            ? "model/gltf+json"
            : extension === ".jpg" || extension === ".jpeg"
              ? "image/jpeg"
              : extension === ".png"
                ? "image/png"
                : extension === ".webp"
                  ? "image/webp"
                  : "application/octet-stream",
        );
        response.setHeader("Content-Length", fs.statSync(filePath).size);
        fs.createReadStream(filePath).pipe(response);
        return;
      }

      if (
        request.url?.startsWith(
          "/advanced-studio2-assets/polyhaven/",
        ) &&
        request.method === "GET"
      ) {
        const fileName = decodeURIComponent(
          request.url
            .replace("/advanced-studio2-assets/polyhaven/", "")
            .split("?")[0],
        );
        if (
          !/^[a-zA-Z0-9_-]+\.(jpg|json|hdr)$/.test(fileName) ||
          path.basename(fileName) !== fileName
        ) {
          response.statusCode = 400;
          response.end("Invalid local asset path.");
          return;
        }
        const filePath = path.resolve(
          "public",
          "advanced-studio2-assets",
          "polyhaven",
          fileName,
        );
        if (!fs.existsSync(filePath)) {
          response.statusCode = 404;
          response.end("Local asset not found.");
          return;
        }
        response.statusCode = 200;
        response.setHeader(
          "Content-Type",
          fileName.endsWith(".jpg")
            ? "image/jpeg"
            : fileName.endsWith(".hdr")
              ? "application/octet-stream"
              : "application/json",
        );
        response.setHeader("Content-Length", fs.statSync(filePath).size);
        fs.createReadStream(filePath).pipe(response);
        return;
      }

      if (
        request.url?.startsWith("/api/advanced-studio2/polyhaven/assets") &&
        request.method === "GET"
      ) {
        try {
          const requestUrl = new URL(request.url, "http://localhost");
          const query = (requestUrl.searchParams.get("q") ?? "")
            .trim()
            .toLowerCase();
          const requestedType =
            requestUrl.searchParams.get("type") ?? "textures";
          if (!["textures", "hdris", "models"].includes(requestedType)) {
            throw new Error("Invalid Poly Haven asset type.");
          }
          const assetType = requestedType as PolyHavenAssetType;
          const page = Math.max(
            1,
            Number.parseInt(requestUrl.searchParams.get("page") ?? "1", 10) ||
              1,
          );
          const catalog = await getPolyHavenCatalog(assetType);
          const matches = Object.entries(catalog)
            .filter(
              ([, asset]) => asset.type === polyHavenTypeCodes[assetType],
            )
            .filter(([assetId, asset]) => {
              if (!query) return true;
              return [
                assetId,
                asset.name,
                asset.description ?? "",
                asset.category ?? "",
                ...(asset.tags ?? []),
              ]
                .join(" ")
                .toLowerCase()
                .includes(query);
            })
            .sort(
              ([, left], [, right]) =>
                (right.download_count ?? 0) - (left.download_count ?? 0),
            );
          const pageSize = 48;
          const items = matches
            .slice((page - 1) * pageSize, page * pageSize)
            .map(([assetId, asset]) => ({
              assetType,
              assetId,
              name: asset.name,
              description: asset.description ?? "",
              thumbnailUrl: asset.thumbnail_url,
              category: asset.category ?? "",
              tags: asset.tags ?? [],
              filesHash: asset.files_hash,
              authors: Object.keys(asset.authors ?? {}),
              downloadCount: asset.download_count ?? 0,
              attributes: asset.attributes ?? {},
              dimensions: asset.dimensions,
              polycount: asset.polycount,
              maxResolution: asset.max_resolution,
            }));
          sendJson(response, 200, {
            ok: true,
            items,
            page,
            pageSize,
            total: matches.length,
          });
        } catch (error) {
          sendJson(response, 502, {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Poly Haven catalog unavailable.",
          });
        }
        return;
      }

      if (
        request.url === "/api/advanced-studio2/polyhaven/download" &&
        request.method === "POST"
      ) {
        try {
          const body = JSON.parse(await readBody(request)) as {
            assetId?: string;
            assetType?: PolyHavenAssetType;
          };
          const assetId = body.assetId ?? "";
          const assetType = body.assetType ?? "textures";
          if (!/^[a-zA-Z0-9_-]{1,100}$/.test(assetId)) {
            throw new Error("Invalid Poly Haven asset ID.");
          }
          if (!["textures", "hdris", "models"].includes(assetType)) {
            throw new Error("Invalid Poly Haven asset type.");
          }
          const catalog = await getPolyHavenCatalog(assetType);
          const asset = catalog[assetId];
          if (!asset || asset.type !== polyHavenTypeCodes[assetType]) {
            throw new Error("Poly Haven asset not found.");
          }
          const filesResponse = await fetch(
            `https://api.polyhaven.com/files/${encodeURIComponent(assetId)}`,
            {headers: polyHavenHeaders},
          );
          if (!filesResponse.ok) {
            throw new Error(
              `Poly Haven file request failed (${filesResponse.status}).`,
            );
          }
          const files = (await filesResponse.json()) as Record<string, any>;
          const assetDirectory = path.resolve(
            "public",
            "advanced-studio2-assets",
            "polyhaven",
          );
          let selection: Record<string, unknown>;
          let manifestPath: string;

          if (assetType === "textures") {
            const source = files.Diffuse?.["2k"]?.jpg as
              | PolyHavenFile
              | undefined;
            if (!source?.url || !source.md5) {
              throw new Error("This texture has no supported 2K diffuse JPG.");
            }
            const fileName = `${assetId}-${source.md5}.jpg`;
            const filePath = path.join(assetDirectory, fileName);
            const sourceUrl = await downloadPolyHavenFile({
              source,
              filePath,
              allowedRoot: "Textures",
              maxBytes: 15 * 1024 * 1024,
            });
            selection = {
              assetType,
              assetId,
              name: asset.name,
              localSrc: `/advanced-studio2-assets/polyhaven/${fileName}`,
              localFiles: [
                `/advanced-studio2-assets/polyhaven/${fileName}`,
              ],
              thumbnailUrl: asset.thumbnail_url,
              filesHash: asset.files_hash,
              resolution: "2k",
              mapType: "Diffuse",
              format: "jpg",
              sourceUrl: sourceUrl.href,
              authors: Object.keys(asset.authors ?? {}),
            };
            manifestPath = path.join(
              assetDirectory,
              `${assetId}-${source.md5}.json`,
            );
          } else if (assetType === "hdris") {
            const source = files.hdri?.["1k"]?.hdr as
              | PolyHavenFile
              | undefined;
            if (!source?.url || !source.md5) {
              throw new Error("This HDRI has no supported 1K HDR file.");
            }
            const fileName = `${assetId}-${source.md5}.hdr`;
            const filePath = path.join(assetDirectory, fileName);
            const sourceUrl = await downloadPolyHavenFile({
              source,
              filePath,
              allowedRoot: "HDRIs",
              maxBytes: 20 * 1024 * 1024,
            });
            selection = {
              assetType,
              assetId,
              name: asset.name,
              localSrc: `/advanced-studio2-assets/polyhaven/${fileName}`,
              localFiles: [
                `/advanced-studio2-assets/polyhaven/${fileName}`,
              ],
              thumbnailUrl: asset.thumbnail_url,
              filesHash: asset.files_hash,
              resolution: "1k",
              format: "hdr",
              sourceUrl: sourceUrl.href,
              authors: Object.keys(asset.authors ?? {}),
            };
            manifestPath = path.join(
              assetDirectory,
              `${assetId}-${source.md5}.json`,
            );
          } else {
            const source = files.gltf?.["1k"]?.gltf as
              | (PolyHavenFile & {
                  include?: Record<string, PolyHavenFile>;
                })
              | undefined;
            if (!source?.url || !source.md5) {
              throw new Error("This model has no supported 1K GLTF file.");
            }
            const modelDirectory = path.join(
              assetDirectory,
              "models",
              assetId,
            );
            const sourceFileName = path.basename(
              decodeURIComponent(new URL(source.url).pathname),
            );
            const localFiles: string[] = [];
            const sourceUrl = await downloadPolyHavenFile({
              source,
              filePath: path.join(modelDirectory, sourceFileName),
              allowedRoot: "Models",
              maxBytes: 50 * 1024 * 1024,
            });
            localFiles.push(
              `/advanced-studio2-assets/polyhaven/models/${assetId}/${sourceFileName}`,
            );
            for (const [relativePath, dependency] of Object.entries(
              source.include ?? {},
            )) {
              const dependencyPath = path.resolve(
                modelDirectory,
                relativePath,
              );
              if (
                !dependencyPath.startsWith(`${modelDirectory}${path.sep}`)
              ) {
                throw new Error(
                  "Poly Haven returned an invalid model dependency path.",
                );
              }
              await downloadPolyHavenFile({
                source: dependency,
                filePath: dependencyPath,
                allowedRoot: "Models",
                maxBytes: 50 * 1024 * 1024,
              });
              localFiles.push(
                `/advanced-studio2-assets/polyhaven/models/${assetId}/${relativePath}`,
              );
            }
            selection = {
              assetType,
              assetId,
              name: asset.name,
              localSrc: localFiles[0],
              localFiles,
              thumbnailUrl: asset.thumbnail_url,
              filesHash: asset.files_hash,
              resolution: "1k",
              format: "gltf",
              sourceUrl: sourceUrl.href,
              authors: Object.keys(asset.authors ?? {}),
            };
            manifestPath = path.join(modelDirectory, "polyhaven.json");
          }

          fs.writeFileSync(
            manifestPath,
            JSON.stringify(
              {
                ...selection,
                downloadedAt: new Date().toISOString(),
                license: "CC0-1.0",
                licenseUrl: "https://polyhaven.com/license",
              },
              null,
              2,
            ),
          );
          sendJson(response, 200, {ok: true, selection});
        } catch (error) {
          sendJson(response, 422, {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Poly Haven asset download failed.",
          });
        }
        return;
      }

      if (
        request.url?.startsWith("/api/export-advanced/") &&
        request.method === "GET"
      ) {
        const formatId = request.url
          .replace("/api/export-advanced/", "")
          .split("?")[0];
        if (!["portrait", "square", "vertical"].includes(formatId)) {
          response.statusCode = 400;
          response.end("Invalid Advanced Studio format.");
          return;
        }

        const fileName = `advanced-studio-${formatId}.mp4`;
        const filePath = path.resolve("output", fileName);
        if (!fs.existsSync(filePath)) {
          response.statusCode = 404;
          response.end("Export not found.");
          return;
        }

        response.statusCode = 200;
        response.setHeader("Content-Type", "video/mp4");
        response.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`,
        );
        response.setHeader("Content-Length", fs.statSync(filePath).size);
        fs.createReadStream(filePath).pipe(response);
        return;
      }

      if (
        request.url?.startsWith("/api/export-advanced2/") &&
        request.method === "GET"
      ) {
        const formatId = request.url
          .replace("/api/export-advanced2/", "")
          .split("?")[0];
        if (!["portrait", "square", "vertical"].includes(formatId)) {
          response.statusCode = 400;
          response.end("Invalid Advanced Studio 2 format.");
          return;
        }
        const fileName = `advanced-studio2-${formatId}.mp4`;
        const filePath = path.resolve("output", fileName);
        if (!fs.existsSync(filePath)) {
          response.statusCode = 404;
          response.end("Export not found.");
          return;
        }
        response.statusCode = 200;
        response.setHeader("Content-Type", "video/mp4");
        response.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`,
        );
        response.setHeader("Content-Length", fs.statSync(filePath).size);
        fs.createReadStream(filePath).pipe(response);
        return;
      }

      if (
        request.url === "/api/advanced-studio2/remove-background" &&
        request.method === "POST"
      ) {
        let temporaryDirectory = "";
        try {
          const contentType = request.headers["content-type"] ?? "";
          if (!["image/png", "image/jpeg", "image/webp"].includes(contentType)) {
            throw new Error("Choose a PNG, JPEG, or WebP product image.");
          }

          const image = await readBinaryBody(request, 20 * 1024 * 1024);
          if (image.length === 0) {
            throw new Error("The uploaded product image is empty.");
          }

          temporaryDirectory = fs.mkdtempSync(
            path.join(process.cwd(), ".advanced-studio2-background-"),
          );
          const extension =
            contentType === "image/png"
              ? "png"
              : contentType === "image/webp"
                ? "webp"
                : "jpg";
          const inputPath = path.join(temporaryDirectory, `input.${extension}`);
          const outputPath = path.join(temporaryDirectory, "product.png");
          fs.writeFileSync(inputPath, image);

          // AS5 QUALITY DEBUG:
          // preserve the exact original upload before Vision touches it.
          fs.mkdirSync(path.resolve("debug"), {recursive: true});
          fs.writeFileSync(
            path.resolve(`debug/original-upload.${extension}`),
            image,
          );

          const result = await runProcess("xcrun", [
            "swift",
            path.resolve("scripts/remove-product-background.swift"),
            inputPath,
            outputPath,
          ]);
          if (result.code !== 0 || !fs.existsSync(outputPath)) {
            throw new Error(
              result.stderr.trim() ||
                "Apple Vision could not remove this image background.",
            );
          }

          const output = fs.readFileSync(outputPath);

          // Preserve the exact processed cutout sent to AS5.
          fs.mkdirSync(path.resolve("debug"), {recursive: true});
          fs.writeFileSync(
            path.resolve("debug/processed-product.png"),
            output,
          );

          // DEBUG: keep the latest Vision cutout for inspection.
          fs.mkdirSync(path.resolve("debug"), {recursive: true});
          fs.writeFileSync(
            path.resolve("debug/vision-output.png"),
            output,
          );

          response.statusCode = 200;
          response.setHeader("Content-Type", "image/png");
          response.setHeader("Content-Length", output.length);
          response.end(output);
        } catch (error) {
          response.statusCode = 422;
          response.setHeader("Content-Type", "application/json");
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Background removal failed.",
            }),
          );
        } finally {
          if (temporaryDirectory) {
            fs.rmSync(temporaryDirectory, {recursive: true, force: true});
          }
        }
        return;
      }

      if (request.url === "/api/project" && request.method === "POST") {
        try {
          const body = await readBody(request);
          const project = JSON.parse(body);

          fs.mkdirSync(path.resolve("public"), {recursive: true});
          fs.writeFileSync(
            path.resolve("public/project.json"),
            JSON.stringify(project, null, 2),
          );

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ok: true}));
        } catch (error) {
          response.statusCode = 500;
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error ? error.message : "Save failed",
            }),
          );
        }

        return;
      }

      if (request.url === "/api/render" && request.method === "POST") {
        try {
          const body = await readBody(request);
          const project = JSON.parse(body);

          fs.mkdirSync(path.resolve("public"), {recursive: true});
          fs.mkdirSync(path.resolve("output"), {recursive: true});

          fs.writeFileSync(
            path.resolve("public/project.json"),
            JSON.stringify(project, null, 2),
          );

          const child = spawn(
            "npx",
            [
              "remotion",
              "render",
              "src/index.ts",
              "ExplainerVideo",
              "output/explainer.mp4",
              "--props=public/project.json",
              "--overwrite",
            ],
            {
              cwd: process.cwd(),
              stdio: "inherit",
              shell: false,
            },
          );

          child.on("close", (code) => {
            response.statusCode = code === 0 ? 200 : 500;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({
                ok: code === 0,
                output: "output/explainer.mp4",
              }),
            );
          });

          child.on("error", (error) => {
            response.statusCode = 500;
            response.end(
              JSON.stringify({
                ok: false,
                error: error.message,
              }),
            );
          });
        } catch (error) {
          response.statusCode = 500;
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error ? error.message : "Render failed",
            }),
          );
        }

        return;
      }

      if (request.url === "/api/render-advanced" && request.method === "POST") {
        try {
          const body = await readBody(request);
          const props = JSON.parse(body);
          const formatId = props.formatId ?? "portrait";
          const compositionId =
            formatId === "square"
              ? "AdvancedStudioIntegrationProofSquare"
              : formatId === "vertical"
                ? "AdvancedStudioIntegrationProofVertical"
                : "AdvancedStudioIntegrationProofPortrait";
          if (!Array.isArray(props.project?.scenes)) {
            throw new Error("Advanced Studio project scenes must be an array.");
          }
          const durationFrames = getAdvancedStudioProjectDuration(props.project);

          fs.mkdirSync(path.resolve("public"), {recursive: true});
          fs.mkdirSync(path.resolve("output"), {recursive: true});

          fs.writeFileSync(
            path.resolve("output/advanced-project.json"),
            JSON.stringify(props, null, 2),
          );

          const child = spawn(
            "npx",
            [
              "remotion",
              "render",
              "src/index.ts",
              compositionId,
              `output/advanced-studio-${formatId}.mp4`,
              "--props=output/advanced-project.json",
              `--duration=${durationFrames}`,
              "--overwrite",
            ],
            {
              cwd: process.cwd(),
              stdio: "inherit",
              shell: false,
            },
          );

          child.on("close", (code) => {
            response.statusCode = code === 0 ? 200 : 500;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({
                ok: code === 0,
                output: `output/advanced-studio-${formatId}.mp4`,
                downloadUrl: `/api/export-advanced/${formatId}`,
              }),
            );
          });

          child.on("error", (error) => {
            response.statusCode = 500;
            response.end(
              JSON.stringify({
                ok: false,
                error: error.message,
              }),
            );
          });
        } catch (error) {
          response.statusCode = 500;
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error ? error.message : "Render failed",
            }),
          );
        }

        return;
      }

      if (request.url === "/api/render-advanced2" && request.method === "POST") {
        try {
          const body = await readBody(request);
          const props = JSON.parse(body);
          const formatId = props.formatId ?? "portrait";
          if (!["portrait", "square", "vertical"].includes(formatId)) {
            throw new Error("Invalid Advanced Studio 2 format.");
          }
          const durationInFrames = getProductVideoDuration(props.templateId);
          const batch = getProductTemplate(props.templateId).batch;
          const compositionPrefix =
            batch === 19
              ? "AdvancedStudio2ProductBatch19"
              : batch === 18
              ? "AdvancedStudio2ProductBatch18"
              : batch === 17
              ? "AdvancedStudio2ProductBatch17"
              : batch === 16
              ? "AdvancedStudio2ProductBatch16"
              : batch === 15
              ? "AdvancedStudio2ProductBatch15"
              : batch === 14
              ? "AdvancedStudio2ProductBatch14"
              : batch === 13
              ? "AdvancedStudio2ProductBatch13"
              : batch === 12
              ? "AdvancedStudio2ProductBatch12"
              : batch === 11
              ? "AdvancedStudio2ProductBatch11"
              : batch === 10
              ? "AdvancedStudio2ProductBatch10"
              : batch === 9
              ? "AdvancedStudio2ProductBatch9"
              : batch === 8
              ? "AdvancedStudio2ProductBatch8"
              : batch === 7
              ? "AdvancedStudio2ProductBatch7"
              : batch === 6
              ? "AdvancedStudio2ProductBatch6"
              : batch === 5
              ? "AdvancedStudio2ProductBatch5"
              : batch === 4
                ? "AdvancedStudio2ProductBatch4"
              : batch === 3
                ? "AdvancedStudio2ProductBatch3"
              : batch === 2
                ? "AdvancedStudio2ProductBatch2"
                : "AdvancedStudio2Product";
          const compositionId =
            formatId === "square"
              ? `${compositionPrefix}Square`
              : formatId === "vertical"
                ? `${compositionPrefix}Vertical`
                : `${compositionPrefix}Portrait`;
          fs.mkdirSync(path.resolve("output"), {recursive: true});
          const propsPath = path.resolve("output/advanced-studio2-project.json");
          fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));
          const child = spawn(
            "npx",
            [
              "remotion",
              "render",
              "src/index.ts",
              compositionId,
              `output/advanced-studio2-${formatId}.mp4`,
              "--props=output/advanced-studio2-project.json",
              `--duration=${durationInFrames}`,
              "--overwrite",
              ...(batch === 19 ? ["--gl=angle"] : []),
            ],
            {
              cwd: process.cwd(),
              stdio: "inherit",
              shell: false,
            },
          );
          child.on("close", (code) => {
            response.statusCode = code === 0 ? 200 : 500;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({
                ok: code === 0,
                downloadUrl: `/api/export-advanced2/${formatId}`,
                error: code === 0 ? undefined : "Remotion render failed.",
              }),
            );
          });
          child.on("error", (error) => {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ok: false, error: error.message}));
          });
        } catch (error) {
          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error ? error.message : "Render failed.",
            }),
          );
        }
        return;
      }

      next();
    });
  },
});

export default defineConfig({
  root: "studio",
  plugins: [react(), studioApi()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "studio/index.html"),
        advanced: path.resolve(__dirname, "studio/advanced-studio.html"),
        advanced2: path.resolve(__dirname, "studio/advanced-studio2.html"),
      },
    },
  },
});

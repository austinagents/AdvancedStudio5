import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import * as THREE from "three";

import {
  RoundedBoxGeometry,
} from "three-stdlib";

import {
  PT2Canvas,
  PT2Product,
} from "./ProductTemplates2Runtime";

import {
  createPT2ExactProductMaterial,
  getPT2Timing,
  smooth01,
} from "./ProductTemplates2Core";

type Props = {
  imageSrc: string;
};

type ProductCell = {
  x: number;
  y: number;

  u: number;
  v: number;

  alpha: number;

  red: number;
  green: number;
  blue: number;

  luma: number;
  contrast: number;
  edge: number;

  depth: number;

  phase: number;
  speed: number;

  rod: boolean;
};

type VolumeCell = {
  source: ProductCell;

  /*
   * Real physical Z coordinate.
   * This is not a displacement of a 2D surface.
   */
  z: number;

  /*
   * -1 at back of local stack,
   * +1 at front of local stack.
   */
  zNormalized: number;

  zLayer: number;
};

const clamp01 = (
  value: number,
) =>
  THREE.MathUtils.clamp(
    value,
    0,
    1,
  );

const fract = (
  value: number,
) =>
  value -
  Math.floor(
    value,
  );

const hash2 = (
  x: number,
  y: number,
) =>
  fract(
    Math.sin(
      x * 127.1 +
      y * 311.7,
    ) *
      43758.5453123,
  );

const fade = (
  t: number,
) =>
  t *
  t *
  (
    3 -
    2 * t
  );

const valueNoise2 = (
  x: number,
  y: number,
) => {
  const ix =
    Math.floor(
      x,
    );

  const iy =
    Math.floor(
      y,
    );

  const fx =
    fract(
      x,
    );

  const fy =
    fract(
      y,
    );

  const a =
    hash2(
      ix,
      iy,
    );

  const b =
    hash2(
      ix + 1,
      iy,
    );

  const c =
    hash2(
      ix,
      iy + 1,
    );

  const d =
    hash2(
      ix + 1,
      iy + 1,
    );

  const ux =
    fade(
      fx,
    );

  const uy =
    fade(
      fy,
    );

  const ab =
    THREE.MathUtils.lerp(
      a,
      b,
      ux,
    );

  const cd =
    THREE.MathUtils.lerp(
      c,
      d,
      ux,
    );

  return THREE.MathUtils.lerp(
    ab,
    cd,
    uy,
  );
};

const fieldNoise = (
  x: number,
  y: number,
) => {
  const n1 =
    valueNoise2(
      x,
      y,
    );

  const n2 =
    valueNoise2(
      x * 0.47 + 17.3,
      y * 0.47 - 9.1,
    );

  return (
    n1 * 0.72 +
    n2 * 0.28
  );
};

const sampleChannel = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  u: number,
  v: number,
  channel: number,
) => {
  const x =
    THREE.MathUtils.clamp(
      Math.round(
        u *
          (
            width - 1
          ),
      ),
      0,
      width - 1,
    );

  const y =
    THREE.MathUtils.clamp(
      Math.round(
        v *
          (
            height - 1
          ),
      ),
      0,
      height - 1,
    );

  return (
    pixels[
      (
        y * width +
        x
      ) *
        4 +
      channel
    ] /
    255
  );
};

const sampleLuma = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  u: number,
  v: number,
) => {
  const r =
    sampleChannel(
      pixels,
      width,
      height,
      u,
      v,
      0,
    );

  const g =
    sampleChannel(
      pixels,
      width,
      height,
      u,
      v,
      1,
    );

  const b =
    sampleChannel(
      pixels,
      width,
      height,
      u,
      v,
      2,
    );

  return (
    r * 0.2126 +
    g * 0.7152 +
    b * 0.0722
  );
};

const BeveledVolumeScene:
  React.FC<Props> = ({
    imageSrc,
  }) => {
    const frame =
      useCurrentFrame();

    const {
      fps,
      width,
      height,
    } =
      useVideoConfig();

    const timing =
      getPT2Timing(
        frame,
        fps,
      );

    return (
      <PT2Canvas
        imageSrc={
          imageSrc
        }
        width={
          width
        }
        height={
          height
        }
      >
        {({
          texture,
          image,
          product,
        }) => {
          const analysis =
            useMemo(
              () => {
                const canvas =
                  document.createElement(
                    "canvas",
                  );

                canvas.width =
                  image.naturalWidth ||
                  image.width;

                canvas.height =
                  image.naturalHeight ||
                  image.height;

                const context =
                  canvas.getContext(
                    "2d",
                    {
                      willReadFrequently:
                        true,
                    },
                  );

                if (!context) {
                  throw new Error(
                    "Unable to analyze PT2 product.",
                  );
                }

                context.clearRect(
                  0,
                  0,
                  canvas.width,
                  canvas.height,
                );

                context.drawImage(
                  image,
                  0,
                  0,
                  canvas.width,
                  canvas.height,
                );

                const imageData =
                  context.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                  );

                const pixels =
                  imageData.data;

                /*
                 * Adaptive lattice:
                 *
                 * Tall products get more rows.
                 * Width follows actual product aspect.
                 *
                 * This gives us approximately 900–1800
                 * visible voxels instead of an arbitrary
                 * fixed cube cloud.
                 */
                const rows =
                  66;

                const aspect =
                  product.visibleWidth /
                  product.visibleHeight;

                const columns =
                  Math.max(
                    18,
                    Math.round(
                      rows *
                        aspect,
                    ),
                  );

                const cellWidth =
                  product.visibleWidth /
                  columns;

                const cellHeight =
                  product.visibleHeight /
                  rows;

                const cells:
                  ProductCell[] =
                  [];

                for (
                  let row = 0;
                  row < rows;
                  row++
                ) {
                  for (
                    let column = 0;
                    column < columns;
                    column++
                  ) {
                    const u =
                      (
                        column +
                        0.5
                      ) /
                      columns;

                    const v =
                      (
                        row +
                        0.5
                      ) /
                      rows;

                    /*
                     * Convert product-relative UV into
                     * source-image coordinates.
                     */
                    const sourceX =
                      product.minX +
                      u *
                        (
                          product.maxX -
                          product.minX
                        );

                    const sourceY =
                      product.minY +
                      v *
                        (
                          product.maxY -
                          product.minY
                        );

                    const sourceU =
                      sourceX /
                      Math.max(
                        1,
                        imageData.width - 1,
                      );

                    const sourceV =
                      sourceY /
                      Math.max(
                        1,
                        imageData.height - 1,
                      );

                    const alpha =
                      sampleChannel(
                        pixels,
                        imageData.width,
                        imageData.height,
                        sourceU,
                        sourceV,
                        3,
                      );

                    /*
                     * Product silhouette decides whether
                     * this voxel exists at all.
                     */
                    if (
                      alpha <
                      0.08
                    ) {
                      continue;
                    }

                    const red =
                      sampleChannel(
                        pixels,
                        imageData.width,
                        imageData.height,
                        sourceU,
                        sourceV,
                        0,
                      );

                    const green =
                      sampleChannel(
                        pixels,
                        imageData.width,
                        imageData.height,
                        sourceU,
                        sourceV,
                        1,
                      );

                    const blue =
                      sampleChannel(
                        pixels,
                        imageData.width,
                        imageData.height,
                        sourceU,
                        sourceV,
                        2,
                      );

                    const luma =
                      (
                        red *
                          0.2126 +
                        green *
                          0.7152 +
                        blue *
                          0.0722
                      );

                    const du =
                      2 /
                      imageData.width;

                    const dv =
                      2 /
                      imageData.height;

                    const lumaLeft =
                      sampleLuma(
                        pixels,
                        imageData.width,
                        imageData.height,
                        sourceU -
                          du,
                        sourceV,
                      );

                    const lumaRight =
                      sampleLuma(
                        pixels,
                        imageData.width,
                        imageData.height,
                        sourceU +
                          du,
                        sourceV,
                      );

                    const lumaUp =
                      sampleLuma(
                        pixels,
                        imageData.width,
                        imageData.height,
                        sourceU,
                        sourceV -
                          dv,
                      );

                    const lumaDown =
                      sampleLuma(
                        pixels,
                        imageData.width,
                        imageData.height,
                        sourceU,
                        sourceV +
                          dv,
                      );

                    const gradientX =
                      Math.abs(
                        lumaRight -
                        lumaLeft,
                      );

                    const gradientY =
                      Math.abs(
                        lumaDown -
                        lumaUp,
                      );

                    const edge =
                      clamp01(
                        Math.sqrt(
                          gradientX *
                            gradientX +
                          gradientY *
                            gradientY,
                        ) *
                          4.5,
                      );

                    const localAverage =
                      (
                        lumaLeft +
                        lumaRight +
                        lumaUp +
                        lumaDown
                      ) /
                      4;

                    const contrast =
                      clamp01(
                        Math.abs(
                          luma -
                          localAverage,
                        ) *
                          5,
                      );

                    /*
                     * Depth is derived from the actual
                     * product image:
                     *
                     * dark/light structure +
                     * contrast +
                     * meaningful edges.
                     */
                    const depth =
                      0.22 +
                      (
                        1 -
                        luma
                      ) *
                        0.36 +
                      contrast *
                        0.32 +
                      edge *
                        0.28;

                    const worldX =
                      product.offsetX +
                      (
                        u -
                        0.5
                      ) *
                        product.visibleWidth;

                    const worldY =
                      product.offsetY +
                      (
                        0.5 -
                        v
                      ) *
                        product.visibleHeight;

                    const deterministic =
                      hash2(
                        column +
                          11,
                        row +
                          37,
                      );

                    /*
                     * Rods are deliberately biased toward
                     * actual product edge / contrast data.
                     */
                    const rodScore =
                      edge *
                        0.72 +
                      contrast *
                        0.28;

                    const rod =
                      rodScore >
                        0.34 &&
                      deterministic >
                        0.72;

                    cells.push({
                      x:
                        worldX,
                      y:
                        worldY,

                      u,
                      v,

                      alpha,

                      red,
                      green,
                      blue,

                      luma,
                      contrast,
                      edge,

                      depth,

                      phase:
                        deterministic *
                        Math.PI *
                        2,

                      speed:
                        0.82 +
                        deterministic *
                          0.36,

                      rod,
                    });
                  }
                }

                return {
                  cells,
                  cellWidth,
                  cellHeight,
                  rows,
                  columns,
                };
              },
              [
                image,
                product,
              ],
            );

          const cubeGeometry =
            useMemo(
              () =>
                new RoundedBoxGeometry(
                  analysis.cellWidth *
                    0.91,
                  analysis.cellHeight *
                    0.91,
                  Math.min(
                    analysis.cellWidth,
                    analysis.cellHeight,
                  ) *
                    0.84,
                  2,
                  Math.min(
                    analysis.cellWidth,
                    analysis.cellHeight,
                  ) *
                    0.13,
                ),
              [
                analysis.cellWidth,
                analysis.cellHeight,
              ],
            );

          const cubeMaterial =
            useMemo(
              () =>
                new THREE.MeshStandardMaterial({
                  /*
                   * Neutral white base:
                   * actual color now comes from each
                   * product-derived voxel.
                   */
                  color:
                    new THREE.Color(
                      "#ffffff",
                    ),
                  roughness:
                    0.3,
                  metalness:
                    0.12,
                }),
              [],
            );

          const rodGeometry =
            useMemo(
              () =>
                new THREE.CylinderGeometry(
                  0.012,
                  0.012,

                  /*
                   * Keep rods completely inside the
                   * product's vertical bounds.
                   *
                   * Previous value was 1.2x product height,
                   * which intentionally extended them above
                   * and below the product.
                   */
                  product.visibleHeight *
                    0.62,

                  8,
                ),
              [
                product.visibleHeight,
              ],
            );

          const rodMaterial =
            useMemo(
              () =>
                new THREE.MeshStandardMaterial({
                  color:
                    new THREE.Color(
                      "#25272d",
                    ),
                  roughness:
                    0.24,
                  metalness:
                    0.34,
                }),
              [],
            );

          /*
           * TRUE PRODUCT FORMATION SURFACE
           *
           * This is NOT a hidden exact-product plane.
           *
           * The product image is mapped across a tessellated
           * surface. Each quad owns its exact source UV region.
           *
           * During formation the quads occupy 3D space.
           * By 6 seconds they physically become one continuous,
           * flat, exact product surface.
           */
          const formationGeometry =
            useMemo(
              () => {
                const geometry =
                  new THREE.BufferGeometry();

                const positions:
                  number[] =
                  [];

                const uvs:
                  number[] =
                  [];

                const indices:
                  number[] =
                  [];

                const {
                  rows,
                  columns,
                } =
                  analysis;

                for (
                  let row = 0;
                  row < rows;
                  row++
                ) {
                  for (
                    let column = 0;
                    column < columns;
                    column++
                  ) {
                    const u0 =
                      column /
                      columns;

                    const u1 =
                      (
                        column +
                        1
                      ) /
                      columns;

                    const v0 =
                      row /
                      rows;

                    const v1 =
                      (
                        row +
                        1
                      ) /
                      rows;

                    /*
                     * Exact source-image UV boundaries for the
                     * visible product crop.
                     */
                    const sourceU0 =
                      (
                        product.minX +
                        u0 *
                          (
                            product.maxX -
                            product.minX +
                            1
                          )
                      ) /
                      product.imageWidth;

                    const sourceU1 =
                      (
                        product.minX +
                        u1 *
                          (
                            product.maxX -
                            product.minX +
                            1
                          )
                      ) /
                      product.imageWidth;

                    const sourceV0 =
                      (
                        product.minY +
                        v0 *
                          (
                            product.maxY -
                            product.minY +
                            1
                          )
                      ) /
                      product.imageHeight;

                    const sourceV1 =
                      (
                        product.minY +
                        v1 *
                          (
                            product.maxY -
                            product.minY +
                            1
                          )
                      ) /
                      product.imageHeight;

                    const base =
                      positions.length /
                      3;

                    /*
                     * Positions are updated every frame.
                     * Start collapsed at each cell center.
                     */
                    positions.push(
                      0, 0, 0,
                      0, 0, 0,
                      0, 0, 0,
                      0, 0, 0,
                    );

                    /*
                     * Three.js texture V is bottom-up while
                     * source image coordinates are top-down.
                     */
                    uvs.push(
                      sourceU0,
                      1 -
                        sourceV1,

                      sourceU1,
                      1 -
                        sourceV1,

                      sourceU1,
                      1 -
                        sourceV0,

                      sourceU0,
                      1 -
                        sourceV0,
                    );

                    indices.push(
                      base,
                      base + 1,
                      base + 2,

                      base,
                      base + 2,
                      base + 3,
                    );
                  }
                }

                geometry.setAttribute(
                  "position",
                  new THREE.Float32BufferAttribute(
                    positions,
                    3,
                  ),
                );

                geometry.setAttribute(
                  "uv",
                  new THREE.Float32BufferAttribute(
                    uvs,
                    2,
                  ),
                );

                geometry.setIndex(
                  indices,
                );

                return geometry;
              },
              [
                analysis,
                product.imageHeight,
                product.imageWidth,
                product.maxX,
                product.maxY,
                product.minX,
                product.minY,
              ],
            );

          const formationMaterial =
            useMemo(
              () =>
                createPT2ExactProductMaterial(
                  texture,
                ),
              [
                texture,
              ],
            );

          const formationRef =
            useRef<
              THREE.Mesh
            >(
              null,
            );

          /*
           * TRUE 3D BEVEL VOLUME
           *
           * Each valid product XY cell becomes a local stack
           * of independent beveled cubes through Z.
           *
           * This mirrors the important Geometry Nodes idea:
           *
           * product footprint
           * -> volume points
           * -> cube instances
           *
           * rather than:
           *
           * product footprint
           * -> one cube
           * -> fake Z displacement.
           */
          const volumeCells =
            useMemo(
              () => {
                const result:
                  VolumeCell[] =
                  [];

                const spacing =
                  Math.min(
                    analysis.cellWidth,
                    analysis.cellHeight,
                  ) *
                  0.72;

                for (
                  const source of
                  analysis.cells
                ) {
                  /*
                   * Product information controls local
                   * physical thickness, but thickness is
                   * expressed as NUMBER OF REAL CUBES.
                   *
                   * Minimum: 2
                   * Typical: 3–5
                   * Strong regions: up to 7
                   */
                  const depthSignal =
                    clamp01(
                      source.depth *
                        0.72 +
                      source.contrast *
                        0.18 +
                      source.edge *
                        0.1,
                    );

                  let layerCount =
                    THREE.MathUtils.clamp(
                      2 +
                        Math.round(
                          depthSignal *
                            4,
                        ),
                      2,
                      6,
                    );

                  if (
                    source.edge +
                      source.contrast >
                    1.05
                  ) {
                    layerCount =
                      7;
                  }

                  const center =
                    (
                      layerCount -
                      1
                    ) /
                    2;

                  for (
                    let layer = 0;
                    layer <
                    layerCount;
                    layer++
                  ) {
                    const centeredLayer =
                      layer -
                      center;

                    const denominator =
                      Math.max(
                        1,
                        center,
                      );

                    result.push({
                      source,

                      z:
                        centeredLayer *
                        spacing,

                      zNormalized:
                        centeredLayer /
                        denominator,

                      zLayer:
                        layer,
                    });
                  }
                }

                return result;
              },
              [
                analysis.cellHeight,
                analysis.cellWidth,
                analysis.cells,
              ],
            );

          const cubeRef =
            useRef<
              THREE.InstancedMesh
            >(
              null,
            );

          const rods =
            useMemo(
              () =>
                analysis.cells.filter(
                  (
                    cell,
                  ) =>
                    cell.rod,
                ),
              [
                analysis.cells,
              ],
            );

          /*
           * PRODUCT-DERIVED ROD BOUNDS
           *
           * No global height percentages.
           *
           * Each rod uses the ACTUAL highest and lowest
           * product bevel cells in its own X/u column.
           */
          const rodBounds =
            useMemo(
              () =>
                rods.map(
                  (
                    rod,
                  ) => {
                    const columnCells =
                      analysis.cells.filter(
                        (
                          cell,
                        ) =>
                          Math.abs(
                            cell.u -
                            rod.u,
                          ) <
                          0.000001,
                      );

                    let topY =
                      rod.y;

                    let bottomY =
                      rod.y;

                    for (
                      const cell of
                      columnCells
                    ) {
                      if (
                        cell.y >
                        topY
                      ) {
                        topY =
                          cell.y;
                      }

                      if (
                        cell.y <
                        bottomY
                      ) {
                        bottomY =
                          cell.y;
                      }
                    }

                    /*
                     * Push rod endpoints slightly behind
                     * the actual bevel cells so the line
                     * does not visibly protrude through them.
                     */
                    const inset =
                      analysis.cellHeight *
                      1.6;

                    return {
                      rod,
                      topY:
                        topY -
                        inset,
                      bottomY:
                        bottomY +
                        inset,
                    };
                  },
                ),
              [
                analysis.cellHeight,
                analysis.cells,
                rods,
              ],
            );

          const rodRef =
            useRef<
              THREE.InstancedMesh
            >(
              null,
            );

          const dummy =
            useMemo(
              () =>
                new THREE.Object3D(),
              [],
            );

          const voxelColor =
            useMemo(
              () =>
                new THREE.Color(),
              [],
            );

          useLayoutEffect(
            () => {
              if (
                !cubeRef.current
              ) {
                return;
              }

              const seconds =
                timing.seconds;

              const geometryInfluence =
                timing.geometryInfluence;

              for (
                let index = 0;
                index <
                volumeCells.length;
                index++
              ) {
                const volumeCell =
                  volumeCells[
                    index
                  ];

                const cell =
                  volumeCell.source;

                /*
                 * Every physical Z layer inherits the
                 * product color at its XY position.
                 */
                voxelColor.setRGB(
                  cell.red,
                  cell.green,
                  cell.blue,
                );

                voxelColor.convertSRGBToLinear();

                cubeRef.current.setColorAt(
                  index,
                  voxelColor,
                );

                /*
                 * TRUE 3D PROCEDURAL FIELD
                 *
                 * The previous implementation evaluated
                 * noise only from U/V.
                 *
                 * Here Z participates directly in the
                 * coordinate field, so different depth
                 * layers are carved differently while
                 * remaining spatially coherent.
                 */
                const zCoordinate =
                  volumeCell.zNormalized;

                const noiseA =
                  fieldNoise(
                    cell.u *
                      4.1 +
                      zCoordinate *
                        0.82 +
                      seconds *
                        0.34 *
                        cell.speed,

                    cell.v *
                      5.4 -
                      zCoordinate *
                        0.57 -
                      seconds *
                        0.58,
                  );

                const noiseB =
                  fieldNoise(
                    cell.u *
                      2.25 -
                      zCoordinate *
                        0.46 -
                      seconds *
                        0.19 +
                      8.7,

                    cell.v *
                      3.1 +
                      zCoordinate *
                        0.71 +
                      seconds *
                        0.31 -
                      5.4,
                  );

                /*
                 * Third slice reinforces genuine depth
                 * variation without introducing random
                 * per-instance flicker.
                 */
                const noiseZ =
                  fieldNoise(
                    zCoordinate *
                      1.55 +
                      cell.u *
                        1.35 +
                      3.8,

                    zCoordinate *
                      1.2 +
                      cell.v *
                        1.65 -
                      seconds *
                        0.24,
                  );

                const productBias =
                  cell.luma *
                    0.14 -
                  cell.contrast *
                    0.12 -
                  cell.edge *
                    0.1;

                const field =
                  noiseA *
                    0.52 +
                  noiseB *
                    0.28 +
                  noiseZ *
                    0.2 +
                  productBias;

                /*
                 * Moving void cuts THROUGH the physical
                 * volume instead of through one flat sheet.
                 */
                const threshold =
                  0.43 +
                  Math.sin(
                    seconds *
                      0.72 +
                      cell.phase
                  ) *
                    0.025;

                let fieldScale =
                  smooth01(
                    clamp01(
                      (
                        field -
                        threshold
                      ) /
                        0.22,
                    ),
                  );

                /*
                 * Preserve the existing product-end
                 * structural behavior for rod coverage.
                 */
                /*
                 * ROD-OCCLUSION END BANDS
                 *
                 * The previous 12% / 88% zones forced huge
                 * nearly-solid slabs at both ends.
                 *
                 * We only need a thin population of bevels
                 * at the physical product ends to interrupt
                 * the rods visually.
                 *
                 * These cells still participate strongly in
                 * the procedural field. They are NOT caps.
                 */
                const distanceFromEnd =
                  Math.min(
                    cell.v,
                    1 - cell.v,
                  );

                const structuralEndZone =
                  distanceFromEnd <
                  0.055;

                /*
                 * Smoothly strengthen geometry only as we
                 * approach the literal product boundary.
                 *
                 * At 5.5% inward:
                 *   no structural assistance.
                 *
                 * At the actual edge:
                 *   enough geometry survives to hide rods.
                 */
                const endProtection =
                  structuralEndZone
                    ? smooth01(
                        clamp01(
                          1 -
                            distanceFromEnd /
                              0.055,
                        ),
                      )
                    : 0;

                /*
                 * Never turn the end into a solid slab.
                 *
                 * Maximum forced field occupancy at the
                 * literal edge is 42%, falling rapidly to
                 * zero as we move inward.
                 */
                const protectedFieldScale =
                  Math.max(
                    fieldScale,
                    endProtection *
                      0.42,
                  );

                /*
                 * End cells now retain the same ability to
                 * collapse/move as the rest of the volume.
                 *
                 * Only their minimum scale is gently raised
                 * near the literal boundary.
                 */
                const minimumScale =
                  THREE.MathUtils.lerp(
                    0.045,
                    0.22,
                    endProtection,
                  );

                const activeScale =
                  THREE.MathUtils.lerp(
                    minimumScale,
                    1,
                    protectedFieldScale,
                  );

                const finalScale =
                  activeScale *
                  geometryInfluence;

                /*
                 * Small animation is allowed, but real
                 * physical layer position is now the
                 * dominant source of Z depth.
                 */
                const animatedZ =
                  Math.sin(
                    seconds *
                      1.25 +
                      cell.phase +
                      volumeCell.zLayer *
                        0.22,
                  ) *
                  0.035 *
                  timing.phase2 *
                  geometryInfluence;

                const z =
                  volumeCell.z +
                  animatedZ;

                dummy.position.set(
                  cell.x,
                  cell.y,
                  z,
                );

                dummy.rotation.set(
                  timing.phase1 *
                    (
                      cell.edge -
                      0.5
                    ) *
                    0.08,

                  timing.phase2 *
                    (
                      cell.contrast -
                      0.5
                    ) *
                    0.11,

                  0,
                );

                /*
                 * Each instance remains an individual
                 * beveled cube.
                 *
                 * Do NOT stretch Z to fake depth.
                 */
                dummy.scale.set(
                  finalScale,
                  finalScale,
                  Math.max(
                    0.02,
                    finalScale,
                  ),
                );

                dummy.updateMatrix();

                cubeRef.current.setMatrixAt(
                  index,
                  dummy.matrix,
                );
              }

              cubeRef.current.instanceMatrix.needsUpdate =
                true;

              if (
                cubeRef.current.instanceColor
              ) {
                cubeRef.current.instanceColor.needsUpdate =
                  true;
              }
            },
            [
              dummy,
              timing.geometryInfluence,
              timing.phase1,
              timing.phase2,
              timing.seconds,
              volumeCells,
              voxelColor,
            ],
          );

          /*
           * EMBEDDED RODS
           *
           * Rods are intentionally visible ONLY through
           * the middle of the product.
           *
           * They physically stop well before the top and
           * bottom so the existing beveled product field
           * hides both ends.
           *
           * No cap geometry.
           * No terminal meshes.
           */
          /*
           * PRODUCT-DERIVED EMBEDDED RODS
           *
           * Rod placement is derived from the real bevel
           * occupancy of each product column.
           *
           * No hard-coded vertical percentage.
           */
          useLayoutEffect(
            () => {
              if (
                !rodRef.current
              ) {
                return;
              }

              const rodInfluence =
                timing.geometryInfluence;

              const geometryHeight =
                (
                  rodGeometry.parameters &&
                  typeof rodGeometry.parameters.height ===
                    "number"
                )
                  ? rodGeometry.parameters.height
                  : 1;

              for (
                let index = 0;
                index <
                rodBounds.length;
                index++
              ) {
                const {
                  rod,
                  topY,
                  bottomY,
                } =
                  rodBounds[
                    index
                  ];

                const span =
                  Math.max(
                    analysis.cellHeight,
                    topY -
                      bottomY,
                  );

                const centerY =
                  (
                    topY +
                    bottomY
                  ) /
                  2;

                const pulse =
                  0.78 +
                  Math.sin(
                    timing.seconds *
                      1.1 +
                    rod.phase,
                  ) *
                    0.08;

                dummy.position.set(
                  rod.x,
                  centerY,

                  /*
                   * Keep rods behind the bevel field.
                   */
                  -0.42,
                );

                dummy.rotation.set(
                  0,
                  0,
                  0,
                );

                dummy.scale.set(
                  rodInfluence *
                    pulse,

                  (
                    span /
                    Math.max(
                      0.0001,
                      geometryHeight,
                    )
                  ) *
                    rodInfluence,

                  rodInfluence *
                    pulse,
                );

                dummy.updateMatrix();

                rodRef.current.setMatrixAt(
                  index,
                  dummy.matrix,
                );
              }

              rodRef.current.instanceMatrix.needsUpdate =
                true;
            },
            [
              analysis.cellHeight,
              dummy,
              rodBounds,
              rodGeometry,
              timing.geometryInfluence,
              timing.seconds,
            ],
          );

          /*
           * GEOMETRY FORMATION
           *
           * No product mesh fades in.
           *
           * Every product cell physically transitions from
           * a displaced 3D quad into its exact final position.
           *
           * At 6 seconds:
           *
           * - displacement = 0
           * - rotation = 0
           * - scale = 1
           * - Z = constant
           * - neighboring cells meet exactly
           *
           * Therefore the geometry itself IS the final product.
           */
          useLayoutEffect(
            () => {
              const position =
                formationGeometry.getAttribute(
                  "position",
                ) as THREE.BufferAttribute;

              const {
                rows,
                columns,
              } =
                analysis;

              const seconds =
                timing.seconds;

              /*
               * Surface begins physically emerging around
               * 3.8 seconds and reaches exact assembly at 6.0.
               */
              const emerge =
                smooth01(
                  clamp01(
                    (
                      seconds -
                      3.8
                    ) /
                      0.8,
                  ),
                );

              const assemble =
                smooth01(
                  clamp01(
                    (
                      seconds -
                      4.45
                    ) /
                      1.55,
                  ),
                );

              let quadIndex =
                0;

              for (
                let row = 0;
                row < rows;
                row++
              ) {
                for (
                  let column = 0;
                  column < columns;
                  column++
                ) {
                  const u0 =
                    column /
                    columns;

                  const u1 =
                    (
                      column +
                      1
                    ) /
                    columns;

                  const v0 =
                    row /
                    rows;

                  const v1 =
                    (
                      row +
                      1
                    ) /
                    rows;

                  const centerU =
                    (
                      u0 +
                      u1
                    ) *
                    0.5;

                  const centerV =
                    (
                      v0 +
                      v1
                    ) *
                    0.5;

                  const finalCenterX =
                    product.offsetX +
                    (
                      centerU -
                      0.5
                    ) *
                      product.visibleWidth;

                  const finalCenterY =
                    product.offsetY +
                    (
                      0.5 -
                      centerV
                    ) *
                      product.visibleHeight;

                  const finalWidth =
                    product.visibleWidth /
                    columns;

                  const finalHeight =
                    product.visibleHeight /
                    rows;

                  const seed =
                    hash2(
                      column +
                        71,
                      row +
                        113,
                    );

                  /*
                   * Same coherent field family as the cube
                   * architecture so the transition feels like
                   * one system rather than a second effect.
                   */
                  const field =
                    fieldNoise(
                      centerU *
                        3.6 +
                        seconds *
                          0.22,
                      centerV *
                        4.8 -
                        seconds *
                          0.37,
                    );

                  const displacementStrength =
                    (
                      1 -
                      assemble
                    );

                  const radialX =
                    (
                      centerU -
                      0.5
                    );

                  const radialY =
                    (
                      0.5 -
                      centerV
                    );

                  const displacedX =
                    finalCenterX +
                    (
                      radialX *
                        0.55 +
                      (
                        field -
                        0.5
                      ) *
                        0.32
                    ) *
                      displacementStrength;

                  const displacedY =
                    finalCenterY +
                    (
                      radialY *
                        0.42 +
                      Math.sin(
                        seed *
                          Math.PI *
                          2 +
                        seconds *
                          1.15
                      ) *
                        0.12
                    ) *
                      displacementStrength;

                  const displacedZ =
                    0.025 +
                    (
                      0.28 +
                      field *
                        0.52 +
                      seed *
                        0.18
                    ) *
                      displacementStrength;

                  /*
                   * Geometry grows into existence physically.
                   * No opacity dissolve.
                   */
                  const cellScale =
                    THREE.MathUtils.lerp(
                      0.08,
                      1,
                      emerge,
                    );

                  /*
                   * Gaps are intentionally present while
                   * assembling, then mathematically reach zero.
                   */
                  const gapScale =
                    THREE.MathUtils.lerp(
                      0.72,
                      1,
                      assemble,
                    );

                  const scale =
                    cellScale *
                    gapScale;

                  const halfW =
                    finalWidth *
                    0.5 *
                    scale;

                  const halfH =
                    finalHeight *
                    0.5 *
                    scale;

                  const rotationX =
                    (
                      seed -
                      0.5
                    ) *
                    1.15 *
                    (
                      1 -
                      assemble
                    );

                  const rotationY =
                    (
                      field -
                      0.5
                    ) *
                    1.2 *
                    (
                      1 -
                      assemble
                    );

                  const cosX =
                    Math.cos(
                      rotationX,
                    );

                  const sinX =
                    Math.sin(
                      rotationX,
                    );

                  const cosY =
                    Math.cos(
                      rotationY,
                    );

                  const sinY =
                    Math.sin(
                      rotationY,
                    );

                  const corners = [
                    [
                      -halfW,
                      -halfH,
                      0,
                    ],
                    [
                      halfW,
                      -halfH,
                      0,
                    ],
                    [
                      halfW,
                      halfH,
                      0,
                    ],
                    [
                      -halfW,
                      halfH,
                      0,
                    ],
                  ] as const;

                  for (
                    let corner = 0;
                    corner < 4;
                    corner++
                  ) {
                    const [
                      localX,
                      localY,
                      localZ,
                    ] =
                      corners[
                        corner
                      ];

                    /*
                     * Rotate around X.
                     */
                    const x1 =
                      localX;

                    const y1 =
                      localY *
                        cosX -
                      localZ *
                        sinX;

                    const z1 =
                      localY *
                        sinX +
                      localZ *
                        cosX;

                    /*
                     * Rotate around Y.
                     */
                    const x2 =
                      x1 *
                        cosY +
                      z1 *
                        sinY;

                    const y2 =
                      y1;

                    const z2 =
                      -x1 *
                        sinY +
                      z1 *
                        cosY;

                    const vertexIndex =
                      quadIndex *
                        4 +
                      corner;

                    position.setXYZ(
                      vertexIndex,
                      displacedX +
                        x2,
                      displacedY +
                        y2,
                      displacedZ +
                        z2,
                    );
                  }

                  quadIndex++;
                }
              }

              position.needsUpdate =
                true;

              formationGeometry.computeBoundingSphere();
            },
            [
              analysis,
              formationGeometry,
              product.offsetX,
              product.offsetY,
              product.visibleHeight,
              product.visibleWidth,
              timing.seconds,
            ],
          );

          return (
            <>
              <ambientLight
                intensity={
                  0.12
                }
              />

              {/*
               * White grazing/back source.
               */}
              <directionalLight
                position={[
                  -4.5,
                  -2.4,
                  5.8,
                ]}
                intensity={
                  5.2
                }
                color={
                  "#ffffff"
                }
              />

              {/*
               * Warm orange accent source.
               */}
              <pointLight
                position={[
                  3.6,
                  2.2,
                  3.8,
                ]}
                intensity={
                  38
                }
                distance={
                  12
                }
                decay={
                  2
                }
                color={
                  "#ff6a18"
                }
              />

              <pointLight
                position={[
                  -2.5,
                  3.6,
                  2.1,
                ]}
                intensity={
                  8
                }
                distance={
                  10
                }
                decay={
                  2
                }
                color={
                  "#fff3df"
                }
              />

              <instancedMesh
                ref={
                  cubeRef
                }
                args={[
                  cubeGeometry,
                  cubeMaterial,
                  volumeCells.length,
                ]}
                frustumCulled={
                  false
                }
              />

              {rods.length >
              0 ? (
                <instancedMesh
                  ref={
                    rodRef
                  }
                  args={[
                    rodGeometry,
                    rodMaterial,
                    rods.length,
                  ]}
                  frustumCulled={
                    false
                  }
                />
              ) : null}

              <mesh
                ref={
                  formationRef
                }
                geometry={
                  formationGeometry
                }
                material={
                  formationMaterial
                }
                frustumCulled={
                  false
                }
              />
            </>
          );
        }}
      </PT2Canvas>
    );
  };

export const BeveledVolumeField:
  React.FC<Props> = (
    props,
  ) => {
    return (
      <BeveledVolumeScene
        {...props}
      />
    );
  };

export default BeveledVolumeField;

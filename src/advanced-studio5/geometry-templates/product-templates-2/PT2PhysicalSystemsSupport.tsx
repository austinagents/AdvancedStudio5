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
  PT2Canvas,
  type PT2LoadedProduct,
} from "./ProductTemplates2Runtime";

import {
  createPT2ExactProductMaterial,
  getPT2Timing,
  smooth01,
} from "./ProductTemplates2Core";

import type {
  ProductAnalysis,
} from "../ProductGeometryCore";

export type PT2Timing =
  ReturnType<typeof getPT2Timing>;

export type ProductFieldCell = {
  row: number;
  column: number;

  u: number;
  v: number;

  x: number;
  y: number;

  red: number;
  green: number;
  blue: number;
  alpha: number;

  luma: number;
  edge: number;
  contrast: number;

  phase: number;
};

export type ProductField = {
  rows: number;
  columns: number;

  cellWidth: number;
  cellHeight: number;

  cells:
    ProductFieldCell[];
};

export type ProductSample = {
  red: number;
  green: number;
  blue: number;
  alpha: number;

  luma: number;
  edge: number;
  contrast: number;
};

export type ProductSampler = {
  sampleVisible: (
    u: number,
    v: number,
  ) => ProductSample;
};

export const clamp01 = (
  value: number,
) =>
  THREE.MathUtils.clamp(
    value,
    0,
    1,
  );

export const fract = (
  value: number,
) =>
  value -
  Math.floor(
    value,
  );

export const hash2 = (
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
  value: number,
) =>
  value *
  value *
  (
    3 -
    2 * value
  );

export const valueNoise2 = (
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

  const ux =
    fade(
      fx,
    );

  const uy =
    fade(
      fy,
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

  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(
      a,
      b,
      ux,
    ),

    THREE.MathUtils.lerp(
      c,
      d,
      ux,
    ),

    uy,
  );
};

const getImageData = (
  image: HTMLImageElement,
) => {
  const width =
    image.naturalWidth ||
    image.width;

  const height =
    image.naturalHeight ||
    image.height;

  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    width;

  canvas.height =
    height;

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
      "Unable to analyze product image.",
    );
  }

  context.clearRect(
    0,
    0,
    width,
    height,
  );

  context.drawImage(
    image,
    0,
    0,
    width,
    height,
  );

  return context.getImageData(
    0,
    0,
    width,
    height,
  );
};

const readChannel = (
  data: ImageData,
  u: number,
  v: number,
  channel: number,
) => {
  const x =
    THREE.MathUtils.clamp(
      Math.round(
        clamp01(u) *
        (
          data.width -
          1
        ),
      ),
      0,
      data.width -
        1,
    );

  const y =
    THREE.MathUtils.clamp(
      Math.round(
        clamp01(v) *
        (
          data.height -
          1
        ),
      ),
      0,
      data.height -
        1,
    );

  return (
    data.data[
      (
        y *
          data.width +
        x
      ) *
        4 +
      channel
    ] /
    255
  );
};

const readLuma = (
  data: ImageData,
  u: number,
  v: number,
) => {
  const red =
    readChannel(
      data,
      u,
      v,
      0,
    );

  const green =
    readChannel(
      data,
      u,
      v,
      1,
    );

  const blue =
    readChannel(
      data,
      u,
      v,
      2,
    );

  return (
    red *
      0.2126 +
    green *
      0.7152 +
    blue *
      0.0722
  );
};

export const createProductSampler = (
  image: HTMLImageElement,
  product: ProductAnalysis,
): ProductSampler => {
  const data =
    getImageData(
      image,
    );

  const sampleVisible = (
    u: number,
    v: number,
  ): ProductSample => {
    const sourceX =
      product.minX +
      clamp01(u) *
      (
        product.maxX -
        product.minX
      );

    const sourceY =
      product.minY +
      clamp01(v) *
      (
        product.maxY -
        product.minY
      );

    const sourceU =
      sourceX /
      Math.max(
        1,
        product.imageWidth -
          1,
      );

    const sourceV =
      sourceY /
      Math.max(
        1,
        product.imageHeight -
          1,
      );

    const red =
      readChannel(
        data,
        sourceU,
        sourceV,
        0,
      );

    const green =
      readChannel(
        data,
        sourceU,
        sourceV,
        1,
      );

    const blue =
      readChannel(
        data,
        sourceU,
        sourceV,
        2,
      );

    const alpha =
      readChannel(
        data,
        sourceU,
        sourceV,
        3,
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
      data.width;

    const dv =
      2 /
      data.height;

    const left =
      readLuma(
        data,
        sourceU -
          du,
        sourceV,
      );

    const right =
      readLuma(
        data,
        sourceU +
          du,
        sourceV,
      );

    const up =
      readLuma(
        data,
        sourceU,
        sourceV -
          dv,
      );

    const down =
      readLuma(
        data,
        sourceU,
        sourceV +
          dv,
      );

    const gx =
      right -
      left;

    const gy =
      down -
      up;

    const edge =
      clamp01(
        Math.sqrt(
          gx *
            gx +
          gy *
            gy,
        ) *
          5.5,
      );

    const average =
      (
        left +
        right +
        up +
        down
      ) /
      4;

    const contrast =
      clamp01(
        Math.abs(
          luma -
          average,
        ) *
          6,
      );

    return {
      red,
      green,
      blue,
      alpha,

      luma,
      edge,
      contrast,
    };
  };

  return {
    sampleVisible,
  };
};

export const buildProductField = (
  image: HTMLImageElement,
  product: ProductAnalysis,
  rows = 54,
): ProductField => {
  const sampler =
    createProductSampler(
      image,
      product,
    );

  const columns =
    Math.max(
      16,
      Math.round(
        rows *
        product.visibleWidth /
        product.visibleHeight,
      ),
    );

  const cellWidth =
    product.visibleWidth /
    columns;

  const cellHeight =
    product.visibleHeight /
    rows;

  const cells:
    ProductFieldCell[] =
    [];

  for (
    let row = 0;
    row <
    rows;
    row++
  ) {
    for (
      let column = 0;
      column <
      columns;
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

      const sample =
        sampler.sampleVisible(
          u,
          v,
        );

      if (
        sample.alpha <
        0.08
      ) {
        continue;
      }

      cells.push({
        row,
        column,

        u,
        v,

        x:
          product.offsetX +
          (
            u -
            0.5
          ) *
          product.visibleWidth,

        y:
          product.offsetY +
          (
            0.5 -
            v
          ) *
          product.visibleHeight,

        ...sample,

        phase:
          hash2(
            column +
              17,
            row +
              43,
          ) *
          Math.PI *
          2,
      });
    }
  }

  return {
    rows,
    columns,

    cellWidth,
    cellHeight,

    cells,
  };
};

/*
 * Product geometry uses EXACT uploaded-product RGB.
 *
 * Unlit MeshBasicMaterial + vertexColors means the
 * environment cannot turn the source green/blue/etc
 * into dark gray through PBR lighting.
 */
export const createExactRGBMaterial =
  () =>
    new THREE.MeshBasicMaterial({
      /*
       * Neutral white base.
       *
       * Uploaded product RGB comes from
       * InstancedMesh.setColorAt() / instanceColor.
       *
       * IMPORTANT:
       * Do NOT enable material.vertexColors here.
       * These procedural primitives do not carry
       * a geometry "color" attribute.
       */
      color:
        new THREE.Color(
          1,
          1,
          1,
        ),

      toneMapped:
        false,

      transparent:
        false,

      side:
        THREE.DoubleSide,
    });

export const setExactProductRGB = (
  color: THREE.Color,
  sample:
    Pick<
      ProductSample,
      | "red"
      | "green"
      | "blue"
    >,
) => {
  color.setRGB(
    sample.red,
    sample.green,
    sample.blue,
  );

  color.convertSRGBToLinear();
};

/*
 * Physical exact-product formation copied from
 * Template 57's proven rule:
 *
 * - no product opacity crossfade
 * - independent UV cells
 * - cells physically approach exact XY
 * - Z approaches product plane
 * - gaps close to zero
 *
 * By 10 seconds this geometry itself is the product.
 */
export type PT2ResolveStyle =
  | "hex-volume"
  | "dual-cells"
  | "fiber-body"
  | "pyramid-field"
  | "voronoi-crystal"
  | "contour-ribs"
  | "radial-pins"
  | "boolean-volume"
  | "octree-body"
  | "helical-strands";

/*
 * FINAL PRODUCT RESOLVE
 *
 * Scope:
 * - physical motion only
 * - no opacity
 * - no hidden product plane
 * - exact UV product at completion
 *
 * Every template uses its own spatial convergence path.
 * The final coordinates are identical only at completion.
 */
export const PT2PhysicalFormation:
  React.FC<
    PT2LoadedProduct & {
      timing:
        PT2Timing;

      rows?: number;

      resolveStyle:
        PT2ResolveStyle;
    }
  > = ({
    texture,
    product,
    timing,
    rows = 54,
    resolveStyle,
  }) => {
    const columns =
      Math.max(
        16,
        Math.round(
          rows *
          product.visibleWidth /
          product.visibleHeight,
        ),
      );

    const geometry =
      useMemo(
        () => {
          const positions:
            number[] =
            [];

          const uvs:
            number[] =
            [];

          const indices:
            number[] =
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

              positions.push(
                0, 0, 0,
                0, 0, 0,
                0, 0, 0,
                0, 0, 0,
              );

              uvs.push(
                sourceU0,
                1 - sourceV1,

                sourceU1,
                1 - sourceV1,

                sourceU1,
                1 - sourceV0,

                sourceU0,
                1 - sourceV0,
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

          const result =
            new THREE.BufferGeometry();

          result.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
              positions,
              3,
            ),
          );

          result.setAttribute(
            "uv",
            new THREE.Float32BufferAttribute(
              uvs,
              2,
            ),
          );

          result.setIndex(
            indices,
          );

          return result;
        },
        [
          columns,
          product.imageHeight,
          product.imageWidth,
          product.maxX,
          product.maxY,
          product.minX,
          product.minY,
          rows,
        ],
      );

    const material =
      useMemo(
        () =>
          createPT2ExactProductMaterial(
            texture,
          ),
        [
          texture,
        ],
      );

    useLayoutEffect(
      () => {
        const position =
          geometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;

        /*
         * Keep the established PT2 timing.
         *
         * Hero geometry is untouched.
         * Physical resolve occurs during the existing
         * late sequence.
         */
        const emerge =
          smooth01(
            clamp01(
              (
                timing.seconds -
                7.65
              ) /
              0.7,
            ),
          );

        const assemble =
          smooth01(
            clamp01(
              (
                timing.seconds -
                8.35
              ) /
              1.65,
            ),
          );

        const inverse =
          1 -
          assemble;

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

            const finalX =
              product.offsetX +
              (
                centerU -
                0.5
              ) *
              product.visibleWidth;

            const finalY =
              product.offsetY +
              (
                0.5 -
                centerV
              ) *
              product.visibleHeight;

            const halfWidth =
              product.visibleWidth /
              columns /
              2;

            const halfHeight =
              product.visibleHeight /
              rows /
              2;

            const seed =
              hash2(
                column + 113,
                row + 229,
              );

            const dx =
              centerU -
              0.5;

            const dy =
              0.5 -
              centerV;

            const radius =
              Math.sqrt(
                dx * dx +
                dy * dy,
              );

            const angle =
              Math.atan2(
                dy,
                dx,
              );

            let startX =
              finalX;

            let startY =
              finalY;

            let startZ =
              0;

            let startScale =
              0.35;

            let startRotation =
              0;

            let startTiltX =
              0;

            let startTiltY =
              0;

            if (
              resolveStyle ===
              "hex-volume"
            ) {
              /*
               * 59
               * Hex stacks compress along six
               * radial axes before flattening.
               */
              const hexAngle =
                Math.round(
                  angle /
                  (
                    Math.PI /
                    3
                  ),
                ) *
                (
                  Math.PI /
                  3
                );

              const spread =
                0.42 +
                radius * 1.15 +
                seed * 0.28;

              startX =
                finalX +
                Math.cos(
                  hexAngle,
                ) *
                spread;

              startY =
                finalY +
                Math.sin(
                  hexAngle,
                ) *
                spread;

              startZ =
                (
                  (
                    column +
                    row
                  ) %
                    6 -
                  2.5
                ) *
                0.28;

              startScale =
                0.42;

              startRotation =
                hexAngle *
                0.16;
            }

            if (
              resolveStyle ===
              "dual-cells"
            ) {
              /*
               * 60
               * Diamond/dual cells hinge shut
               * from alternating sides.
               */
              const direction =
                (
                  row +
                  column
                ) %
                  2 ===
                0
                  ? 1
                  : -1;

              startX =
                finalX +
                direction *
                (
                  0.45 +
                  seed *
                  0.55
                );

              startY =
                finalY +
                (
                  centerV -
                  0.5
                ) *
                0.28;

              startZ =
                0.7 +
                radius *
                1.15;

              startScale =
                0.48;

              startRotation =
                direction *
                Math.PI /
                4;

              startTiltY =
                direction *
                0.65;
            }

            if (
              resolveStyle ===
              "fiber-body"
            ) {
              /*
               * 61
               * Product begins as narrow medial
               * structural fibers and broadens
               * laterally into the surface.
               */
              const medialX =
                product.offsetX +
                Math.sin(
                  centerV *
                  Math.PI *
                  3
                ) *
                product.visibleWidth *
                0.055;

              startX =
                THREE.MathUtils.lerp(
                  medialX,
                  finalX,
                  0.12,
                );

              startY =
                finalY;

              startZ =
                Math.sin(
                  centerV *
                  Math.PI *
                  8 +
                  seed *
                  3
                ) *
                0.48;

              startScale =
                0.14;

              startRotation =
                (
                  centerV -
                  0.5
                ) *
                0.3;
            }

            if (
              resolveStyle ===
              "pyramid-field"
            ) {
              /*
               * 62
               * Frustum peaks retract directly
               * toward their own surface cells.
               */
              startX =
                finalX;

              startY =
                finalY;

              startZ =
                0.65 +
                seed *
                1.3 +
                Math.sin(
                  centerU *
                  Math.PI *
                  8
                ) *
                0.16;

              startScale =
                0.28;

              startTiltX =
                (
                  seed -
                  0.5
                ) *
                0.85;

              startTiltY =
                (
                  0.5 -
                  seed
                ) *
                0.65;
            }

            if (
              resolveStyle ===
              "voronoi-crystal"
            ) {
              /*
               * 63
               * Crystal cells collapse from
               * irregular radial depth.
               */
              const crystalAngle =
                angle +
                (
                  seed -
                  0.5
                ) *
                1.5;

              const crystalSpread =
                0.38 +
                seed *
                1.15 +
                radius *
                0.65;

              startX =
                finalX +
                Math.cos(
                  crystalAngle,
                ) *
                crystalSpread;

              startY =
                finalY +
                Math.sin(
                  crystalAngle,
                ) *
                crystalSpread;

              startZ =
                (
                  seed -
                  0.25
                ) *
                2.2;

              startScale =
                0.32 +
                seed *
                0.18;

              startRotation =
                (
                  seed -
                  0.5
                ) *
                1.25;

              startTiltX =
                (
                  seed -
                  0.5
                ) *
                0.75;
            }

            if (
              resolveStyle ===
              "contour-ribs"
            ) {
              /*
               * 64
               * Nested contour levels contract
               * radially and close inward.
               */
              const ring =
                Math.floor(
                  radius *
                  11
                );

              const ringScale =
                1.38 +
                ring *
                0.045;

              startX =
                product.offsetX +
                (
                  finalX -
                  product.offsetX
                ) *
                ringScale;

              startY =
                product.offsetY +
                (
                  finalY -
                  product.offsetY
                ) *
                ringScale;

              startZ =
                (
                  ring -
                  3
                ) *
                0.13;

              startScale =
                0.22;

              startRotation =
                (
                  ring %
                    2 ===
                  0
                    ? 1
                    : -1
                ) *
                0.18;
            }

            if (
              resolveStyle ===
              "radial-pins"
            ) {
              /*
               * 65
               * Pin tips retract from a common
               * 3D attractor and spread into XY.
               */
              const attractorX =
                product.offsetX +
                product.visibleWidth *
                0.18;

              const attractorY =
                product.offsetY -
                product.visibleHeight *
                0.14;

              startX =
                THREE.MathUtils.lerp(
                  attractorX,
                  finalX,
                  0.32 +
                  seed *
                  0.12,
                );

              startY =
                THREE.MathUtils.lerp(
                  attractorY,
                  finalY,
                  0.32 +
                  seed *
                  0.12,
                );

              startZ =
                1.15 +
                radius *
                1.45;

              startScale =
                0.18;

              startRotation =
                angle;
            }

            if (
              resolveStyle ===
              "boolean-volume"
            ) {
              /*
               * 66
               * Moving cuts close physically:
               * cells bordering the cutter return
               * from opposite sides of the void.
               */
              const cutterX =
                0.18;

              const cutterY =
                -0.08;

              const cutterDX =
                dx -
                cutterX;

              const cutterDY =
                dy -
                cutterY;

              const cutterDistance =
                Math.sqrt(
                  cutterDX *
                    cutterDX +
                  cutterDY *
                    cutterDY,
                );

              const cutterAngle =
                Math.atan2(
                  cutterDY,
                  cutterDX,
                );

              const cutInfluence =
                Math.max(
                  0,
                  0.34 -
                  cutterDistance,
                ) /
                0.34;

              startX =
                finalX +
                Math.cos(
                  cutterAngle,
                ) *
                cutInfluence *
                0.72;

              startY =
                finalY +
                Math.sin(
                  cutterAngle,
                ) *
                cutInfluence *
                0.72;

              startZ =
                (
                  (
                    row +
                    column
                  ) %
                    5 -
                  2
                ) *
                0.24;

              startScale =
                0.38 +
                (
                  1 -
                  cutInfluence
                ) *
                0.18;
            }

            if (
              resolveStyle ===
              "octree-body"
            ) {
              /*
               * 67
               * Fine cells begin grouped around
               * larger parent-block centers.
               * Parent regions recursively expand
               * into exact child locations.
               */
              const parentSize =
                4;

              const parentColumn =
                Math.floor(
                  column /
                  parentSize
                ) *
                  parentSize +
                parentSize /
                  2;

              const parentRow =
                Math.floor(
                  row /
                  parentSize
                ) *
                  parentSize +
                parentSize /
                  2;

              const parentU =
                parentColumn /
                columns;

              const parentV =
                parentRow /
                rows;

              startX =
                product.offsetX +
                (
                  parentU -
                  0.5
                ) *
                product.visibleWidth;

              startY =
                product.offsetY +
                (
                  0.5 -
                  parentV
                ) *
                product.visibleHeight;

              startZ =
                (
                  (
                    Math.floor(
                      column /
                      parentSize
                    ) +
                    Math.floor(
                      row /
                      parentSize
                    )
                  ) %
                    4
                ) *
                0.28;

              startScale =
                0.16;
            }

            if (
              resolveStyle ===
              "helical-strands"
            ) {
              /*
               * 68
               * Tube strands unwind from
               * opposing helices into exact XY.
               */
              const direction =
                column %
                  2 ===
                0
                  ? 1
                  : -1;

              const helixAngle =
                direction *
                (
                  centerV *
                  Math.PI *
                  6 +
                  seed *
                  Math.PI
                );

              const helixRadius =
                0.38 +
                Math.abs(
                  dx
                ) *
                0.65;

              startX =
                finalX +
                Math.cos(
                  helixAngle,
                ) *
                helixRadius;

              startY =
                finalY;

              startZ =
                Math.sin(
                  helixAngle,
                ) *
                helixRadius *
                1.7;

              startScale =
                0.15;

              startRotation =
                direction *
                helixAngle *
                0.12;
            }

            /*
             * All ten paths converge physically.
             *
             * No alpha / opacity is involved.
             */
            const centerX =
              THREE.MathUtils.lerp(
                startX,
                finalX,
                assemble,
              );

            const centerY =
              THREE.MathUtils.lerp(
                startY,
                finalY,
                assemble,
              );

            const centerZ =
              THREE.MathUtils.lerp(
                startZ,
                0.015,
                assemble,
              );

            const localScale =
              emerge *
              THREE.MathUtils.lerp(
                startScale,
                1,
                assemble,
              );

            const localRotation =
              startRotation *
              inverse;

            const localTiltX =
              startTiltX *
              inverse;

            const localTiltY =
              startTiltY *
              inverse;

            const cosR =
              Math.cos(
                localRotation,
              );

            const sinR =
              Math.sin(
                localRotation,
              );

            const base =
              quadIndex *
              4;

            const corners = [
              [
                -halfWidth,
                -halfHeight,
              ],
              [
                halfWidth,
                -halfHeight,
              ],
              [
                halfWidth,
                halfHeight,
              ],
              [
                -halfWidth,
                halfHeight,
              ],
            ] as const;

            for (
              let corner = 0;
              corner < 4;
              corner++
            ) {
              const [
                rawX,
                rawY,
              ] =
                corners[
                  corner
                ];

              const scaledX =
                rawX *
                localScale;

              const scaledY =
                rawY *
                localScale;

              const rotatedX =
                scaledX *
                  cosR -
                scaledY *
                  sinR;

              const rotatedY =
                scaledX *
                  sinR +
                scaledY *
                  cosR;

              /*
               * Physical hinge/tilt component.
               * Goes exactly to zero at completion.
               */
              const cornerZ =
                (
                  rawX /
                    Math.max(
                      halfWidth,
                      0.0001,
                    )
                ) *
                  localTiltY *
                  halfWidth +
                (
                  rawY /
                    Math.max(
                      halfHeight,
                      0.0001,
                    )
                ) *
                  localTiltX *
                  halfHeight;

              position.setXYZ(
                base +
                  corner,

                centerX +
                  rotatedX,

                centerY +
                  rotatedY,

                centerZ +
                  cornerZ,
              );
            }

            quadIndex++;
          }
        }

        position.needsUpdate =
          true;

        geometry.computeBoundingSphere();
      },
      [
        columns,
        geometry,
        product.offsetX,
        product.offsetY,
        product.visibleHeight,
        product.visibleWidth,
        resolveStyle,
        rows,
        timing.seconds,
      ],
    );

    return (
      <mesh
        geometry={
          geometry
        }
        material={
          material
        }
        frustumCulled={
          false
        }
      />
    );
  };

export const PT2PhysicalScene:
  React.FC<{
    imageSrc: string;

    Geometry:
      React.ComponentType<
        PT2LoadedProduct & {
          timing:
            PT2Timing;
        }
      >;
  }> = ({
    imageSrc,
    Geometry,
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
        {(loaded) => (
          <Geometry
            {...loaded}
            timing={
              timing
            }
          />
        )}
      </PT2Canvas>
    );
  };

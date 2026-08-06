import React, {
  useLayoutEffect,
  useMemo,
} from "react";

import * as THREE from "three";

import {
  createPT2ExactProductMaterial,
  smooth01,
} from "./ProductTemplates2Core";

import {
  clamp01,
  hash2,
  type PT2Timing,
} from "./PT2PhysicalSystemsSupport";

import type {
  PT2LoadedProduct,
} from "./ProductTemplates2Runtime";

export type PT2Batch3ResolveStyle =
  | "sphere-pressure"
  | "tensegrity-cage"
  | "metaball-body"
  | "lamella-fan"
  | "lathe-unroll"
  | "chainmail"
  | "lattice"
  | "polyhedral"
  | "superformula";

export const PT2Batch3Formation:
  React.FC<
    PT2LoadedProduct & {
      timing:
        PT2Timing;

      resolveStyle:
        PT2Batch3ResolveStyle;

      rows?: number;
    }
  > = ({
    texture,
    product,
    timing,
    resolveStyle,
    rows = 54,
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

            const u =
              (
                u0 +
                u1
              ) /
                2;

            const v =
              (
                v0 +
                v1
              ) /
                2;

            const finalX =
              product.offsetX +
              (
                u -
                0.5
              ) *
                product.visibleWidth;

            const finalY =
              product.offsetY +
              (
                0.5 -
                v
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
                column + 401,
                row + 733,
              );

            const dx =
              u -
                0.5;

            const dy =
              0.5 -
                v;

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
              0.25;

            let rotation =
              0;

            let tiltX =
              0;

            let tiltY =
              0;

            if (
              resolveStyle ===
              "sphere-pressure"
            ) {
              const sphereRadius =
                0.5 +
                radius *
                  1.5;

              startX =
                finalX +
                Math.cos(
                  angle,
                ) *
                  sphereRadius *
                  0.42;

              startY =
                finalY +
                Math.sin(
                  angle,
                ) *
                  sphereRadius *
                  0.42;

              startZ =
                Math.sin(
                  angle *
                    3 +
                  seed *
                    Math.PI *
                    2,
                ) *
                  1.15;

              startScale =
                0.18 +
                seed *
                  0.12;
            }

            if (
              resolveStyle ===
              "tensegrity-cage"
            ) {
              const snappedU =
                Math.round(
                  u *
                    7,
                ) /
                  7;

              const snappedV =
                Math.round(
                  v *
                    11,
                ) /
                  11;

              startX =
                product.offsetX +
                (
                  snappedU -
                    0.5
                ) *
                  product.visibleWidth;

              startY =
                product.offsetY +
                (
                  0.5 -
                    snappedV
                ) *
                  product.visibleHeight;

              startZ =
                (
                  (
                    row +
                      column
                  ) %
                    3 -
                  1
                ) *
                  0.85;

              startScale =
                0.12;

              rotation =
                (
                  seed -
                    0.5
                ) *
                  0.65;
            }

            if (
              resolveStyle ===
              "metaball-body"
            ) {
              const blob =
                Math.floor(
                  seed *
                    5,
                );

              const blobAngle =
                blob /
                  5 *
                  Math.PI *
                  2;

              const blobX =
                product.offsetX +
                Math.cos(
                  blobAngle,
                ) *
                  product.visibleWidth *
                  0.18;

              const blobY =
                product.offsetY +
                Math.sin(
                  blobAngle,
                ) *
                  product.visibleHeight *
                  0.14;

              startX =
                THREE.MathUtils.lerp(
                  blobX,
                  finalX,
                  0.18,
                );

              startY =
                THREE.MathUtils.lerp(
                  blobY,
                  finalY,
                  0.18,
                );

              startZ =
                Math.sin(
                  blobAngle +
                    seed *
                      4,
                ) *
                  0.9;

              startScale =
                0.14;
            }

            if (
              resolveStyle ===
              "lamella-fan"
            ) {
              const direction =
                column %
                  2 ===
                0
                  ? 1
                  : -1;

              startX =
                finalX;

              startY =
                finalY;

              startZ =
                Math.abs(
                  dx,
                ) *
                  1.45 +
                0.35;

              startScale =
                0.3;

              tiltY =
                direction *
                  Math.PI *
                  0.44;
            }

            if (
              resolveStyle ===
              "lathe-unroll"
            ) {
              const theta =
                (
                  u -
                    0.5
                ) *
                  Math.PI *
                  2;

              const latheRadius =
                Math.abs(
                  dx,
                ) *
                  product.visibleWidth *
                  0.48 +
                0.18;

              startX =
                product.offsetX +
                Math.cos(
                  theta,
                ) *
                  latheRadius;

              startY =
                finalY;

              startZ =
                Math.sin(
                  theta,
                ) *
                  latheRadius;

              startScale =
                0.22;

              rotation =
                theta *
                  0.15;
            }

            if (
              resolveStyle ===
              "chainmail"
            ) {
              const linkDirection =
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
                linkDirection *
                  halfWidth *
                  4;

              startY =
                finalY +
                (
                  row %
                    2 ===
                  0
                    ? halfHeight *
                      2
                    : -halfHeight *
                      2
                );

              startZ =
                linkDirection *
                  0.72;

              startScale =
                0.2;

              tiltX =
                linkDirection *
                  Math.PI *
                  0.42;

              tiltY =
                -linkDirection *
                  Math.PI *
                  0.26;
            }

            if (
              resolveStyle ===
              "lattice"
            ) {
              const latticeColumns =
                6;

              const latticeRows =
                10;

              const latticeU =
                Math.round(
                  u *
                    latticeColumns,
                ) /
                  latticeColumns;

              const latticeV =
                Math.round(
                  v *
                    latticeRows,
                ) /
                  latticeRows;

              startX =
                product.offsetX +
                (
                  latticeU -
                    0.5
                ) *
                  product.visibleWidth;

              startY =
                product.offsetY +
                (
                  0.5 -
                    latticeV
                ) *
                  product.visibleHeight;

              startZ =
                Math.sin(
                  latticeU *
                    Math.PI *
                    2 +
                  latticeV *
                    Math.PI *
                    3,
                ) *
                  0.95;

              startScale =
                0.12;
            }

            if (
              resolveStyle ===
              "polyhedral"
            ) {
              const direction =
                seed *
                  Math.PI *
                  2;

              const distance =
                0.35 +
                seed *
                  0.9;

              startX =
                finalX +
                Math.cos(
                  direction,
                ) *
                  distance;

              startY =
                finalY +
                Math.sin(
                  direction,
                ) *
                  distance;

              startZ =
                (
                  seed -
                    0.5
                ) *
                  2.4;

              startScale =
                0.16 +
                seed *
                  0.14;

              rotation =
                (
                  seed -
                    0.5
                ) *
                  1.4;

              tiltX =
                (
                  0.5 -
                    seed
                ) *
                  0.9;
            }

            if (
              resolveStyle ===
              "superformula"
            ) {
              const lobes =
                7;

              const petalAngle =
                angle;

              const petalRadius =
                0.3 +
                0.45 *
                  Math.abs(
                    Math.cos(
                      lobes *
                        petalAngle /
                        2,
                    ),
                  );

              startX =
                product.offsetX +
                Math.cos(
                  petalAngle,
                ) *
                  petalRadius *
                  product.visibleWidth *
                  0.45;

              startY =
                product.offsetY +
                Math.sin(
                  petalAngle,
                ) *
                  petalRadius *
                  product.visibleHeight *
                  0.34;

              startZ =
                Math.sin(
                  lobes *
                    petalAngle,
                ) *
                  0.78;

              startScale =
                0.14;

              rotation =
                petalAngle *
                  0.28;
            }

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

            const scale =
              emerge *
              THREE.MathUtils.lerp(
                startScale,
                1,
                assemble,
              );

            const localRotation =
              rotation *
              inverse;

            const localTiltX =
              tiltX *
              inverse;

            const localTiltY =
              tiltY *
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
                  scale;

              const scaledY =
                rawY *
                  scale;

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

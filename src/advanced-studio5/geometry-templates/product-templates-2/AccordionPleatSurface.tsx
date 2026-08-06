import React, {
  useLayoutEffect,
  useMemo,
} from "react";

import * as THREE from "three";

import {
  createPT2ExactProductMaterial,
} from "./ProductTemplates2Core";

import {
  PT2PhysicalScene,
  type PT2Timing,
} from "./PT2PhysicalSystemsSupport";

import type {
  PT2LoadedProduct,
} from "./ProductTemplates2Runtime";

type Props = {
  imageSrc: string;
};

const Geometry:
  React.FC<
    PT2LoadedProduct & {
      timing:
        PT2Timing;
    }
  > = ({
    texture,
    product,
    timing,
  }) => {
    const rows =
      64;

    const columns =
      32;

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
            row <= rows;
            row++
          ) {
            for (
              let column = 0;
              column <= columns;
              column++
            ) {
              const u =
                column /
                  columns;

              const v =
                row /
                  rows;

              positions.push(
                0,
                0,
                0,
              );

              const sourceU =
                (
                  product.minX +
                  u *
                  (
                    product.maxX -
                      product.minX +
                    1
                  )
                ) /
                  product.imageWidth;

              const sourceV =
                (
                  product.minY +
                  v *
                  (
                    product.maxY -
                      product.minY +
                    1
                  )
                ) /
                  product.imageHeight;

              uvs.push(
                sourceU,
                1 -
                  sourceV,
              );
            }
          }

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
              const a =
                row *
                  (
                    columns +
                      1
                  ) +
                column;

              const b =
                a +
                  1;

              const c =
                a +
                  columns +
                  2;

              const d =
                a +
                  columns +
                  1;

              /*
               * PT2 camera views the product from +Z.
               *
               * Product coordinates use +Y upward, so the
               * previous a,b,c / a,c,d winding produced -Z
               * facing triangles and the accordion sheet was
               * back-face culled.
               *
               * Reverse ONLY Template 70's triangle winding.
               * Geometry, animation and resolve are unchanged.
               */
              indices.push(
                a,
                c,
                b,

                a,
                d,
                c,
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
          product.imageHeight,
          product.imageWidth,
          product.maxX,
          product.maxY,
          product.minX,
          product.minY,
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
         * TEMPLATE 70 ONLY
         *
         * The uploaded product is the accordion sheet itself.
         * No secondary product mesh.
         * No opacity.
         *
         * 0–8s:
         *   deep architectural pleats remain fully visible.
         *
         * 8–10s:
         *   the SAME UV surface mechanically unfolds.
         *
         * 10–12s:
         *   exact flat uploaded product hold.
         */
        const resolve =
          THREE.MathUtils.smoothstep(
            timing.seconds,
            8,
            10,
          );

        const physicalFold =
          1 -
          resolve;

        const folds =
          9;

        const depthBase =
          Math.min(
            product.visibleWidth,
            product.visibleHeight,
          ) *
          0.22;

        const lateralCompression =
          0.28 *
          physicalFold;

        let index =
          0;

        for (
          let row = 0;
          row <= rows;
          row++
        ) {
          for (
            let column = 0;
            column <= columns;
            column++
          ) {
            const u =
              column /
              columns;

            const v =
              row /
              rows;

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

            /*
             * Shift the fold phase continuously over time.
             * This creates a traveling mechanical pleat wave
             * without changing the product UV topology.
             */
            const animatedFoldPosition =
              u *
              folds +
              timing.seconds *
              0.55;

            const segment =
              Math.floor(
                animatedFoldPosition,
              );

            const local =
              animatedFoldPosition -
              segment;

            /*
             * True triangular accordion profile:
             *
             * 0 -> 1 -> 0 across each half-cycle.
             */
            const triangle =
              local <
                0.5
                ? local *
                  2
                : (
                    1 -
                    local
                  ) *
                  2;

            const sign =
              segment %
                2 ===
              0
                ? 1
                : -1;

            /*
             * Vertical modulation makes the pleats
             * feel like one large physical sheet,
             * rather than tiny disconnected ripples.
             */
            const longitudinalWave =
              0.88 +
              0.12 *
              Math.sin(
                timing.seconds *
                0.95 +
                v *
                Math.PI *
                3,
              );

            const foldDepth =
              depthBase *
              longitudinalWave *
              physicalFold;

            /*
             * Accordion compression:
             * while pleated, the sheet is physically
             * narrower in X. During resolve, it expands
             * back to its exact uploaded-product width.
             */
            const compressedX =
              product.offsetX +
              (
                finalX -
                  product.offsetX
              ) *
              (
                1 -
                lateralCompression
              );

            /*
             * Slight Y bow gives the sheet real spatial
             * presence without changing the concept.
             * Goes exactly to zero during resolve.
             */
            const yBow =
              Math.sin(
                u *
                Math.PI
              ) *
              Math.sin(
                timing.seconds *
                0.72 +
                v *
                2.4
              ) *
              0.08 *
              physicalFold;

            const z =
              sign *
              triangle *
              foldDepth;

            position.setXYZ(
              index,
              compressedX,
              finalY +
                yBow,
              z,
            );

            index++;
          }
        }

        position.needsUpdate =
          true;

        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();
      },
      [
        geometry,
        product.offsetX,
        product.offsetY,
        product.visibleHeight,
        product.visibleWidth,
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

export const AccordionPleatSurface:
  React.FC<Props> = ({
    imageSrc,
  }) => (
    <PT2PhysicalScene
      imageSrc={
        imageSrc
      }
      Geometry={
        Geometry
      }
    />
  );

export default AccordionPleatSurface;

import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

import {
  PT2PhysicalFormation,
  PT2PhysicalScene,
  buildProductField,
  createExactRGBMaterial,
  setExactProductRGB,
  type PT2Timing,
} from "./PT2PhysicalSystemsSupport";

import type {
  PT2LoadedProduct,
} from "./ProductTemplates2Runtime";

type Props = {
  imageSrc: string;
};

/*
 * Irregular crystal primitive.
 *
 * Every instance uses the same convex irregular
 * prism, but position/scale/depth are controlled
 * by product-derived fields.
 */
const Geometry:
  React.FC<
    PT2LoadedProduct & {
      timing:
        PT2Timing;
    }
  > = ({
    image,
    texture,
    product,
    timing,
  }) => {
    const field =
      useMemo(
        () =>
          buildProductField(
            image,
            product,
            45,
          ),
        [
          image,
          product,
        ],
      );

    const crystals =
      useMemo(
        () =>
          field.cells.filter(
            (
              cell,
            ) =>
              (
                cell.row *
                  7 +
                cell.column *
                  13
              ) %
                3 !==
              0,
          ),
        [
          field.cells,
        ],
      );

    const geometry =
      useMemo(
        () => {
          const radius =
            Math.min(
              field.cellWidth,
              field.cellHeight,
            ) *
            0.72;

          const shape =
            new THREE.Shape();

          const sides =
            7;

          for (
            let index = 0;
            index <
            sides;
            index++
          ) {
            const angle =
              (
                index /
                sides
              ) *
              Math.PI *
              2;

            const irregular =
              radius *
              (
                0.72 +
                0.24 *
                  Math.sin(
                    index *
                    2.17,
                  )
              );

            const x =
              Math.cos(
                angle,
              ) *
              irregular;

            const y =
              Math.sin(
                angle,
              ) *
              irregular;

            if (
              index ===
              0
            ) {
              shape.moveTo(
                x,
                y,
              );
            } else {
              shape.lineTo(
                x,
                y,
              );
            }
          }

          shape.closePath();

          const depth =
            radius *
            1.25;

          const result =
            new THREE.ExtrudeGeometry(
              shape,
              {
                depth,

                bevelEnabled:
                  true,

                bevelSegments:
                  2,

                bevelSize:
                  radius *
                  0.08,

                bevelThickness:
                  radius *
                  0.08,
              },
            );

          result.translate(
            0,
            0,
            -depth /
              2,
          );

          return result;
        },
        [
          field.cellHeight,
          field.cellWidth,
        ],
      );

    const material =
      useMemo(
        createExactRGBMaterial,
        [],
      );

    const meshRef =
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

    const color =
      useMemo(
        () =>
          new THREE.Color(),
        [],
      );

    useLayoutEffect(
      () => {
        const mesh =
          meshRef.current;

        if (!mesh) {
          return;
        }

        const influence =
          timing.geometryInfluence;

        for (
          let index = 0;
          index <
          crystals.length;
          index++
        ) {
          const cell =
            crystals[
              index
            ];

          setExactProductRGB(
            color,
            cell,
          );

          mesh.setColorAt(
            index,
            color,
          );

          const radialX =
            cell.u -
            0.5;

          const radialY =
            0.5 -
            cell.v;

          const angle =
            Math.atan2(
              radialY,
              radialX,
            );

          const radius =
            Math.sqrt(
              radialX *
                radialX +
              radialY *
                radialY,
            );

          const pulse =
            Math.sin(
              timing.seconds *
                1.12 +
              cell.phase,
            );

          const z =
            (
              0.4 +
              radius *
                1.8 +
              cell.edge *
                0.7 +
              (
                pulse +
                1
              ) *
                0.38
            ) *
            influence;

          const spread =
            (
              0.12 +
              cell.contrast *
                0.25
            ) *
            pulse *
            influence;

          dummy.position.set(
            cell.x +
              Math.cos(
                angle,
              ) *
                spread,

            cell.y +
              Math.sin(
                angle,
              ) *
                spread,

            z,
          );

          dummy.rotation.set(
            radialY *
              pulse *
              0.6 *
              influence,

            -radialX *
              pulse *
              0.6 *
              influence,

            pulse *
              0.16 *
              influence,
          );

          const scale =
            (
              0.72 +
              cell.edge *
                0.25 +
              0.08 *
                pulse
            ) *
            influence;

          dummy.scale.set(
            Math.max(
              0.001,
              scale,
            ),

            Math.max(
              0.001,
              scale,
            ),

            Math.max(
              0.001,
              scale,
            ),
          );

          dummy.updateMatrix();

          mesh.setMatrixAt(
            index,
            dummy.matrix,
          );
        }

        mesh.instanceMatrix.needsUpdate =
          true;

        if (
          mesh.instanceColor
        ) {
          mesh.instanceColor.needsUpdate =
            true;
        }
      },
      [
        color,
        crystals,
        dummy,
        timing.geometryInfluence,
        timing.seconds,
      ],
    );

    return (
      <>
        <instancedMesh
          ref={
            meshRef
          }
          args={[
            geometry,
            material,
            crystals.length,
          ]}
          frustumCulled={
            false
          }
        />

        <PT2PhysicalFormation
          texture={
            texture
          }
          image={
            image
          }
          product={
            product
          }
          timing={
            timing
          }
          resolveStyle="voronoi-crystal"
        />
      </>
    );
  };

export const VoronoiDepthCrystal:
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

export default VoronoiDepthCrystal;

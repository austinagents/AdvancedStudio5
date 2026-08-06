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
  clamp01,
  createExactRGBMaterial,
  setExactProductRGB,
  valueNoise2,
  type PT2Timing,
} from "./PT2PhysicalSystemsSupport";

import type {
  PT2LoadedProduct,
} from "./ProductTemplates2Runtime";

type Props = {
  imageSrc: string;
};

type Instance = {
  cell:
    ReturnType<
      typeof buildProductField
    >["cells"][number];

  z: number;
  layer: number;
  normalizedZ: number;
};

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
            58,
          ),
        [
          image,
          product,
        ],
      );

    const primitive =
      useMemo(
        () => {
          const radius =
            Math.min(
              field.cellWidth,
              field.cellHeight,
            ) *
            0.46;

          const geometry =
            new THREE.CylinderGeometry(
              radius,
              radius,
              radius *
                0.86,
              6,
              1,
              false,
            );

          geometry.rotateX(
            Math.PI /
            2,
          );

          return geometry;
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

    const instances =
      useMemo(
        () => {
          const result:
            Instance[] =
            [];

          const spacing =
            Math.min(
              field.cellWidth,
              field.cellHeight,
            ) *
            0.72;

          for (
            const cell of
            field.cells
          ) {
            const depthSignal =
              clamp01(
                cell.edge *
                  0.28 +
                cell.contrast *
                  0.22 +
                (
                  1 -
                  cell.luma
                ) *
                  0.5,
              );

            const count =
              THREE.MathUtils.clamp(
                2 +
                  Math.round(
                    depthSignal *
                    5,
                  ),
                2,
                7,
              );

            const center =
              (
                count -
                1
              ) /
              2;

            for (
              let layer = 0;
              layer <
              count;
              layer++
            ) {
              const local =
                layer -
                center;

              result.push({
                cell,

                z:
                  local *
                  spacing,

                layer,

                normalizedZ:
                  local /
                  Math.max(
                    1,
                    center,
                  ),
              });
            }
          }

          return result;
        },
        [
          field.cellHeight,
          field.cellWidth,
          field.cells,
        ],
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
          instances.length;
          index++
        ) {
          const item =
            instances[
              index
            ];

          const cell =
            item.cell;

          setExactProductRGB(
            color,
            cell,
          );

          mesh.setColorAt(
            index,
            color,
          );

          const fieldNoise =
            valueNoise2(
              cell.u *
                5 +
                timing.seconds *
                  0.38,

              cell.v *
                6 -
                timing.seconds *
                  0.29 +
                item.normalizedZ *
                  1.1,
            );

          const pulse =
            0.62 +
            0.38 *
              Math.sin(
                timing.seconds *
                  1.35 +
                cell.phase +
                item.layer *
                  0.33,
              );

          const occupancy =
            clamp01(
              (
                fieldNoise -
                0.23
              ) /
              0.45,
            );

          const scale =
            (
              0.18 +
              occupancy *
                0.72 +
              pulse *
                0.18
            ) *
            influence;

          dummy.position.set(
            cell.x +
              Math.sin(
                timing.seconds *
                  0.6 +
                cell.phase,
              ) *
                0.035 *
                influence,

            cell.y +
              Math.cos(
                timing.seconds *
                  0.52 +
                cell.phase,
              ) *
                0.025 *
                influence,

            item.z +
              Math.sin(
                timing.seconds *
                  1.1 +
                cell.phase +
                item.layer *
                  0.44,
              ) *
                0.09 *
                influence,
          );

          dummy.rotation.set(
            item.normalizedZ *
              0.08 *
              timing.phase2,

            (
              fieldNoise -
              0.5
            ) *
              0.16 *
              influence,

            (
              cell.edge -
              0.5
            ) *
              0.12 *
              timing.phase1,
          );

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
        dummy,
        instances,
        timing.geometryInfluence,
        timing.phase1,
        timing.phase2,
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
            primitive,
            material,
            instances.length,
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
          resolveStyle="hex-volume"
        />
      </>
    );
  };

export const HexagonalVolumeField:
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

export default HexagonalVolumeField;

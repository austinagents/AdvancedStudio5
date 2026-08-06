import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

import {
  RoundedBoxGeometry,
} from "three-stdlib";

import {
  PT2PhysicalFormation,
  PT2PhysicalScene,
  buildProductField,
  clamp01,
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

type Voxel = {
  cell:
    ReturnType<
      typeof buildProductField
    >["cells"][number];

  z: number;
  layer: number;
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
            48,
          ),
        [
          image,
          product,
        ],
      );

    const geometry =
      useMemo(
        () => {
          const depth =
            Math.min(
              field.cellWidth,
              field.cellHeight,
            ) *
            0.78;

          return new RoundedBoxGeometry(
            field.cellWidth *
              0.84,

            field.cellHeight *
              0.84,

            depth,

            2,

            depth *
              0.11,
          );
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

    const voxels =
      useMemo(
        () => {
          const result:
            Voxel[] =
            [];

          const spacing =
            Math.min(
              field.cellWidth,
              field.cellHeight,
            ) *
            0.7;

          for (
            const cell of
            field.cells
          ) {
            const count =
              THREE.MathUtils.clamp(
                3 +
                  Math.round(
                    (
                      cell.edge *
                        0.35 +
                      cell.contrast *
                        0.25 +
                      (
                        1 -
                        cell.luma
                      ) *
                        0.4
                    ) *
                    4,
                  ),
                3,
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
              result.push({
                cell,

                z:
                  (
                    layer -
                    center
                  ) *
                  spacing,

                layer,
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

        const cutterX =
          Math.sin(
            timing.seconds *
              0.58,
          ) *
          product.visibleWidth *
          0.4;

        const cutterY =
          Math.cos(
            timing.seconds *
              0.43,
          ) *
          product.visibleHeight *
          0.3;

        const cutterRadius =
          0.48 +
          (
            Math.sin(
              timing.seconds *
                0.76,
            ) +
            1
          ) *
            0.23;

        const sliceZ =
          Math.sin(
            timing.seconds *
              0.68,
          ) *
          0.72;

        for (
          let index = 0;
          index <
          voxels.length;
          index++
        ) {
          const voxel =
            voxels[
              index
            ];

          const cell =
            voxel.cell;

          setExactProductRGB(
            color,
            cell,
          );

          mesh.setColorAt(
            index,
            color,
          );

          const dx =
            cell.x -
            cutterX;

          const dy =
            cell.y -
            cutterY;

          const radialDistance =
            Math.sqrt(
              dx *
                dx +
              dy *
                dy,
            );

          /*
           * Moving cylindrical subtraction.
           */
          const cylinderOccupancy =
            clamp01(
              (
                radialDistance -
                cutterRadius
              ) /
              0.13,
            );

          /*
           * Independent moving Z slice subtraction.
           */
          const sliceOccupancy =
            clamp01(
              Math.abs(
                voxel.z -
                sliceZ,
              ) /
              0.18,
            );

          const occupancy =
            Math.max(
              0.015,
              cylinderOccupancy *
                sliceOccupancy,
            );

          const pulse =
            0.92 +
            0.08 *
              Math.sin(
                timing.seconds *
                  1.2 +
                cell.phase +
                voxel.layer *
                  0.41,
              );

          const scale =
            occupancy *
            pulse *
            influence;

          dummy.position.set(
            cell.x,
            cell.y,
            voxel.z,
          );

          dummy.rotation.set(
            0,
            (
              cell.edge -
              0.5
            ) *
              0.08 *
              influence,
            0,
          );

          dummy.scale.set(
            scale,
            scale,
            scale,
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
        product.visibleHeight,
        product.visibleWidth,
        timing.geometryInfluence,
        timing.seconds,
        voxels,
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
            voxels.length,
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
          resolveStyle="boolean-volume"
        />
      </>
    );
  };

export const BooleanSliceVolume:
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

export default BooleanSliceVolume;

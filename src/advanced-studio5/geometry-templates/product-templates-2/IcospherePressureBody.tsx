import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

import {
  PT2PhysicalScene,
  buildProductField,
  createExactRGBMaterial,
  setExactProductRGB,
  type PT2Timing,
} from "./PT2PhysicalSystemsSupport";

import {
  PT2Batch3Formation,
} from "./PT2Batch3Formation";

import type {
  PT2LoadedProduct,
} from "./ProductTemplates2Runtime";

type Props = {
  imageSrc: string;
};

type SphereCell = {
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
            44,
          ),
        [
          image,
          product,
        ],
      );

    const radius =
      Math.min(
        field.cellWidth,
        field.cellHeight,
      ) *
        0.42;

    const primitive =
      useMemo(
        () =>
          new THREE.IcosahedronGeometry(
            radius,
            1,
          ),
        [
          radius,
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
            SphereCell[] =
            [];

          const spacing =
            radius *
              1.45;

          for (
            const cell of
            field.cells
          ) {
            const count =
              THREE.MathUtils.clamp(
                2 +
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
                      3,
                  ),
                2,
                5,
              );

            const center =
              (
                count -
                  1
              ) /
                2;

            for (
              let layer = 0;
              layer < count;
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
          field.cells,
          radius,
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

        const pressureX =
          Math.sin(
            timing.seconds *
              0.58,
          ) *
            product.visibleWidth *
            0.34;

        const pressureY =
          Math.cos(
            timing.seconds *
              0.47,
          ) *
            product.visibleHeight *
            0.24;

        for (
          let index = 0;
          index < instances.length;
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

          const dx =
            cell.x -
              pressureX;

          const dy =
            cell.y -
              pressureY;

          const distance =
            Math.sqrt(
              dx * dx +
              dy * dy,
            );

          const pressure =
            1 /
            (
              1 +
                distance *
                  1.3
            );

          const pulse =
            0.72 +
            pressure *
              0.58 +
            Math.sin(
              timing.seconds *
                1.5 +
              cell.phase +
              item.layer *
                0.5,
            ) *
              0.12;

          dummy.position.set(
            cell.x +
              dx *
                pressure *
                0.04 *
                influence,

            cell.y +
              dy *
                pressure *
                0.04 *
                influence,

            item.z +
              pressure *
                0.52 *
                Math.sin(
                  timing.seconds *
                    1.2 +
                  cell.phase,
                ) *
                influence,
          );

          const scale =
            Math.max(
              0.01,
              pulse *
                influence,
            );

          dummy.scale.setScalar(
            scale,
          );

          dummy.rotation.set(
            timing.seconds *
              0.14 +
              cell.phase *
                0.08,

            timing.seconds *
              0.11,

            0,
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
        product.visibleHeight,
        product.visibleWidth,
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
            primitive,
            material,
            instances.length,
          ]}
          frustumCulled={
            false
          }
        />

        <PT2Batch3Formation
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
          resolveStyle="sphere-pressure"
        />
      </>
    );
  };

export const IcospherePressureBody:
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

export default IcospherePressureBody;

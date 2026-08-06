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
            38,
          ),
        [
          image,
          product,
        ],
      );

    const rings =
      useMemo(
        () =>
          field.cells.filter(
            (
              cell,
            ) =>
              (
                cell.row +
                  cell.column
              ) %
                2 ===
              0,
          ),
        [
          field.cells,
        ],
      );

    const size =
      Math.min(
        field.cellWidth,
        field.cellHeight,
      );

    const geometry =
      useMemo(
        () =>
          new THREE.TorusGeometry(
            size *
              0.42,

            size *
              0.095,

            8,
            20,
          ),
        [
          size,
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
          index < rings.length;
          index++
        ) {
          const cell =
            rings[
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

          const alternating =
            (
              cell.row +
                cell.column
            ) %
              4 <
            2
              ? 1
              : -1;

          const swing =
            Math.sin(
              timing.seconds *
                1.18 +
              cell.phase,
            );

          dummy.position.set(
            cell.x,
            cell.y,
            swing *
              0.16 *
              influence,
          );

          dummy.rotation.set(
            alternating *
              Math.PI /
              2 *
              influence,

            swing *
              0.48 *
              influence,

            alternating *
              swing *
              0.18 *
              influence,
          );

          dummy.scale.setScalar(
            influence,
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
        rings,
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
            rings.length,
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
          resolveStyle="chainmail"
        />
      </>
    );
  };

export const ChainmailRingField:
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

export default ChainmailRingField;

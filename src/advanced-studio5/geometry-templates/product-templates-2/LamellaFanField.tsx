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
            48,
          ),
        [
          image,
          product,
        ],
      );

    const lamellas =
      useMemo(
        () =>
          field.cells.filter(
            (
              cell,
            ) =>
              cell.column %
                2 ===
              0,
          ),
        [
          field.cells,
        ],
      );

    const geometry =
      useMemo(
        () =>
          new THREE.BoxGeometry(
            field.cellWidth *
              0.34,

            field.cellHeight *
              0.9,

            Math.min(
              field.cellWidth,
              field.cellHeight,
            ) *
              0.72,
          ),
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
          index < lamellas.length;
          index++
        ) {
          const cell =
            lamellas[
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

          const fan =
            Math.sin(
              timing.seconds *
                1.15 +
              cell.column *
                0.42 +
              cell.row *
                0.08,
            );

          const hinge =
            fan *
              Math.PI *
              0.42 *
              influence;

          dummy.position.set(
            cell.x,
            cell.y,
            Math.abs(
              Math.sin(
                hinge,
              ),
            ) *
              0.28 *
              influence,
          );

          dummy.rotation.set(
            0,
            hinge,
            0,
          );

          dummy.scale.set(
            influence,
            influence,
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
        lamellas,
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
            lamellas.length,
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
          resolveStyle="lamella-fan"
        />
      </>
    );
  };

export const LamellaFanField:
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

export default LamellaFanField;

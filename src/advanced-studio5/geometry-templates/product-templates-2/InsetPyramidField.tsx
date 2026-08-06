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

    const geometry =
      useMemo(
        () => {
          const size =
            Math.min(
              field.cellWidth,
              field.cellHeight,
            ) *
            0.9;

          const result =
            new THREE.CylinderGeometry(
              size *
                0.24,
              size *
                0.62,
              1,
              4,
              1,
              false,
            );

          result.rotateX(
            Math.PI /
            2,
          );

          result.rotateZ(
            Math.PI /
            4,
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
          field.cells.length;
          index++
        ) {
          const cell =
            field.cells[
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

          const travelingFront =
            0.5 +
            0.5 *
              Math.sin(
                timing.seconds *
                  1.55 -
                cell.u *
                  10 +
                cell.v *
                  4,
              );

          const feature =
            0.32 +
            cell.edge *
              1.18 +
            cell.contrast *
              0.8 +
            (
              1 -
              cell.luma
            ) *
              0.38;

          const height =
            feature *
            (
              0.52 +
              travelingFront *
                0.7
            ) *
            influence;

          dummy.position.set(
            cell.x,
            cell.y,
            height /
              2,
          );

          dummy.rotation.set(
            (
              travelingFront -
              0.5
            ) *
              0.2 *
              influence,

            (
              cell.edge -
              0.5
            ) *
              0.16 *
              influence,

            Math.sin(
              timing.seconds +
              cell.phase,
            ) *
              0.08 *
              influence,
          );

          dummy.scale.set(
            influence,
            influence,
            Math.max(
              0.001,
              height,
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
        field.cells,
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
            field.cells.length,
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
          resolveStyle="pyramid-field"
        />
      </>
    );
  };

export const InsetPyramidField:
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

export default InsetPyramidField;

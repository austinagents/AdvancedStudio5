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

const superformulaRadius = (
  angle: number,
  m: number,
  n1: number,
  n2: number,
  n3: number,
) => {
  const part1 =
    Math.pow(
      Math.abs(
        Math.cos(
          m *
            angle /
            4,
        ),
      ),
      n2,
    );

  const part2 =
    Math.pow(
      Math.abs(
        Math.sin(
          m *
            angle /
            4,
        ),
      ),
      n3,
    );

  return Math.pow(
    part1 +
      part2,
    -1 /
      n1,
  );
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

    const petals =
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

    const geometry =
      useMemo(
        () => {
          const shape =
            new THREE.Shape();

          const segments =
            64;

          const size =
            Math.min(
              field.cellWidth,
              field.cellHeight,
            ) *
              0.48;

          for (
            let index = 0;
            index < segments;
            index++
          ) {
            const angle =
              index /
                segments *
                Math.PI *
                2;

            const radius =
              superformulaRadius(
                angle,
                7,
                0.42,
                1.4,
                1.4,
              ) *
                size;

            const x =
              Math.cos(
                angle,
              ) *
                radius;

            const y =
              Math.sin(
                angle,
              ) *
                radius;

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
            size *
              0.72;

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
                  size *
                    0.06,

                bevelThickness:
                  size *
                    0.06,
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
          index < petals.length;
          index++
        ) {
          const cell =
            petals[
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

          const angle =
            Math.atan2(
              0.5 -
                cell.v,
              cell.u -
                0.5,
            );

          const breathing =
            0.76 +
            0.24 *
              Math.sin(
                timing.seconds *
                  1.12 +
                angle *
                  7 +
                cell.phase,
              );

          const z =
            Math.sin(
              angle *
                7 +
              timing.seconds *
                0.72,
            ) *
              (
                0.3 +
                cell.edge *
                  0.62
              ) *
              influence;

          dummy.position.set(
            cell.x,
            cell.y,
            z,
          );

          dummy.rotation.set(
            angle *
              0.16 *
              influence,

            timing.seconds *
              0.18 *
              influence,

            angle +
              timing.seconds *
                0.12,
          );

          const scale =
            breathing *
              influence;

          dummy.scale.setScalar(
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
        petals,
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
            petals.length,
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
          resolveStyle="superformula"
        />
      </>
    );
  };

export const SuperformulaPetalVolume:
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

export default SuperformulaPetalVolume;

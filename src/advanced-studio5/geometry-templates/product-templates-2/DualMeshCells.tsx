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
            46,
          ),
        [
          image,
          product,
        ],
      );

    const geometry =
      useMemo(
        () => {
          const width =
            field.cellWidth *
            1.55;

          const height =
            field.cellHeight *
            1.55;

          const shape =
            new THREE.Shape();

          shape.moveTo(
            0,
            height /
              2,
          );

          shape.lineTo(
            width /
              2,
            0,
          );

          shape.lineTo(
            0,
            -height /
              2,
          );

          shape.lineTo(
            -width /
              2,
            0,
          );

          shape.closePath();

          const depth =
            Math.min(
              width,
              height,
            ) *
            0.75;

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
                  Math.min(
                    width,
                    height,
                  ) *
                  0.07,

                bevelThickness:
                  Math.min(
                    width,
                    height,
                  ) *
                  0.07,
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

    /*
     * Dual topology:
     * use alternating source-grid vertices rather
     * than every source cell, producing a visibly
     * different secondary polygon lattice.
     */
    const cells =
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
          cells.length;
          index++
        ) {
          const cell =
            cells[
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

          const radius =
            Math.sqrt(
              radialX *
                radialX +
              radialY *
                radialY,
            );

          const wave =
            Math.sin(
              timing.seconds *
                1.15 +
              radius *
                9 +
              cell.phase,
            );

          const z =
            (
              0.55 +
              radius *
                1.4 +
              (
                wave +
                1
              ) *
                0.38
            ) *
            influence;

          const scale =
            (
              0.72 +
              0.2 *
                Math.cos(
                  timing.seconds *
                    1.3 +
                  cell.phase,
                )
            ) *
            influence;

          dummy.position.set(
            cell.x +
              radialX *
                wave *
                0.34 *
                influence,

            cell.y +
              radialY *
                wave *
                0.34 *
                influence,

            z,
          );

          dummy.rotation.set(
            radialY *
              wave *
              0.5 *
              influence,

            -radialX *
              wave *
              0.5 *
              influence,

            wave *
              0.12 *
              influence,
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
        cells,
        color,
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
            cells.length,
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
          resolveStyle="dual-cells"
        />
      </>
    );
  };

export const DualMeshCells:
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

export default DualMeshCells;

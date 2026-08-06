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
  type ProductFieldCell,
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

type GrainProps = {
  cells:
    ProductFieldCell[];

  geometry:
    THREE.BufferGeometry;

  timing:
    PT2Timing;
};

const GrainMesh:
  React.FC<
    GrainProps
  > = ({
    cells,
    geometry,
    timing,
  }) => {
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
          index < cells.length;
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

          const orbit =
            timing.seconds *
              0.72 +
            cell.phase;

          const depth =
            (
              0.35 +
              cell.edge *
                0.8 +
              cell.contrast *
                0.55
            ) *
              influence;

          dummy.position.set(
            cell.x +
              Math.cos(
                orbit,
              ) *
                0.12 *
                influence,

            cell.y +
              Math.sin(
                orbit,
              ) *
                0.12 *
                influence,

            Math.sin(
              orbit *
                1.3,
            ) *
              depth,
          );

          dummy.rotation.set(
            orbit *
              0.28 *
              influence,

            orbit *
              0.21 *
              influence,

            orbit *
              0.16 *
              influence,
          );

          const scale =
            (
              0.68 +
              cell.edge *
                0.32
            ) *
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
        cells,
        color,
        dummy,
        timing.geometryInfluence,
        timing.seconds,
      ],
    );

    return (
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
            42,
          ),
        [
          image,
          product,
        ],
      );

    const size =
      Math.min(
        field.cellWidth,
        field.cellHeight,
      ) *
        0.52;

    const tetra =
      useMemo(
        () =>
          new THREE.TetrahedronGeometry(
            size,
            0,
          ),
        [
          size,
        ],
      );

    const octa =
      useMemo(
        () =>
          new THREE.OctahedronGeometry(
            size,
            0,
          ),
        [
          size,
        ],
      );

    const icosa =
      useMemo(
        () =>
          new THREE.IcosahedronGeometry(
            size,
            0,
          ),
        [
          size,
        ],
      );

    const tetraCells =
      field.cells.filter(
        (
          cell,
        ) =>
          (
            cell.row +
              cell.column
          ) %
            3 ===
          0,
      );

    const octaCells =
      field.cells.filter(
        (
          cell,
        ) =>
          (
            cell.row +
              cell.column
          ) %
            3 ===
          1,
      );

    const icosaCells =
      field.cells.filter(
        (
          cell,
        ) =>
          (
            cell.row +
              cell.column
          ) %
            3 ===
          2,
      );

    return (
      <>
        <GrainMesh
          cells={
            tetraCells
          }
          geometry={
            tetra
          }
          timing={
            timing
          }
        />

        <GrainMesh
          cells={
            octaCells
          }
          geometry={
            octa
          }
          timing={
            timing
          }
        />

        <GrainMesh
          cells={
            icosaCells
          }
          geometry={
            icosa
          }
          timing={
            timing
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
          resolveStyle="polyhedral"
        />
      </>
    );
  };

export const PolyhedralGranularBody:
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

export default PolyhedralGranularBody;

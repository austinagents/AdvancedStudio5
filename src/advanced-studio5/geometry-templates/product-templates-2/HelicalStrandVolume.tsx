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

type Segment = {
  a:
    ReturnType<
      typeof buildProductField
    >["cells"][number];

  b:
    ReturnType<
      typeof buildProductField
    >["cells"][number];

  strand: number;
};

const UP =
  new THREE.Vector3(
    0,
    1,
    0,
  );

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
            50,
          ),
        [
          image,
          product,
        ],
      );

    const segments =
      useMemo(
        () => {
          const byColumn =
            new Map<
              number,
              typeof field.cells
            >();

          for (
            const cell of
            field.cells
          ) {
            const column =
              byColumn.get(
                cell.column,
              ) ??
              [];

            column.push(
              cell,
            );

            byColumn.set(
              cell.column,
              column,
            );
          }

          const result:
            Segment[] =
            [];

          for (
            const [
              columnNumber,
              cells,
            ] of
            byColumn
          ) {
            cells.sort(
              (
                a,
                b,
              ) =>
                a.row -
                b.row,
            );

            for (
              let index = 0;
              index <
              cells.length -
                1;
              index++
            ) {
              const a =
                cells[
                  index
                ];

              const b =
                cells[
                  index +
                    1
                ];

              if (
                b.row -
                  a.row >
                2
              ) {
                continue;
              }

              result.push({
                a,
                b,
                strand:
                  columnNumber,
              });
            }
          }

          return result;
        },
        [
          field.cells,
        ],
      );

    const geometry =
      useMemo(
        () =>
          new THREE.CylinderGeometry(
            0.021,
            0.021,
            1,
            8,
            1,
            false,
          ),
        [],
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

    const start =
      useMemo(
        () =>
          new THREE.Vector3(),
        [],
      );

    const end =
      useMemo(
        () =>
          new THREE.Vector3(),
        [],
      );

    const midpoint =
      useMemo(
        () =>
          new THREE.Vector3(),
        [],
      );

    const direction =
      useMemo(
        () =>
          new THREE.Vector3(),
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
          segments.length;
          index++
        ) {
          const segment =
            segments[
              index
            ];

          setExactProductRGB(
            color,
            segment.a,
          );

          mesh.setColorAt(
            index,
            color,
          );

          const sign =
            segment.strand %
              2 ===
            0
              ? 1
              : -1;

          const strandPhase =
            segment.strand /
            Math.max(
              1,
              field.columns -
                1,
            ) *
            Math.PI *
            2;

          const pointFor = (
            cell:
              typeof segment.a,
            target:
              THREE.Vector3,
          ) => {
            const theta =
              sign *
              (
                cell.v *
                  Math.PI *
                  5.6 +
                timing.seconds *
                  0.82
              ) +
              strandPhase;

            const radius =
              (
                0.28 +
                cell.edge *
                  0.4 +
                cell.contrast *
                  0.2
              ) *
              influence;

            target.set(
              cell.x +
                Math.cos(
                  theta,
                ) *
                radius,

              cell.y,

              Math.sin(
                theta,
              ) *
              radius *
              1.8,
            );
          };

          pointFor(
            segment.a,
            start,
          );

          pointFor(
            segment.b,
            end,
          );

          midpoint
            .copy(
              start,
            )
            .add(
              end,
            )
            .multiplyScalar(
              0.5,
            );

          direction
            .copy(
              end,
            )
            .sub(
              start,
            );

          const length =
            Math.max(
              0.001,
              direction.length(),
            );

          direction.normalize();

          dummy.position.copy(
            midpoint,
          );

          dummy.quaternion.setFromUnitVectors(
            UP,
            direction,
          );

          dummy.scale.set(
            influence,
            length *
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
        direction,
        dummy,
        end,
        field.columns,
        midpoint,
        segments,
        start,
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
            segments.length,
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
          resolveStyle="helical-strands"
        />
      </>
    );
  };

export const HelicalStrandVolume:
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

export default HelicalStrandVolume;

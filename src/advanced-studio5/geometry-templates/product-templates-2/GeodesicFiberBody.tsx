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
  source:
    ReturnType<
      typeof buildProductField
    >["cells"][number];

  a:
    THREE.Vector3;

  b:
    THREE.Vector3;

  phase: number;
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
            48,
          ),
        [
          image,
          product,
        ],
      );

    const segments =
      useMemo(
        () => {
          const byRow =
            new Map<
              number,
              typeof field.cells
            >();

          for (
            const cell of
            field.cells
          ) {
            const row =
              byRow.get(
                cell.row,
              ) ??
              [];

            row.push(
              cell,
            );

            byRow.set(
              cell.row,
              row,
            );
          }

          const result:
            Segment[] =
            [];

          for (
            const [
              rowNumber,
              rowCells,
            ] of
            byRow
          ) {
            rowCells.sort(
              (
                a,
                b,
              ) =>
                a.column -
                b.column,
            );

            const root =
              rowCells[
                Math.floor(
                  rowCells.length /
                  2,
                )
              ];

            if (!root) {
              continue;
            }

            /*
             * Feature-weighted paths travel from
             * source product cells toward the
             * row's medial/root cell.
             *
             * Each step is a physical tube segment.
             */
            for (
              let startIndex = 0;
              startIndex <
              rowCells.length;
              startIndex += 2
            ) {
              const source =
                rowCells[
                  startIndex
                ];

              if (
                source.edge +
                  source.contrast <
                  0.12 &&
                startIndex %
                  4 !==
                  0
              ) {
                continue;
              }

              const direction =
                source.column <
                root.column
                  ? 1
                  : -1;

              let current =
                source;

              while (
                current.column !==
                root.column
              ) {
                const targetColumn =
                  current.column +
                  direction;

                const next =
                  rowCells.find(
                    (
                      candidate,
                    ) =>
                      candidate.column ===
                      targetColumn,
                  );

                if (!next) {
                  break;
                }

                result.push({
                  source,

                  a:
                    new THREE.Vector3(
                      current.x,
                      current.y,
                      0,
                    ),

                  b:
                    new THREE.Vector3(
                      next.x,
                      next.y,
                      0,
                    ),

                  phase:
                    source.phase +
                    rowNumber *
                      0.09,
                });

                current =
                  next;
              }
            }
          }

          /*
           * Add longitudinal spine connections
           * between row medials.
           */
          for (
            let row = 0;
            row <
            field.rows -
              1;
            row++
          ) {
            const current =
              byRow.get(
                row,
              );

            const next =
              byRow.get(
                row +
                  1,
              );

            if (
              !current ||
              !next
            ) {
              continue;
            }

            const a =
              current[
                Math.floor(
                  current.length /
                  2,
                )
              ];

            const b =
              next[
                Math.floor(
                  next.length /
                  2,
                )
              ];

            if (
              !a ||
              !b
            ) {
              continue;
            }

            result.push({
              source:
                a,

              a:
                new THREE.Vector3(
                  a.x,
                  a.y,
                  0,
                ),

              b:
                new THREE.Vector3(
                  b.x,
                  b.y,
                  0,
                ),

              phase:
                row *
                0.17,
            });
          }

          return result;
        },
        [
          field.cells,
          field.rows,
        ],
      );

    const geometry =
      useMemo(
        () =>
          new THREE.CylinderGeometry(
            0.022,
            0.022,
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
            segment.source,
          );

          mesh.setColorAt(
            index,
            color,
          );

          start.copy(
            segment.a,
          );

          end.copy(
            segment.b,
          );

          const waveA =
            Math.sin(
              timing.seconds *
                1.22 +
              segment.phase,
            );

          const waveB =
            Math.sin(
              timing.seconds *
                1.22 +
              segment.phase +
                0.72,
            );

          start.z =
            waveA *
            0.42 *
            influence;

          end.z =
            waveB *
            0.42 *
            influence;

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

          const radiusScale =
            (
              0.65 +
              0.35 *
                Math.sin(
                  timing.seconds *
                    0.95 +
                  segment.phase,
                )
            ) *
            influence;

          dummy.scale.set(
            Math.max(
              0.001,
              radiusScale,
            ),

            length *
            influence,

            Math.max(
              0.001,
              radiusScale,
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
        direction,
        dummy,
        end,
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
          resolveStyle="fiber-body"
        />
      </>
    );
  };

export const GeodesicFiberBody:
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

export default GeodesicFiberBody;

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

type Node =
  ReturnType<
    typeof buildProductField
  >["cells"][number];

type Segment = {
  a:
    Node;

  b:
    Node;

  cable:
    boolean;
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
            24,
          ),
        [
          image,
          product,
        ],
      );

    const nodes =
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

    const segments =
      useMemo(
        () => {
          const map =
            new Map<
              string,
              Node
            >();

          for (
            const node of
            nodes
          ) {
            map.set(
              `${node.row}:${node.column}`,
              node,
            );
          }

          const result:
            Segment[] =
            [];

          for (
            const node of
            nodes
          ) {
            const targets = [
              [
                node.row +
                  2,
                node.column,
                false,
              ],
              [
                node.row +
                  1,
                node.column +
                  1,
                true,
              ],
              [
                node.row +
                  1,
                node.column -
                  1,
                true,
              ],
            ] as const;

            for (
              const [
                row,
                column,
                cable,
              ] of
              targets
            ) {
              const target =
                map.get(
                  `${row}:${column}`,
                );

              if (!target) {
                continue;
              }

              result.push({
                a:
                  node,

                b:
                  target,

                cable,
              });
            }
          }

          return result;
        },
        [
          nodes,
        ],
      );

    const strutGeometry =
      useMemo(
        () =>
          new THREE.CylinderGeometry(
            0.026,
            0.026,
            1,
            8,
            1,
            false,
          ),
        [],
      );

    const cableGeometry =
      useMemo(
        () =>
          new THREE.CylinderGeometry(
            0.008,
            0.008,
            1,
            6,
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

    const struts =
      segments.filter(
        (
          segment,
        ) =>
          !segment.cable,
      );

    const cables =
      segments.filter(
        (
          segment,
        ) =>
          segment.cable,
      );

    const strutRef =
      useRef<
        THREE.InstancedMesh
      >(
        null,
      );

    const cableRef =
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

    const a =
      useMemo(
        () =>
          new THREE.Vector3(),
        [],
      );

    const b =
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
        const influence =
          timing.geometryInfluence;

        const update = (
          mesh:
            THREE.InstancedMesh |
            null,

          list:
            Segment[],
        ) => {
          if (!mesh) {
            return;
          }

          for (
            let index = 0;
            index < list.length;
            index++
          ) {
            const segment =
              list[
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

            const nodePoint = (
              node:
                Node,
              target:
                THREE.Vector3,
            ) => {
              const parity =
                (
                  node.row +
                    node.column
                ) %
                  3 -
                1;

              target.set(
                node.x +
                  Math.sin(
                    timing.seconds *
                      0.75 +
                    node.phase,
                  ) *
                    0.08 *
                    influence,

                node.y +
                  Math.cos(
                    timing.seconds *
                      0.62 +
                    node.phase,
                  ) *
                    0.05 *
                    influence,

                parity *
                  0.72 *
                  influence +
                Math.sin(
                  timing.seconds *
                    1.05 +
                  node.phase,
                ) *
                  0.12 *
                  influence,
              );
            };

            nodePoint(
              segment.a,
              a,
            );

            nodePoint(
              segment.b,
              b,
            );

            midpoint
              .copy(
                a,
              )
              .add(
                b,
              )
              .multiplyScalar(
                0.5,
              );

            direction
              .copy(
                b,
              )
              .sub(
                a,
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
        };

        update(
          strutRef.current,
          struts,
        );

        update(
          cableRef.current,
          cables,
        );
      },
      [
        a,
        b,
        cables,
        color,
        direction,
        dummy,
        midpoint,
        struts,
        timing.geometryInfluence,
        timing.seconds,
      ],
    );

    return (
      <>
        <instancedMesh
          ref={
            strutRef
          }
          args={[
            strutGeometry,
            material,
            struts.length,
          ]}
          frustumCulled={
            false
          }
        />

        <instancedMesh
          ref={
            cableRef
          }
          args={[
            cableGeometry,
            material,
            cables.length,
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
          resolveStyle="tensegrity-cage"
        />
      </>
    );
  };

export const TensegrityProductCage:
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

export default TensegrityProductCage;

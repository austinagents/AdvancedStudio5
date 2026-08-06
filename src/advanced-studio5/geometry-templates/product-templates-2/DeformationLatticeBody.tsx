import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

import {
  PT2PhysicalScene,
  createExactRGBMaterial,
  createProductSampler,
  setExactProductRGB,
  type ProductSample,
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

type Node = {
  row: number;
  column: number;

  u: number;
  v: number;

  x: number;
  y: number;

  sample:
    ProductSample;

  phase: number;
};

type Segment = {
  a:
    Node;

  b:
    Node;
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
    const sampler =
      useMemo(
        () =>
          createProductSampler(
            image,
            product,
          ),
        [
          image,
          product,
        ],
      );

    const {
      nodes,
      segments,
    } =
      useMemo(
        () => {
          const rows =
            16;

          const columns =
            9;

          const nodeList:
            Node[] =
            [];

          const map =
            new Map<
              string,
              Node
            >();

          for (
            let row = 0;
            row < rows;
            row++
          ) {
            for (
              let column = 0;
              column < columns;
              column++
            ) {
              const u =
                column /
                  (
                    columns -
                      1
                  );

              const v =
                row /
                  (
                    rows -
                      1
                  );

              const sample =
                sampler.sampleVisible(
                  u,
                  v,
                );

              if (
                sample.alpha <
                0.05
              ) {
                continue;
              }

              const node: Node = {
                row,
                column,

                u,
                v,

                x:
                  product.offsetX +
                  (
                    u -
                      0.5
                  ) *
                    product.visibleWidth,

                y:
                  product.offsetY +
                  (
                    0.5 -
                      v
                  ) *
                    product.visibleHeight,

                sample,

                phase:
                  row *
                    0.37 +
                  column *
                    0.61,
              };

              nodeList.push(
                node,
              );

              map.set(
                `${row}:${column}`,
                node,
              );
            }
          }

          const segmentList:
            Segment[] =
            [];

          for (
            const node of
            nodeList
          ) {
            const right =
              map.get(
                `${node.row}:${node.column + 1}`,
              );

            const down =
              map.get(
                `${node.row + 1}:${node.column}`,
              );

            if (
              right
            ) {
              segmentList.push({
                a:
                  node,
                b:
                  right,
              });
            }

            if (
              down
            ) {
              segmentList.push({
                a:
                  node,
                b:
                  down,
              });
            }
          }

          return {
            nodes:
              nodeList,

            segments:
              segmentList,
          };
        },
        [
          product,
          sampler,
        ],
      );

    const geometry =
      useMemo(
        () =>
          new THREE.CylinderGeometry(
            0.016,
            0.016,
            1,
            7,
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
        const mesh =
          meshRef.current;

        if (!mesh) {
          return;
        }

        const influence =
          timing.geometryInfluence;

        const deform = (
          node:
            Node,
          target:
            THREE.Vector3,
        ) => {
          const twist =
            (
              node.v -
                0.5
            ) *
              Math.PI *
              1.4 *
              influence;

          const localX =
            node.x -
              product.offsetX;

          const cos =
            Math.cos(
              twist,
            );

          const sin =
            Math.sin(
              twist,
            );

          target.set(
            product.offsetX +
              localX *
                cos,

            node.y +
              Math.sin(
                timing.seconds *
                  0.8 +
                node.phase,
              ) *
                0.1 *
                influence,

            localX *
              sin +
              Math.cos(
                timing.seconds *
                  0.65 +
                node.phase,
              ) *
                0.12 *
                influence,
          );
        };

        for (
          let index = 0;
          index < segments.length;
          index++
        ) {
          const segment =
            segments[
              index
            ];

          setExactProductRGB(
            color,
            segment.a.sample,
          );

          mesh.setColorAt(
            index,
            color,
          );

          deform(
            segment.a,
            a,
          );

          deform(
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
      },
      [
        a,
        b,
        color,
        direction,
        dummy,
        midpoint,
        product.offsetX,
        segments,
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
          resolveStyle="lattice"
        />
      </>
    );
  };

export const DeformationLatticeBody:
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

export default DeformationLatticeBody;

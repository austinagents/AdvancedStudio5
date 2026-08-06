import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

import {
  PT2PhysicalFormation,
  PT2PhysicalScene,
  createProductSampler,
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
      ReturnType<
        typeof createProductSampler
      >["sampleVisible"]
    >;

  a:
    THREE.Vector3;

  b:
    THREE.Vector3;

  ring: number;
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

    const segments =
      useMemo(
        () => {
          const silhouette =
            product.silhouette;

          const center =
            silhouette.reduce(
              (
                result,
                point,
              ) => {
                result.x +=
                  point[0];

                result.y +=
                  point[1];

                return result;
              },
              {
                x: 0,
                y: 0,
              },
            );

          center.x /=
            silhouette.length;

          center.y /=
            silhouette.length;

          const scales = [
            0.52,
            0.62,
            0.72,
            0.82,
            0.92,
            1.02,
          ];

          const result:
            Segment[] =
            [];

          for (
            let ring = 0;
            ring <
            scales.length;
            ring++
          ) {
            const scale =
              scales[
                ring
              ];

            for (
              let index = 0;
              index <
              silhouette.length;
              index++
            ) {
              const sourcePoint =
                silhouette[
                  index
                ];

              const nextPoint =
                silhouette[
                  (
                    index +
                    1
                  ) %
                  silhouette.length
                ];

              const x0 =
                center.x +
                (
                  sourcePoint[0] -
                  center.x
                ) *
                scale;

              const y0 =
                center.y +
                (
                  sourcePoint[1] -
                  center.y
                ) *
                scale;

              const x1 =
                center.x +
                (
                  nextPoint[0] -
                  center.x
                ) *
                scale;

              const y1 =
                center.y +
                (
                  nextPoint[1] -
                  center.y
                ) *
                scale;

              const midpointX =
                (
                  x0 +
                  x1
                ) /
                2;

              const midpointY =
                (
                  y0 +
                  y1
                ) /
                2;

              const u =
                (
                  midpointX -
                  product.offsetX
                ) /
                  product.visibleWidth +
                0.5;

              const v =
                0.5 -
                (
                  midpointY -
                  product.offsetY
                ) /
                  product.visibleHeight;

              const sample =
                sampler.sampleVisible(
                  u,
                  v,
                );

              result.push({
                source:
                  sample,

                a:
                  new THREE.Vector3(
                    x0,
                    y0,
                    0,
                  ),

                b:
                  new THREE.Vector3(
                    x1,
                    y1,
                    0,
                  ),

                ring,

                phase:
                  index *
                    0.12 +
                  ring *
                    0.7,
              });
            }
          }

          return result;
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
            0.018,
            0.018,
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

          const baseZ =
            (
              segment.ring -
              2.5
            ) *
            0.26;

          const wave =
            Math.sin(
              timing.seconds *
                1.08 +
              segment.phase,
            );

          start.z =
            (
              baseZ +
              wave *
                0.14
            ) *
            influence;

          end.z =
            (
              baseZ +
              Math.sin(
                timing.seconds *
                  1.08 +
                segment.phase +
                  0.45,
              ) *
                0.14
            ) *
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
          resolveStyle="contour-ribs"
        />
      </>
    );
  };

export const ContourRibArchitecture:
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

export default ContourRibArchitecture;

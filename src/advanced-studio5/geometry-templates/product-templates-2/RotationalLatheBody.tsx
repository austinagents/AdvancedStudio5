import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

import {
  PT2PhysicalScene,
  createProductSampler,
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

    const lathe =
      useMemo(
        () => {
          const profile:
            THREE.Vector2[] =
            [];

          const rows =
            52;

          for (
            let row = 0;
            row < rows;
            row++
          ) {
            const v =
              row /
                (
                  rows -
                    1
                );

            let left =
              0.5;

            let right =
              0.5;

            let found =
              false;

            for (
              let index = 0;
              index < 64;
              index++
            ) {
              const u =
                index /
                  63;

              if (
                sampler.sampleVisible(
                  u,
                  v,
                ).alpha >
                0.08
              ) {
                if (
                  !found
                ) {
                  left =
                    u;
                  found =
                    true;
                }

                right =
                  u;
              }
            }

            const radius =
              found
                ? Math.max(
                    0.035,
                    (
                      right -
                        left
                    ) *
                      product.visibleWidth *
                      0.5,
                  )
                : 0.035;

            const y =
              (
                0.5 -
                  v
              ) *
                product.visibleHeight;

            profile.push(
              new THREE.Vector2(
                radius,
                y,
              ),
            );
          }

          const geometry =
            new THREE.LatheGeometry(
              profile,
              64,
            );

          const position =
            geometry.getAttribute(
              "position",
            );

          const colors:
            number[] =
            [];

          for (
            let index = 0;
            index < position.count;
            index++
          ) {
            const x =
              position.getX(
                index,
              );

            const y =
              position.getY(
                index,
              );

            const z =
              position.getZ(
                index,
              );

            const angle =
              Math.atan2(
                z,
                x,
              );

            const u =
              (
                angle /
                  (
                    Math.PI *
                      2
                  ) +
                1
              ) %
                1;

            const v =
              THREE.MathUtils.clamp(
                0.5 -
                  y /
                    product.visibleHeight,
                0,
                1,
              );

            const sample =
              sampler.sampleVisible(
                u,
                v,
              );

            const color =
              new THREE.Color(
                sample.red,
                sample.green,
                sample.blue,
              );

            color.convertSRGBToLinear();

            colors.push(
              color.r,
              color.g,
              color.b,
            );
          }

          geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(
              colors,
              3,
            ),
          );

          return geometry;
        },
        [
          product.visibleHeight,
          product.visibleWidth,
          sampler,
        ],
      );

    const material =
      useMemo(
        () =>
          new THREE.MeshBasicMaterial({
            vertexColors:
              true,

            toneMapped:
              false,

            side:
              THREE.DoubleSide,
          }),
        [],
      );

    const meshRef =
      useRef<
        THREE.Mesh
      >(
        null,
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

        mesh.rotation.y =
          timing.seconds *
            0.66 *
            influence;

        mesh.rotation.x =
          Math.sin(
            timing.seconds *
              0.45,
          ) *
            0.12 *
            influence;

        mesh.scale.set(
          influence,
          influence,
          influence,
        );
      },
      [
        timing.geometryInfluence,
        timing.seconds,
      ],
    );

    return (
      <>
        <mesh
          ref={
            meshRef
          }
          geometry={
            lathe
          }
          material={
            material
          }
          position={[
            product.offsetX,
            product.offsetY,
            0,
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
          resolveStyle="lathe-unroll"
        />
      </>
    );
  };

export const RotationalLatheBody:
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

export default RotationalLatheBody;

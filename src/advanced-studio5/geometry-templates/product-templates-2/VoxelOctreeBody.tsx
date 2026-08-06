import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

import {
  RoundedBoxGeometry,
} from "three-stdlib";

import {
  PT2PhysicalFormation,
  PT2PhysicalScene,
  createExactRGBMaterial,
  createProductSampler,
  setExactProductRGB,
  type PT2Timing,
} from "./PT2PhysicalSystemsSupport";

import type {
  PT2LoadedProduct,
} from "./ProductTemplates2Runtime";

type Props = {
  imageSrc: string;
};

type Leaf = {
  u: number;
  v: number;

  x: number;
  y: number;

  width: number;
  height: number;

  level: number;

  source:
    ReturnType<
      ReturnType<
        typeof createProductSampler
      >["sampleVisible"]
    >;
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

    const leaves =
      useMemo(
        () => {
          const result:
            Leaf[] =
            [];

          const visit = (
            u0: number,
            u1: number,
            v0: number,
            v1: number,
            level: number,
          ) => {
            const u =
              (
                u0 +
                u1
              ) /
              2;

            const v =
              (
                v0 +
                v1
              ) /
              2;

            const center =
              sampler.sampleVisible(
                u,
                v,
              );

            const corners = [
              sampler.sampleVisible(
                u0,
                v0,
              ),
              sampler.sampleVisible(
                u1,
                v0,
              ),
              sampler.sampleVisible(
                u1,
                v1,
              ),
              sampler.sampleVisible(
                u0,
                v1,
              ),
            ];

            const lumas =
              corners.map(
                (
                  sample,
                ) =>
                  sample.luma,
              );

            const spread =
              Math.max(
                ...lumas,
              ) -
              Math.min(
                ...lumas,
              );

            const detail =
              spread *
                1.6 +
              center.edge *
                1.5 +
              center.contrast;

            const subdivide =
              level <
                2 ||
              (
                level <
                  5 &&
                detail >
                  0.22
              );

            if (
              subdivide
            ) {
              const um =
                (
                  u0 +
                  u1
                ) /
                2;

              const vm =
                (
                  v0 +
                  v1
                ) /
                2;

              visit(
                u0,
                um,
                v0,
                vm,
                level +
                  1,
              );

              visit(
                um,
                u1,
                v0,
                vm,
                level +
                  1,
              );

              visit(
                u0,
                um,
                vm,
                v1,
                level +
                  1,
              );

              visit(
                um,
                u1,
                vm,
                v1,
                level +
                  1,
              );

              return;
            }

            if (
              center.alpha <
              0.06
            ) {
              return;
            }

            result.push({
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

              width:
                (
                  u1 -
                  u0
                ) *
                product.visibleWidth,

              height:
                (
                  v1 -
                  v0
                ) *
                product.visibleHeight,

              level,

              source:
                center,
            });
          };

          visit(
            0,
            1,
            0,
            1,
            0,
          );

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
          new RoundedBoxGeometry(
            1,
            1,
            1,
            2,
            0.08,
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
          leaves.length;
          index++
        ) {
          const leaf =
            leaves[
              index
            ];

          setExactProductRGB(
            color,
            leaf.source,
          );

          mesh.setColorAt(
            index,
            color,
          );

          const hierarchyWave =
            0.72 +
            0.28 *
              Math.sin(
                timing.seconds *
                  1.17 +
                leaf.level *
                  0.95 +
                leaf.u *
                  7,
              );

          const z =
            (
              0.18 +
              (
                5 -
                leaf.level
              ) *
                0.16 +
              leaf.source.edge *
                0.32
            ) *
            hierarchyWave *
            influence;

          dummy.position.set(
            leaf.x,
            leaf.y,
            z,
          );

          dummy.rotation.set(
            (
              leaf.level -
              2.5
            ) *
              0.035 *
              influence,

            (
              leaf.u -
              0.5
            ) *
              0.16 *
              influence,

            0,
          );

          dummy.scale.set(
            leaf.width *
              0.9 *
              influence,

            leaf.height *
              0.9 *
              influence,

            Math.max(
              0.015,
              z *
                1.4,
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
        leaves,
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
            leaves.length,
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
          resolveStyle="octree-body"
        />
      </>
    );
  };

export const VoxelOctreeBody:
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

export default VoxelOctreeBody;

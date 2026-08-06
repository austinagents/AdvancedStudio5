import React, {
  useLayoutEffect,
  useMemo,
} from "react";

import * as THREE from "three";

import {
  MarchingCubes,
} from "three/addons/objects/MarchingCubes.js";

import {
  PT2PhysicalScene,
  buildProductField,
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
    const field =
      useMemo(
        () =>
          buildProductField(
            image,
            product,
            28,
          ),
        [
          image,
          product,
        ],
      );

    const balls =
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
                3 ===
              0,
          ),
        [
          field.cells,
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

    const marching =
      useMemo(
        () => {
          const object =
            new MarchingCubes(
              34,
              material,
              false,
              true,
              180000,
            );

          object.isolation =
            78;

          object.position.set(
            product.offsetX,
            product.offsetY,
            0,
          );

          object.scale.set(
            product.visibleWidth /
              2,

            product.visibleHeight /
              2,

            Math.min(
              product.visibleWidth,
              product.visibleHeight,
            ) *
              0.48,
          );

          object.frustumCulled =
            false;

          return object;
        },
        [
          material,
          product.offsetX,
          product.offsetY,
          product.visibleHeight,
          product.visibleWidth,
        ],
      );

    useLayoutEffect(
      () => {
        marching.reset();

        const influence =
          timing.geometryInfluence;

        for (
          const cell of
          balls
        ) {
          const color =
            new THREE.Color(
              cell.red,
              cell.green,
              cell.blue,
            );

          color.convertSRGBToLinear();

          const z =
            0.5 +
            Math.sin(
              timing.seconds *
                1.0 +
              cell.phase,
            ) *
              0.16 *
              influence;

          const strength =
            0.38 +
            cell.edge *
              0.16 +
            cell.contrast *
              0.1;

          marching.addBall(
            cell.u,
            1 -
              cell.v,
            z,
            strength,
            12,
            color,
          );
        }

        marching.scale.z =
          Math.max(
            0.001,
            Math.min(
              product.visibleWidth,
              product.visibleHeight,
            ) *
              0.48 *
              influence,
          );

        marching.update();
      },
      [
        balls,
        marching,
        product.visibleHeight,
        product.visibleWidth,
        timing.geometryInfluence,
        timing.seconds,
      ],
    );

    return (
      <>
        <primitive
          object={
            marching
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
          resolveStyle="metaball-body"
        />
      </>
    );
  };

export const ImplicitMetaballBody:
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

export default ImplicitMetaballBody;

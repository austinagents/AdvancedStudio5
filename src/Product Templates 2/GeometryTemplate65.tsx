import React, {useMemo} from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import * as THREE from "three";

import {
  createPT2ExactProductMaterial,
  getPT2Timing,
  type ProductAnalysis,
} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Core";

import {
  PT2Canvas,
  PT2ExactProduct,
} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Runtime";

const RibbonField: React.FC<{
  texture: THREE.Texture;
  product: ProductAnalysis;
  phase1: number;
  phase2: number;
  phase3: number;
  influence: number;
  seconds: number;
}> = ({
  texture,
  product,
  phase1,
  phase2,
  phase3,
  influence,
  seconds,
}) => {
  const material = useMemo(
    () =>
      createPT2ExactProductMaterial(
        texture,
      ),
    [texture],
  );

  const ribbons = 12;

  return (
    <>
      {Array.from({length: ribbons}, (_, index) => {
        const u0 =
          index /
          ribbons;

        const u1 =
          (index + 1) /
          ribbons;

        const geometry =
          new THREE.PlaneGeometry(
            product.planeWidth /
              ribbons,
            product.planeHeight,
            1,
            30,
          );

        const position =
          geometry.attributes.position as
            THREE.BufferAttribute;

        const uv =
          geometry.attributes.uv as
            THREE.BufferAttribute;

        for (
          let i = 0;
          i < position.count;
          i++
        ) {
          const localU =
            uv.getX(i);

          const localV =
            uv.getY(i);

          uv.setXY(
            i,
            u0 +
              (u1 - u0) *
                localU,
            localV,
          );

          const wave =
            Math.sin(
              localV *
                Math.PI *
                3 +
              index *
                0.55 +
              seconds *
                1.6,
            );

          position.setZ(
            i,
            wave *
              (
                0.95 *
                  phase1 +
                0.4 *
                  phase2
              ) *
              influence,
          );

          position.setX(
            i,
            position.getX(i) +
              wave *
                0.07 *
                phase3 *
                influence,
          );
        }

        position.needsUpdate =
          true;

        uv.needsUpdate =
          true;

        const worldX =
          (
            (u0 + u1) /
              2 -
            0.5
          ) *
            product.planeWidth +
          product.offsetX;

        const side =
          index % 2 === 0
            ? -1
            : 1;

        return (
          <mesh
            key={index}
            geometry={geometry}
            material={material}
            position={[
              worldX,
              product.offsetY,
              side *
                0.35 *
                phase2 *
                influence,
            ]}
            rotation={[
              0,
              side *
                0.14 *
                phase2 *
                influence,
              0,
            ]}
            frustumCulled={false}
          />
        );
      })}
    </>
  );
};

export const GeometryTemplate65: React.FC<{imageSrc?: string}> = ({imageSrc}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const timing = getPT2Timing(frame, fps);

  return (
    <PT2Canvas imageSrc={imageSrc} width={width} height={height}>
      {({texture, product}) =>
        timing.holding ? (
          <PT2ExactProduct texture={texture} product={product} />
        ) : (
          <RibbonField
            texture={texture}
            product={product}
            phase1={timing.phase1}
            phase2={timing.phase2}
            phase3={timing.phase3}
            influence={timing.geometryInfluence}
            seconds={timing.seconds}
          />
        )
      }
    </PT2Canvas>
  );
};

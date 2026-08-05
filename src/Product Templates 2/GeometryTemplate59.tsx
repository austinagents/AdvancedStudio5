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

const createTriangle = (
  product: ProductAnalysis,
  points: Array<readonly [number, number]>,
) => {
  const positions = new Float32Array(
    points.flatMap(([u, v]) => [
      (u - 0.5) * product.planeWidth,
      (v - 0.5) * product.planeHeight,
      0,
    ]),
  );

  const uvs = new Float32Array(
    points.flatMap(([u, v]) => [u, v]),
  );

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );

  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(uvs, 2),
  );

  return geometry;
};

const FacetField: React.FC<{
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
  const facets = useMemo(() => {
    const columns = 7;
    const rows = 14;

    const output: Array<{
      geometry: THREE.BufferGeometry;
      seed: number;
      cx: number;
      cy: number;
    }> = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const u0 = x / columns;
        const u1 = (x + 1) / columns;
        const v0 = y / rows;
        const v1 = (y + 1) / rows;

        const flip = (x + y) % 2 === 0;

        const sets = flip
          ? [
              [[u0, v0], [u1, v0], [u1, v1]],
              [[u0, v0], [u1, v1], [u0, v1]],
            ]
          : [
              [[u0, v0], [u1, v0], [u0, v1]],
              [[u1, v0], [u1, v1], [u0, v1]],
            ];

        sets.forEach((set, triangleIndex) => {
          const seed =
            ((x * 31 + y * 17 + triangleIndex * 7) % 97) / 97;

          output.push({
            geometry: createTriangle(
              product,
              set as Array<readonly [number, number]>,
            ),
            seed,
            cx: (u0 + u1) / 2 - 0.5,
            cy: (v0 + v1) / 2 - 0.5,
          });
        });
      }
    }

    return output;
  }, [product]);

  const material = useMemo(
    () => createPT2ExactProductMaterial(texture),
    [texture],
  );

  return (
    <>
      {facets.map((facet, index) => {
        const sign = facet.seed > 0.5 ? 1 : -1;

        return (
          <mesh
            key={index}
            geometry={facet.geometry}
            material={material}
            position={[
              product.offsetX + facet.cx * 0.9 * phase2 * influence,
              product.offsetY + facet.cy * 0.65 * phase2 * influence,
              sign * (0.5 + facet.seed * 3) * phase1 * influence,
            ]}
            rotation={[
              facet.cy * 0.55 * phase2 * influence,
              facet.cx * 0.85 * phase2 * influence,
              sign *
                Math.sin(seconds * 1.8 + facet.seed * 10) *
                0.08 *
                phase3 *
                influence,
            ]}
            frustumCulled={false}
          />
        );
      })}
    </>
  );
};

export const GeometryTemplate59: React.FC<{imageSrc?: string}> = ({imageSrc}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const timing = getPT2Timing(frame, fps);

  return (
    <PT2Canvas imageSrc={imageSrc} width={width} height={height}>
      {({texture, product}) =>
        timing.holding ? (
          <PT2ExactProduct texture={texture} product={product} />
        ) : (
          <FacetField
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

import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

import {
  type ProductAnalysis,
} from "./ProductGeometryCore";

export type FormationVariant =
  | "pixel-cloud"
  | "edge-growth"
  | "voxel";

type FormationTile = {
  x: number;
  y: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
  r: number;
  g: number;
  b: number;
  seed: number;
  edgeDistance: number;
};

const clamp01 = (
  value: number,
) =>
  THREE.MathUtils.clamp(
    value,
    0,
    1,
  );

const smooth01 = (
  value: number,
) => {
  const t =
    clamp01(value);

  return (
    t *
    t *
    (3 - 2 * t)
  );
};

const hash01 = (
  value: number,
) => {
  const n =
    Math.sin(
      value * 12.9898,
    ) * 43758.5453;

  return (
    n -
    Math.floor(n)
  );
};

const readPixels = (
  image: HTMLImageElement,
) => {
  const width =
    image.naturalWidth ||
    image.width;

  const height =
    image.naturalHeight ||
    image.height;

  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    width;

  canvas.height =
    height;

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      },
    );

  if (!context) {
    throw new Error(
      "Unable to read product pixels.",
    );
  }

  context.clearRect(
    0,
    0,
    width,
    height,
  );

  context.drawImage(
    image,
    0,
    0,
    width,
    height,
  );

  return {
    width,
    height,
    data:
      context.getImageData(
        0,
        0,
        width,
        height,
      ).data,
  };
};

const alphaAt = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
) => {
  if (
    x < 0 ||
    y < 0 ||
    x >= width ||
    y >= height
  ) {
    return 0;
  }

  return data[
    (
      y * width +
      x
    ) *
      4 +
    3
  ];
};

const buildTiles = (
  image: HTMLImageElement,
  product: ProductAnalysis,
) => {
  const {
    width,
    height,
    data,
  } =
    readPixels(
      image,
    );

  /*
   * Dense enough that the final assembled state reads as
   * the product itself, not a sparse point representation.
   */
  const visibleWidth =
    Math.max(
      1,
      product.maxX -
        product.minX +
        1,
    );

  const visibleHeight =
    Math.max(
      1,
      product.maxY -
        product.minY +
        1,
    );

  const targetTiles =
    22000;

  const step =
    Math.max(
      1,
      Math.round(
        Math.sqrt(
          (
            visibleWidth *
            visibleHeight
          ) /
            targetTiles,
        ),
      ),
    );

  type RawTile = {
    px: number;
    py: number;
    x: number;
    y: number;
    u: number;
    v: number;
    r: number;
    g: number;
    b: number;
    seed: number;
    boundary: boolean;
  };

  const raw:
    RawTile[] = [];

  for (
    let py =
      product.minY;
    py <=
      product.maxY;
    py += step
  ) {
    for (
      let px =
        product.minX;
      px <=
        product.maxX;
      px += step
    ) {
      const index =
        (
          py * width +
          px
        ) * 4;

      if (
        data[index + 3] <
        24
      ) {
        continue;
      }

      const boundary =
        Math.min(
          alphaAt(
            data,
            width,
            height,
            px - step,
            py,
          ),
          alphaAt(
            data,
            width,
            height,
            px + step,
            py,
          ),
          alphaAt(
            data,
            width,
            height,
            px,
            py - step,
          ),
          alphaAt(
            data,
            width,
            height,
            px,
            py + step,
          ),
        ) <
        24;

      const sampleWidth =
        Math.min(
          step,
          width - px,
        );

      const sampleHeight =
        Math.min(
          step,
          height - py,
        );

      const u0 =
        px /
        width;

      const u1 =
        (
          px +
          sampleWidth
        ) /
        width;

      const v1 =
        1 -
        py /
          height;

      const v0 =
        1 -
        (
          py +
          sampleHeight
        ) /
        height;

      const centerU =
        (
          u0 +
          u1
        ) * 0.5;

      const centerV =
        (
          v0 +
          v1
        ) * 0.5;

      raw.push({
        px,
        py,
        x:
          (
            centerU - 0.5
          ) *
            product.planeWidth +
          product.offsetX,
        y:
          (
            centerV - 0.5
          ) *
            product.planeHeight +
          product.offsetY,
        u0,
        v0,
        u1,
        v1,
        r:
          data[index] /
          255,
        g:
          data[index + 1] /
          255,
        b:
          data[index + 2] /
          255,
        seed:
          hash01(
            px * 0.713 +
            py * 1.371,
          ),
        boundary,
      });
    }
  }

  /*
   * Distance to the real product boundary.
   * Used by Edge Growth so formation propagates through
   * the product rather than simply fading a product plane.
   */
  const boundaryTiles =
    raw.filter(
      (
        tile,
      ) =>
        tile.boundary,
    );

  let maxDistance =
    1;

  const distances =
    raw.map(
      (
        tile,
      ) => {
        if (
          tile.boundary
        ) {
          return 0;
        }

        let best =
          Infinity;

        for (
          const boundary
          of boundaryTiles
        ) {
          const dx =
            tile.px -
            boundary.px;

          const dy =
            tile.py -
            boundary.py;

          const distance =
            dx * dx +
            dy * dy;

          if (
            distance <
            best
          ) {
            best =
              distance;
          }
        }

        const distance =
          Math.sqrt(
            best,
          );

        maxDistance =
          Math.max(
            maxDistance,
            distance,
          );

        return distance;
      },
    );

  const tiles:
    FormationTile[] =
      raw.map(
        (
          tile,
          index,
        ) => ({
          x:
            tile.x,
          y:
            tile.y,
          u0:
            tile.u0,
          v0:
            tile.v0,
          u1:
            tile.u1,
          v1:
            tile.v1,
          r:
            tile.r,
          g:
            tile.g,
          b:
            tile.b,
          seed:
            tile.seed,
          edgeDistance:
            clamp01(
              distances[index] /
                maxDistance,
            ),
        }),
      );

  /*
   * Tile dimensions are derived from source sampling.
   * Slight overlap prevents cracks in the final state.
   */
  const tileWidth =
    (
      step /
      width
    ) *
    product.planeWidth;

  const tileHeight =
    (
      step /
      height
    ) *
    product.planeHeight;

  return {
    tiles,
    tileWidth,
    tileHeight,
  };
};

export const ProductFormation:
  React.FC<{
    image: HTMLImageElement;
    texture: THREE.Texture;
    product: ProductAnalysis;
    progress: number;
    time: number;
    variant: FormationVariant;
  }> = ({
    image,
    texture,
    product,
    progress,
    time,
    variant,
  }) => {
    const formation =
      useMemo(
        () =>
          buildTiles(
            image,
            product,
          ),
        [
          image,
          product,
        ],
      );

    const geometry =
      useMemo(
        () =>
          new THREE.PlaneGeometry(
            formation.tileWidth,
            formation.tileHeight,
            1,
            1,
          ),
        [
          formation.tileWidth,
          formation.tileHeight,
        ],
      );

    /*
     * One instanced mesh = the actual product formation.
     *
     * There is deliberately NO ExactProduct plane.
     * At progress 1 every instance occupies its exact
     * product coordinate and samples its exact source UV.
     */
    const material =
      useMemo(() => {
        const m =
          new THREE.ShaderMaterial({
            transparent:
              true,
            depthWrite:
              true,
            side:
              THREE.DoubleSide,
            toneMapped:
              false,
            uniforms: {
              map: {
                value:
                  texture,
              },
            },
            vertexShader: `
              attribute vec2 tileUvOrigin;
              attribute vec2 tileUvScale;

              varying vec2 vTileUv;

              void main() {
                /*
                 * Each geometry tile now carries the
                 * complete source-image region it represents.
                 *
                 * uv is the quad's native 0→1 coordinate.
                 */
                vTileUv =
                  tileUvOrigin +
                  uv *
                  tileUvScale;

                gl_Position =
                  projectionMatrix *
                  modelViewMatrix *
                  instanceMatrix *
                  vec4(
                    position,
                    1.0
                  );
              }
            `,
            fragmentShader: `
              uniform sampler2D map;

              varying vec2 vTileUv;

              void main() {
                vec4 color =
                  texture2D(
                    map,
                    vTileUv
                  );

                if (
                  color.a <
                  0.02
                ) {
                  discard;
                }

                gl_FragColor =
                  color;
              }
            `,
          });

        return m;
      }, [
        texture,
      ]);

    const meshRef =
      useRef<
        THREE.InstancedMesh
      >(null);

    const uvOriginAttribute =
      useMemo(
        () =>
          new THREE.InstancedBufferAttribute(
            new Float32Array(
              formation.tiles.length *
                2,
            ),
            2,
          ),
        [
          formation.tiles.length,
        ],
      );

    const uvScaleAttribute =
      useMemo(
        () =>
          new THREE.InstancedBufferAttribute(
            new Float32Array(
              formation.tiles.length *
                2,
            ),
            2,
          ),
        [
          formation.tiles.length,
        ],
      );

    useMemo(
      () => {
        formation.tiles.forEach(
          (
            tile,
            index,
          ) => {
            uvOriginAttribute.setXY(
              index,
              tile.u0,
              tile.v0,
            );

            uvScaleAttribute.setXY(
              index,
              tile.u1 -
                tile.u0,
              tile.v1 -
                tile.v0,
            );
          },
        );

        geometry.setAttribute(
          "tileUvOrigin",
          uvOriginAttribute,
        );

        geometry.setAttribute(
          "tileUvScale",
          uvScaleAttribute,
        );
      },
      [
        formation.tiles,
        geometry,
        uvOriginAttribute,
        uvScaleAttribute,
      ],
    );

    const dummy =
      useMemo(
        () =>
          new THREE.Object3D(),
        [],
      );

    useLayoutEffect(
      () => {
        const mesh =
          meshRef.current;

        if (!mesh) {
          return;
        }

        const globalProgress =
          smooth01(
            progress,
          );

        formation.tiles.forEach(
          (
            tile,
            index,
          ) => {
            let localProgress =
              globalProgress;

            /*
             * EDGE GROWTH:
             * actual product topology controls when each
             * tile reaches its final position.
             */
            if (
              variant ===
              "edge-growth"
            ) {
              const start =
                tile.edgeDistance *
                0.72;

              localProgress =
                smooth01(
                  (
                    globalProgress -
                    start
                  ) /
                    0.28,
                );
            }

            /*
             * Small product-specific stagger for the other
             * formation systems.
             */
            if (
              variant ===
              "pixel-cloud"
            ) {
              localProgress =
                smooth01(
                  (
                    globalProgress -
                    tile.seed *
                      0.18
                  ) /
                    0.82,
                );
            }

            if (
              variant ===
              "voxel"
            ) {
              localProgress =
                smooth01(
                  (
                    globalProgress -
                    tile.seed *
                      0.12
                  ) /
                    0.88,
                );
            }

            const inverse =
              1 -
              localProgress;

            let startX =
              tile.x;

            let startY =
              tile.y;

            let startZ =
              0;

            let rotationX =
              0;

            let rotationY =
              0;

            let rotationZ =
              0;

            if (
              variant ===
              "pixel-cloud"
            ) {
              const angle =
                tile.seed *
                  Math.PI *
                  14 +
                time *
                  (
                    0.35 +
                    tile.seed *
                      0.6
                  );

              const radius =
                1.1 +
                tile.seed *
                  4.6;

              startX +=
                Math.cos(
                  angle,
                ) *
                radius;

              startY +=
                Math.sin(
                  angle,
                ) *
                radius *
                0.72;

              startZ =
                (
                  tile.seed -
                  0.5
                ) *
                7.5;

              rotationX =
                tile.seed *
                Math.PI *
                2;

              rotationY =
                (
                  1 -
                  tile.seed
                ) *
                Math.PI *
                2;
            }

            if (
              variant ===
              "edge-growth"
            ) {
              const angle =
                tile.seed *
                  Math.PI *
                  10;

              const outward =
                0.45 +
                (
                  1 -
                  tile.edgeDistance
                ) *
                  2.2;

              startX +=
                Math.cos(
                  angle,
                ) *
                outward;

              startY +=
                Math.sin(
                  angle,
                ) *
                outward;

              startZ =
                (
                  tile.seed -
                  0.5
                ) *
                4.2;

              rotationZ =
                (
                  tile.seed -
                  0.5
                ) *
                Math.PI *
                1.5;
            }

            if (
              variant ===
              "voxel"
            ) {
              const angle =
                tile.seed *
                  Math.PI *
                  12 +
                time *
                  0.35;

              const radius =
                0.8 +
                tile.seed *
                  3.8;

              startX +=
                Math.cos(
                  angle,
                ) *
                radius;

              startY +=
                Math.sin(
                  angle,
                ) *
                radius *
                0.65;

              startZ =
                (
                  tile.seed -
                  0.5
                ) *
                8.5;

              rotationX =
                tile.seed *
                Math.PI *
                3;

              rotationY =
                (
                  1 -
                  tile.seed
                ) *
                Math.PI *
                3;
            }

            dummy.position.set(
              THREE.MathUtils.lerp(
                startX,
                tile.x,
                localProgress,
              ),
              THREE.MathUtils.lerp(
                startY,
                tile.y,
                localProgress,
              ),
              THREE.MathUtils.lerp(
                startZ,
                0,
                localProgress,
              ),
            );

            dummy.rotation.set(
              rotationX *
                inverse,
              rotationY *
                inverse,
              rotationZ *
                inverse,
            );

            /*
             * Voxels begin chunky/volumetric but flatten
             * into the SAME textured product tiles.
             */
            const startScale =
              variant ===
              "voxel"
                ? 1.65
                : variant ===
                    "pixel-cloud"
                  ? 0.72
                  : 0.82;

            const scale =
              THREE.MathUtils.lerp(
                startScale,
                1,
                localProgress,
              );

            dummy.scale.set(
              scale,
              scale,
              1,
            );

            dummy.updateMatrix();

            mesh.setMatrixAt(
              index,
              dummy.matrix,
            );
          },
        );

        mesh.instanceMatrix
          .needsUpdate =
            true;
      },
      [
        formation.tiles,
        progress,
        time,
        variant,
        dummy,
      ],
    );

    return (
      <instancedMesh
        ref={
          meshRef
        }
        args={[
          geometry,
          material,
          formation.tiles.length,
        ]}
        frustumCulled={
          false
        }
      />
    );
  };

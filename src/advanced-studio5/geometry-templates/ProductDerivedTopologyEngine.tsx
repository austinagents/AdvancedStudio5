import React, {
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {ThreeCanvas} from "@remotion/three";
import {useTexture} from "@react-three/drei";
import * as THREE from "three";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {
  analyzeProduct,
  configureProductTexture,
  createExactProductMaterial,
  type ProductAnalysis,
} from "./ProductGeometryCore";
import {
  ProductFormation,
} from "./ProductFormationEngine";

export type DerivedTopologyVariant =
  | "voronoi"
  | "contour-growth"
  | "pixel-cloud"
  | "adaptive-triangulation"
  | "relief"
  | "contour-extrusion"
  | "edge-growth"
  | "cell-mosaic"
  | "wavefront"
  | "voxel";

export type ProductDerivedTopologyProps = {
  imageSrc?: string;
};

type ProductField = {
  geometry: THREE.PlaneGeometry;
};

type ProductSample = {
  x: number;
  y: number;
  zSeed: number;
  r: number;
  g: number;
  b: number;
  u: number;
  v: number;
  edge: boolean;
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

  return n -
    Math.floor(n);
};

const readProductPixels = (
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

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true,
      },
    );

  if (!context) {
    throw new Error(
      "Unable to inspect product pixels.",
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

  const data =
    context.getImageData(
      0,
      0,
      width,
      height,
    ).data;

  return {
    width,
    height,
    data,
  };
};

const alphaAt = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
) => {
  const sx =
    Math.max(
      0,
      Math.min(
        width - 1,
        x,
      ),
    );

  const sy =
    Math.max(
      0,
      Math.min(
        height - 1,
        y,
      ),
    );

  return data[
    (
      sy * width +
      sx
    ) *
      4 +
    3
  ];
};

const buildProductField = (
  image: HTMLImageElement,
  product: ProductAnalysis,
): ProductField => {
  const columns = 64;
  const rows = 160;

  const geometry =
    new THREE.PlaneGeometry(
      product.planeWidth,
      product.planeHeight,
      columns,
      rows,
    );

  const {
    width,
    height,
    data,
  } =
    readProductPixels(image);

  const uv =
    geometry.attributes
      .uv as THREE.BufferAttribute;

  const position =
    geometry.attributes
      .position as THREE.BufferAttribute;

  const count =
    position.count;

  const alpha =
    new Float32Array(
      count,
    );

  const luminance =
    new Float32Array(
      count,
    );

  const edge =
    new Float32Array(
      count,
    );

  const random =
    new Float32Array(
      count,
    );

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const u =
      uv.getX(i);

    const v =
      uv.getY(i);

    const px =
      Math.round(
        u *
          (width - 1),
      );

    const py =
      Math.round(
        (1 - v) *
          (height - 1),
      );

    const index =
      (
        py * width +
        px
      ) * 4;

    const r =
      data[index] /
      255;

    const g =
      data[index + 1] /
      255;

    const b =
      data[index + 2] /
      255;

    const a =
      data[index + 3] /
      255;

    alpha[i] = a;

    luminance[i] =
      r * 0.2126 +
      g * 0.7152 +
      b * 0.0722;

    if (a > 0.02) {
      const left =
        alphaAt(
          data,
          width,
          height,
          px - 2,
          py,
        );

      const right =
        alphaAt(
          data,
          width,
          height,
          px + 2,
          py,
        );

      const up =
        alphaAt(
          data,
          width,
          height,
          px,
          py - 2,
        );

      const down =
        alphaAt(
          data,
          width,
          height,
          px,
          py + 2,
        );

      const boundary =
        Math.min(
          left,
          right,
          up,
          down,
        ) <
        20;

      edge[i] =
        boundary
          ? 1
          : 0;
    } else {
      edge[i] = 0;
    }

    random[i] =
      hash01(
        i * 1.713 +
        u * 13.1 +
        v * 9.7,
      );
  }

  const columnsPlusOne =
    columns + 1;

  const rowsPlusOne =
    rows + 1;

  const distance =
    new Float32Array(
      count,
    );

  distance.fill(
    999,
  );

  for (
    let y = 0;
    y < rowsPlusOne;
    y++
  ) {
    for (
      let x = 0;
      x < columnsPlusOne;
      x++
    ) {
      const i =
        y *
          columnsPlusOne +
        x;

      if (
        alpha[i] <= 0.02 ||
        edge[i] > 0.5
      ) {
        distance[i] = 0;
      }
    }
  }

  for (
    let y = 0;
    y < rowsPlusOne;
    y++
  ) {
    for (
      let x = 0;
      x < columnsPlusOne;
      x++
    ) {
      const i =
        y *
          columnsPlusOne +
        x;

      if (x > 0) {
        distance[i] =
          Math.min(
            distance[i],
            distance[i - 1] +
              1,
          );
      }

      if (y > 0) {
        distance[i] =
          Math.min(
            distance[i],
            distance[
              i -
                columnsPlusOne
            ] +
              1,
          );
      }
    }
  }

  for (
    let y =
      rowsPlusOne - 1;
    y >= 0;
    y--
  ) {
    for (
      let x =
        columnsPlusOne - 1;
      x >= 0;
      x--
    ) {
      const i =
        y *
          columnsPlusOne +
        x;

      if (
        x <
        columnsPlusOne - 1
      ) {
        distance[i] =
          Math.min(
            distance[i],
            distance[i + 1] +
              1,
          );
      }

      if (
        y <
        rowsPlusOne - 1
      ) {
        distance[i] =
          Math.min(
            distance[i],
            distance[
              i +
                columnsPlusOne
            ] +
              1,
          );
      }
    }
  }

  let maxDistance = 1;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    if (
      alpha[i] > 0.02
    ) {
      maxDistance =
        Math.max(
          maxDistance,
          distance[i],
        );
    }
  }

  for (
    let i = 0;
    i < count;
    i++
  ) {
    distance[i] =
      clamp01(
        distance[i] /
          maxDistance,
      );
  }

  geometry.setAttribute(
    "productAlpha",
    new THREE.BufferAttribute(
      alpha,
      1,
    ),
  );

  geometry.setAttribute(
    "productLuma",
    new THREE.BufferAttribute(
      luminance,
      1,
    ),
  );

  geometry.setAttribute(
    "productEdge",
    new THREE.BufferAttribute(
      edge,
      1,
    ),
  );

  geometry.setAttribute(
    "edgeDistance",
    new THREE.BufferAttribute(
      distance,
      1,
    ),
  );

  geometry.setAttribute(
    "seedValue",
    new THREE.BufferAttribute(
      random,
      1,
    ),
  );

  return {
    geometry,
  };
};

const sampleProduct = (
  image: HTMLImageElement,
  product: ProductAnalysis,
  targetCount: number,
  edgeOnly = false,
): ProductSample[] => {
  const {
    width,
    height,
    data,
  } =
    readProductPixels(image);

  const visibleWidth =
    product.maxX -
    product.minX +
    1;

  const visibleHeight =
    product.maxY -
    product.minY +
    1;

  const area =
    Math.max(
      1,
      visibleWidth *
        visibleHeight,
    );

  const step =
    Math.max(
      1,
      Math.round(
        Math.sqrt(
          area /
            targetCount,
        ),
      ),
    );

  const samples:
    ProductSample[] = [];

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

      const a =
        data[index + 3];

      if (a < 24) {
        continue;
      }

      const left =
        alphaAt(
          data,
          width,
          height,
          px - step,
          py,
        );

      const right =
        alphaAt(
          data,
          width,
          height,
          px + step,
          py,
        );

      const up =
        alphaAt(
          data,
          width,
          height,
          px,
          py - step,
        );

      const down =
        alphaAt(
          data,
          width,
          height,
          px,
          py + step,
        );

      const isEdge =
        Math.min(
          left,
          right,
          up,
          down,
        ) <
        24;

      if (
        edgeOnly &&
        !isEdge
      ) {
        continue;
      }

      const u =
        px /
        width;

      const v =
        1 -
        py /
          height;

      const x =
        (
          u -
          0.5
        ) *
        product.planeWidth +
        product.offsetX;

      const y =
        (
          v -
          0.5
        ) *
        product.planeHeight +
        product.offsetY;

      samples.push({
        x,
        y,
        zSeed:
          hash01(
            px * 0.71 +
            py * 1.37,
          ),
        r:
          data[index] /
          255,
        g:
          data[index + 1] /
          255,
        b:
          data[index + 2] /
          255,
        u,
        v,
        edge:
          isEdge,
      });
    }
  }

  return samples;
};

const ExactProduct:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    opacity?: number;
  }> = ({
    texture,
    product,
    opacity = 1,
  }) => {
    const material =
      useMemo(
        () =>
          createExactProductMaterial(
            texture,
            opacity,
          ),
        [
          texture,
          opacity,
        ],
      );

    return (
      <mesh
        position={[
          product.offsetX,
          product.offsetY,
          0.012,
        ]}
        material={
          material
        }
      >
        <planeGeometry
          args={[
            product.planeWidth,
            product.planeHeight,
          ]}
        />
      </mesh>
    );
  };

const surfaceCode = (
  variant:
    | "voronoi"
    | "contour-growth"
    | "adaptive-triangulation"
    | "relief"
    | "cell-mosaic"
    | "wavefront",
) => {
  if (
    variant ===
    "voronoi"
  ) {
    return `
      vec2 cell =
        floor(
          uv *
          vec2(
            13.0,
            28.0
          )
        );

      float cellHash =
        fract(
          sin(
            dot(
              cell,
              vec2(
                12.9898,
                78.233
              )
            )
          ) *
          43758.5453
        );

      float angle =
        cellHash *
        6.2831853;

      float topologyWeight =
        productAlpha *
        (
          0.45 +
          edgeDistance *
          0.85
        );

      transformed.x +=
        cos(
          angle
        ) *
        (
          0.35 +
          cellHash *
          1.35
        ) *
        strength *
        topologyWeight;

      transformed.y +=
        sin(
          angle
        ) *
        (
          0.35 +
          cellHash *
          1.35
        ) *
        strength *
        topologyWeight;

      transformed.z +=
        (
          cellHash -
          0.5
        ) *
        5.0 *
        strength *
        topologyWeight;
    `;
  }

  if (
    variant ===
    "contour-growth"
  ) {
    return `
      float growth =
        smoothstep(
          progress -
          0.12,
          progress +
          0.08,
          edgeDistance
        );

      float collapse =
        1.0 -
        growth;

      transformed.xy *=
        1.0 -
        collapse *
        0.18 *
        strength;

      transformed.z +=
        collapse *
        (
          1.4 +
          seedValue *
          1.8
        ) *
        strength;

      transformed.x +=
        sin(
          edgeDistance *
          30.0 +
          time *
          2.0
        ) *
        0.16 *
        strength *
        collapse;
    `;
  }

  if (
    variant ===
    "adaptive-triangulation"
  ) {
    return `
      float topology =
        productAlpha *
        (
          0.25 +
          edgeDistance *
          0.75
        );

      float angle =
        seedValue *
        6.2831853;

      float amount =
        (
          0.15 +
          seedValue *
          1.45
        ) *
        strength *
        topology;

      transformed.x +=
        cos(
          angle
        ) *
        amount;

      transformed.y +=
        sin(
          angle
        ) *
        amount;

      transformed.z +=
        (
          seedValue -
          0.5
        ) *
        4.5 *
        strength *
        topology;
    `;
  }

  if (
    variant ===
    "relief"
  ) {
    return `
      float relief =
        (
          productLuma -
          0.45
        ) *
        3.6;

      transformed.z +=
        relief *
        strength *
        productAlpha;

      transformed.x +=
        (
          productLuma -
          0.5
        ) *
        0.22 *
        strength *
        productAlpha;
    `;
  }

  if (
    variant ===
    "cell-mosaic"
  ) {
    return `
      vec2 cell =
        floor(
          uv *
          vec2(
            18.0,
            42.0
          )
        );

      float cellHash =
        fract(
          sin(
            dot(
              cell,
              vec2(
                41.37,
                17.91
              )
            )
          ) *
          9137.17
        );

      float imageDrive =
        (
          productLuma *
          0.7 +
          edgeDistance *
          0.3
        );

      transformed.z +=
        (
          cellHash -
          0.5
        ) *
        3.2 *
        strength *
        productAlpha;

      transformed.x +=
        (
          imageDrive -
          0.5
        ) *
        0.65 *
        strength;

      transformed.y +=
        sin(
          cellHash *
          12.0 +
          time *
          2.0
        ) *
        0.18 *
        strength;
    `;
  }

  return `
    float front =
      fract(
        time *
        0.34
      );

    float wave =
      exp(
        -abs(
          edgeDistance -
          front
        ) *
        16.0
      );

    transformed.z +=
      wave *
      2.1 *
      strength *
      productAlpha;

    transformed.xy *=
      1.0 +
      wave *
      0.05 *
      strength;
  `;
};

const DerivedSurface:
  React.FC<{
    texture: THREE.Texture;
    image: HTMLImageElement;
    product: ProductAnalysis;
    frame: number;
    fps: number;
    strength: number;
    variant:
      | "voronoi"
      | "contour-growth"
      | "adaptive-triangulation"
      | "relief"
      | "cell-mosaic"
      | "wavefront";
  }> = ({
    texture,
    image,
    product,
    frame,
    fps,
    strength,
    variant,
  }) => {
    const field =
      useMemo(
        () =>
          buildProductField(
            image,
            product,
          ),
        [
          image,
          product,
        ],
      );

    const material =
      useMemo(() => {
        const m =
          createExactProductMaterial(
            texture,
          );

        m.onBeforeCompile = (
          shader,
        ) => {
          shader.uniforms
            .strength = {
              value: 1,
            };

          shader.uniforms
            .time = {
              value: 0,
            };

          shader.uniforms
            .progress = {
              value: 0,
            };

          shader.vertexShader =
            shader.vertexShader.replace(
              "void main() {",
              `
              attribute float productAlpha;
              attribute float productLuma;
              attribute float productEdge;
              attribute float edgeDistance;
              attribute float seedValue;

              uniform float strength;
              uniform float time;
              uniform float progress;

              void main() {
              `,
            );

          shader.vertexShader =
            shader.vertexShader.replace(
              "#include <begin_vertex>",
              `
              vec3 transformed =
                position;

              ${surfaceCode(
                variant,
              )}
              `,
            );

          m.userData.shader =
            shader;
        };

        m.customProgramCacheKey =
          () =>
            `as5-derived-${variant}-v1`;

        return m;
      }, [
        texture,
        variant,
      ]);

    const shader =
      material.userData
        .shader as
        | {
            uniforms: {
              strength: {
                value: number;
              };
              time: {
                value: number;
              };
              progress: {
                value: number;
              };
            };
          }
        | undefined;

    if (shader) {
      shader.uniforms
        .strength.value =
          strength;

      shader.uniforms
        .time.value =
          frame / fps;

      shader.uniforms
        .progress.value =
          1 - strength;
    }

    return (
      <mesh
        geometry={
          field.geometry
        }
        material={
          material
        }
        position={[
          product.offsetX,
          product.offsetY,
          0.012,
        ]}
      />
    );
  };

const PointCloud:
  React.FC<{
    image: HTMLImageElement;
    product: ProductAnalysis;
    strength: number;
    time: number;
    edgeOnly?: boolean;
  }> = ({
    image,
    product,
    strength,
    time,
    edgeOnly = false,
  }) => {
    const samples =
      useMemo(
        () =>
          sampleProduct(
            image,
            product,
            edgeOnly
              ? 2600
              : 6500,
            edgeOnly,
          ),
        [
          image,
          product,
          edgeOnly,
        ],
      );

    const geometry =
      useMemo(() => {
        const positions =
          new Float32Array(
            samples.length *
              3,
          );

        const colors =
          new Float32Array(
            samples.length *
              3,
          );

        samples.forEach(
          (
            sample,
            index,
          ) => {
            positions[
              index * 3
            ] =
              sample.x;

            positions[
              index * 3 +
                1
            ] =
              sample.y;

            positions[
              index * 3 +
                2
            ] = 0;

            colors[
              index * 3
            ] =
              sample.r;

            colors[
              index * 3 +
                1
            ] =
              sample.g;

            colors[
              index * 3 +
                2
            ] =
              sample.b;
          },
        );

        const g =
          new THREE.BufferGeometry();

        g.setAttribute(
          "position",
          new THREE.BufferAttribute(
            positions,
            3,
          ),
        );

        g.setAttribute(
          "color",
          new THREE.BufferAttribute(
            colors,
            3,
          ),
        );

        return g;
      }, [
        samples,
      ]);

    const material =
      useMemo(
        () =>
          new THREE.PointsMaterial(
            {
              size:
                edgeOnly
                  ? 0.055
                  : 0.045,
              sizeAttenuation:
                true,
              vertexColors:
                true,
              transparent:
                true,
              opacity:
                Math.max(
                  0,
                  Math.min(
                    1,
                    strength *
                      1.3,
                  ),
                ),
              depthWrite:
                false,
              toneMapped:
                false,
            },
          ),
        [
          edgeOnly,
          strength,
        ],
      );

    const position =
      geometry.attributes
        .position as THREE.BufferAttribute;

    for (
      let i = 0;
      i < samples.length;
      i++
    ) {
      const sample =
        samples[i];

      let x =
        sample.x;

      let y =
        sample.y;

      let z = 0;

      if (edgeOnly) {
        const inward =
          1 -
          strength;

        const radius =
          0.45 +
          sample.zSeed *
            2.4;

        x +=
          Math.cos(
            sample.zSeed *
              Math.PI *
              12 +
              time,
          ) *
          radius *
          strength;

        y +=
          Math.sin(
            sample.zSeed *
              Math.PI *
              10 +
              time *
                0.8,
          ) *
          radius *
          strength;

        z =
          (
            sample.zSeed -
            0.5
          ) *
          5 *
          strength;

        x =
          THREE.MathUtils.lerp(
            x,
            sample.x,
            inward,
          );

        y =
          THREE.MathUtils.lerp(
            y,
            sample.y,
            inward,
          );
      } else {
        const angle =
          sample.zSeed *
            Math.PI *
            14 +
          time *
            (
              0.5 +
              sample.zSeed
            );

        const radius =
          (
            1.2 +
            sample.zSeed *
              5
          ) *
          strength;

        x +=
          Math.cos(
            angle,
          ) *
          radius;

        y +=
          Math.sin(
            angle,
          ) *
          radius *
          0.7;

        z =
          (
            sample.zSeed -
            0.5
          ) *
          8 *
          strength;
      }

      position.setXYZ(
        i,
        x,
        y,
        z,
      );
    }

    position.needsUpdate =
      true;

    return (
      <points
        geometry={
          geometry
        }
        material={
          material
        }
      />
    );
  };

const ContourExtrusion:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    strength: number;
  }> = ({
    texture,
    product,
    strength,
  }) => {
    const geometry =
      useMemo(() => {
        if (
          product.silhouette
            .length <
          6
        ) {
          return null;
        }

        const shape =
          new THREE.Shape();

        const first =
          product.silhouette[0];

        shape.moveTo(
          first[0],
          first[1],
        );

        for (
          let i = 1;
          i <
          product.silhouette
            .length;
          i++
        ) {
          const p =
            product.silhouette[i];

          shape.lineTo(
            p[0],
            p[1],
          );
        }

        shape.closePath();

        const g =
          new THREE.ExtrudeGeometry(
            shape,
            {
              depth: 1.4,
              bevelEnabled: true,
              bevelSize: 0.025,
              bevelThickness:
                0.025,
              bevelSegments: 2,
              steps: 1,
            },
          );

        g.center();

        return g;
      }, [
        product,
      ]);

    const material =
      useMemo(
        () =>
          new THREE.MeshStandardMaterial(
            {
              color:
                "#151a20",
              roughness:
                0.42,
              metalness:
                0.25,
              transparent:
                true,
              opacity:
                strength,
            },
          ),
        [
          strength,
        ],
      );

    const heroOpacity =
      smooth01(
        (
          0.26 -
          strength
        ) /
          0.26,
      );

    return (
      <>
        {geometry ? (
          <mesh
            geometry={
              geometry
            }
            material={
              material
            }
            position={[
              product.offsetX,
              product.offsetY,
              -0.7 *
                strength,
            ]}
            rotation={[
              0.18 *
                strength,
              0.95 *
                strength,
              -0.05 *
                strength,
            ]}
            scale={[
              1,
              1,
              Math.max(
                0.001,
                strength,
              ),
            ]}
          />
        ) : null}

        <ExactProduct
          texture={
            texture
          }
          product={
            product
          }
          opacity={
            heroOpacity
          }
        />
      </>
    );
  };

const VoxelReconstruction:
  React.FC<{
    image: HTMLImageElement;
    texture: THREE.Texture;
    product: ProductAnalysis;
    strength: number;
    time: number;
  }> = ({
    image,
    texture,
    product,
    strength,
    time,
  }) => {
    const samples =
      useMemo(
        () =>
          sampleProduct(
            image,
            product,
            1500,
            false,
          ),
        [
          image,
          product,
        ],
      );

    const ref =
      useRef<
        THREE.InstancedMesh
      >(null);

    const dummy =
      useMemo(
        () =>
          new THREE.Object3D(),
        [],
      );

    useLayoutEffect(
      () => {
        const mesh =
          ref.current;

        if (!mesh) {
          return;
        }

        samples.forEach(
          (
            sample,
            index,
          ) => {
            const angle =
              sample.zSeed *
                Math.PI *
                10 +
              time *
                0.7;

            const radius =
              (
                0.8 +
                sample.zSeed *
                  4.0
              ) *
              strength;

            dummy.position.set(
              sample.x +
                Math.cos(
                  angle,
                ) *
                  radius,
              sample.y +
                Math.sin(
                  angle,
                ) *
                  radius *
                  0.65,
              (
                sample.zSeed -
                0.5
              ) *
                7 *
                strength,
            );

            const voxelScale =
              0.045 +
              strength *
                0.035;

            dummy.scale.set(
              voxelScale,
              voxelScale,
              voxelScale,
            );

            dummy.rotation.set(
              sample.zSeed *
                strength,
              angle *
                0.25 *
                strength,
              sample.zSeed *
                2 *
                strength,
            );

            dummy.updateMatrix();

            mesh.setMatrixAt(
              index,
              dummy.matrix,
            );

            mesh.setColorAt(
              index,
              new THREE.Color(
                sample.r,
                sample.g,
                sample.b,
              ),
            );
          },
        );

        mesh.instanceMatrix
          .needsUpdate =
            true;

        if (
          mesh.instanceColor
        ) {
          mesh.instanceColor
            .needsUpdate =
              true;
        }
      },
      [
        samples,
        dummy,
        strength,
        time,
      ],
    );

    const heroOpacity =
      smooth01(
        (
          0.18 -
          strength
        ) /
          0.18,
      );

    return (
      <>
        <instancedMesh
          ref={
            ref
          }
          args={[
            undefined,
            undefined,
            samples.length,
          ]}
        >
          <boxGeometry
            args={[
              1,
              1,
              1,
            ]}
          />

          <meshBasicMaterial
            vertexColors
            toneMapped={
              false
            }
          />
        </instancedMesh>

        <ExactProduct
          texture={
            texture
          }
          product={
            product
          }
          opacity={
            heroOpacity
          }
        />
      </>
    );
  };

const DerivedProduct:
  React.FC<{
    imageSrc: string;
    frame: number;
    fps: number;
    variant:
      DerivedTopologyVariant;
  }> = ({
    imageSrc,
    frame,
    fps,
    variant,
  }) => {
    const texture =
      useTexture(
        imageSrc,
      );

    configureProductTexture(
      texture,
    );

    const image =
      texture.image as
        HTMLImageElement;

    const product =
      useMemo(
        () =>
          analyzeProduct(
            image,
          ),
        [
          image,
        ],
      );

    const seconds =
      frame /
      fps;

    const settle =
      interpolate(
        frame,
        [
          0,
          fps * 3.55,
        ],
        [
          0,
          1,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        },
      );

    const strength =
      1 -
      smooth01(
        settle,
      );

    const rotationY =
      Math.sin(
        seconds * 0.8,
      ) * 0.012;

    const floatY =
      Math.sin(
        seconds * 1.1,
      ) * 0.06;

    const reveal =
      interpolate(
        frame,
        [
          fps * 1.2,
          fps * 2.7,
        ],
        [
          0,
          1,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        },
      );

    const heroScale =
      interpolate(
        reveal,
        [
          0,
          1,
        ],
        [
          0.8,
          1,
        ],
      );

    let effect:
      React.ReactNode =
        null;

    if (
      variant ===
      "voronoi"
    ) {
      effect = (
        <DerivedSurface
          texture={
            texture
          }
          image={
            image
          }
          product={
            product
          }
          frame={
            frame
          }
          fps={
            fps
          }
          strength={
            strength
          }
          variant="voronoi"
        />
      );
    }

    if (
      variant ===
      "contour-growth"
    ) {
      effect = (
        <DerivedSurface
          texture={
            texture
          }
          image={
            image
          }
          product={
            product
          }
          frame={
            frame
          }
          fps={
            fps
          }
          strength={
            strength
          }
          variant="contour-growth"
        />
      );
    }

    if (
      variant ===
      "pixel-cloud"
    ) {
      effect = (
        <ProductFormation
          image={image}
          texture={texture}
          product={product}
          progress={1 - strength}
          time={seconds}
          variant="pixel-cloud"
        />
      );
    }

    if (
      variant ===
      "adaptive-triangulation"
    ) {
      effect = (
        <DerivedSurface
          texture={
            texture
          }
          image={
            image
          }
          product={
            product
          }
          frame={
            frame
          }
          fps={
            fps
          }
          strength={
            strength
          }
          variant="adaptive-triangulation"
        />
      );
    }

    if (
      variant ===
      "relief"
    ) {
      effect = (
        <DerivedSurface
          texture={
            texture
          }
          image={
            image
          }
          product={
            product
          }
          frame={
            frame
          }
          fps={
            fps
          }
          strength={
            strength
          }
          variant="relief"
        />
      );
    }

    if (
      variant ===
      "contour-extrusion"
    ) {
      effect = (
        <ContourExtrusion
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
        />
      );
    }

    if (
      variant ===
      "edge-growth"
    ) {
      effect = (
        <ProductFormation
          image={image}
          texture={texture}
          product={product}
          progress={1 - strength}
          time={seconds}
          variant="edge-growth"
        />
      );
    }

    if (
      variant ===
      "cell-mosaic"
    ) {
      effect = (
        <DerivedSurface
          texture={
            texture
          }
          image={
            image
          }
          product={
            product
          }
          frame={
            frame
          }
          fps={
            fps
          }
          strength={
            strength
          }
          variant="cell-mosaic"
        />
      );
    }

    if (
      variant ===
      "wavefront"
    ) {
      effect = (
        <DerivedSurface
          texture={
            texture
          }
          image={
            image
          }
          product={
            product
          }
          frame={
            frame
          }
          fps={
            fps
          }
          strength={
            strength
          }
          variant="wavefront"
        />
      );
    }

    if (
      variant ===
      "voxel"
    ) {
      effect = (
        <ProductFormation
          image={image}
          texture={texture}
          product={product}
          progress={1 - strength}
          time={seconds}
          variant="voxel"
        />
      );
    }

    return (
      <group
        position={[
          0,
          floatY,
          0,
        ]}
        rotation={[
          0,
          rotationY,
          0,
        ]}
        scale={[
          heroScale,
          heroScale,
          heroScale,
        ]}
      >
        {effect}
      </group>
    );
  };

const Scene:
  React.FC<{
    imageSrc?: string;
    frame: number;
    fps: number;
    variant:
      DerivedTopologyVariant;
  }> = ({
    imageSrc,
    frame,
    fps,
    variant,
  }) => {
    if (!imageSrc) {
      return null;
    }

    return (
      <>
        <ambientLight
          intensity={
            1.1
          }
        />

        <directionalLight
          position={[
            4,
            6,
            8,
          ]}
          intensity={
            3.5
          }
        />

        <pointLight
          position={[
            -4,
            0,
            6,
          ]}
          intensity={
            16
          }
          color="#8cbfff"
        />

        <Suspense
          fallback={
            null
          }
        >
          <DerivedProduct
            imageSrc={
              imageSrc
            }
            frame={
              frame
            }
            fps={
              fps
            }
            variant={
              variant
            }
          />
        </Suspense>
      </>
    );
  };

export const ProductDerivedTopologyTemplate:
  React.FC<
    ProductDerivedTopologyProps & {
      variant:
        DerivedTopologyVariant;
    }
  > = ({
    imageSrc,
    variant,
  }) => {
    const frame =
      useCurrentFrame();

    const {
      fps,
      width,
      height,
    } =
      useVideoConfig();

    return (
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #182131 0%, #090b10 48%, #030405 100%)",
          overflow:
            "hidden",
        }}
      >
        <ThreeCanvas
          width={
            width
          }
          height={
            height
          }
          camera={{
            position: [
              0,
              0,
              9,
            ],
            fov:
              38,
            near:
              0.1,
            far:
              100,
          }}
          style={{
            width:
              "100%",
            height:
              "100%",
          }}
        >
          <Scene
            imageSrc={
              imageSrc
            }
            frame={
              frame
            }
            fps={
              fps
            }
            variant={
              variant
            }
          />
        </ThreeCanvas>
      </AbsoluteFill>
    );
  };

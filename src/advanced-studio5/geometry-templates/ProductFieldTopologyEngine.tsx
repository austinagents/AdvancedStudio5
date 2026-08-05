import React, {
  Suspense,
  useMemo,
} from "react";

import {
  ThreeCanvas,
} from "@remotion/three";

import {
  useTexture,
} from "@react-three/drei";

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

export type ProductFieldVariant =
  | "contour-terraces"
  | "chromatic-field"
  | "contrast-emboss"
  | "silhouette-normal"
  | "luminance-strata"
  | "color-region-split"
  | "gradient-flow"
  | "medial-ridge"
  | "edge-distance-cascade"
  | "feature-torque";

export type ProductFieldTemplateProps = {
  imageSrc?: string;
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
    clamp01(
      value,
    );

  return (
    t *
    t *
    (
      3 -
      2 * t
    )
  );
};

const readImage = (
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
      "Unable to inspect product image.",
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

const pixelIndex = (
  width: number,
  height: number,
  x: number,
  y: number,
) => {
  const px =
    Math.max(
      0,
      Math.min(
        width - 1,
        x,
      ),
    );

  const py =
    Math.max(
      0,
      Math.min(
        height - 1,
        y,
      ),
    );

  return (
    py * width +
    px
  ) * 4;
};

const alphaAt = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
) =>
  data[
    pixelIndex(
      width,
      height,
      x,
      y,
    ) + 3
  ] / 255;

const lumaAt = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
) => {
  const index =
    pixelIndex(
      width,
      height,
      x,
      y,
    );

  const r =
    data[index] /
    255;

  const g =
    data[
      index + 1
    ] /
    255;

  const b =
    data[
      index + 2
    ] /
    255;

  return (
    r * 0.2126 +
    g * 0.7152 +
    b * 0.0722
  );
};

const buildProductField = (
  image: HTMLImageElement,
  product: ProductAnalysis,
) => {
  const segmentsX = 64;
  const segmentsY = 160;

  const geometry =
    new THREE.PlaneGeometry(
      product.planeWidth,
      product.planeHeight,
      segmentsX,
      segmentsY,
    );

  const {
    width,
    height,
    data,
  } =
    readImage(
      image,
    );

  const position =
    geometry.attributes
      .position as THREE.BufferAttribute;

  const uv =
    geometry.attributes
      .uv as THREE.BufferAttribute;

  const count =
    position.count;

  const columns =
    segmentsX + 1;

  const rows =
    segmentsY + 1;

  const alpha =
    new Float32Array(
      count,
    );

  const red =
    new Float32Array(
      count,
    );

  const green =
    new Float32Array(
      count,
    );

  const blue =
    new Float32Array(
      count,
    );

  const luminance =
    new Float32Array(
      count,
    );

  const saturation =
    new Float32Array(
      count,
    );

  const localContrast =
    new Float32Array(
      count,
    );

  const lumaGradientX =
    new Float32Array(
      count,
    );

  const lumaGradientY =
    new Float32Array(
      count,
    );

  const edgeNormalX =
    new Float32Array(
      count,
    );

  const edgeNormalY =
    new Float32Array(
      count,
    );

  const edgeFlag =
    new Float32Array(
      count,
    );

  const edgeDistance =
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
        (
          width - 1
        ),
      );

    const py =
      Math.round(
        (
          1 - v
        ) *
        (
          height - 1
        ),
      );

    const index =
      pixelIndex(
        width,
        height,
        px,
        py,
      );

    const r =
      data[index] /
      255;

    const g =
      data[
        index + 1
      ] /
      255;

    const b =
      data[
        index + 2
      ] /
      255;

    const a =
      data[
        index + 3
      ] /
      255;

    const maxChannel =
      Math.max(
        r,
        g,
        b,
      );

    const minChannel =
      Math.min(
        r,
        g,
        b,
      );

    const luma =
      r * 0.2126 +
      g * 0.7152 +
      b * 0.0722;

    alpha[i] =
      a;

    red[i] =
      r;

    green[i] =
      g;

    blue[i] =
      b;

    luminance[i] =
      luma;

    saturation[i] =
      maxChannel -
      minChannel;

    const sampleRadius =
      3;

    const lumaLeft =
      lumaAt(
        data,
        width,
        height,
        px -
          sampleRadius,
        py,
      );

    const lumaRight =
      lumaAt(
        data,
        width,
        height,
        px +
          sampleRadius,
        py,
      );

    const lumaUp =
      lumaAt(
        data,
        width,
        height,
        px,
        py -
          sampleRadius,
      );

    const lumaDown =
      lumaAt(
        data,
        width,
        height,
        px,
        py +
          sampleRadius,
      );

    lumaGradientX[i] =
      (
        lumaRight -
        lumaLeft
      ) * 0.5;

    lumaGradientY[i] =
      (
        lumaUp -
        lumaDown
      ) * 0.5;

    localContrast[i] =
      (
        Math.abs(
          luma -
          lumaLeft
        ) +
        Math.abs(
          luma -
          lumaRight
        ) +
        Math.abs(
          luma -
          lumaUp
        ) +
        Math.abs(
          luma -
          lumaDown
        )
      ) / 4;

    const alphaLeft =
      alphaAt(
        data,
        width,
        height,
        px -
          sampleRadius,
        py,
      );

    const alphaRight =
      alphaAt(
        data,
        width,
        height,
        px +
          sampleRadius,
        py,
      );

    const alphaUp =
      alphaAt(
        data,
        width,
        height,
        px,
        py -
          sampleRadius,
      );

    const alphaDown =
      alphaAt(
        data,
        width,
        height,
        px,
        py +
          sampleRadius,
      );

    const gradientX =
      alphaRight -
      alphaLeft;

    const gradientY =
      alphaUp -
      alphaDown;

    const gradientLength =
      Math.sqrt(
        gradientX *
          gradientX +
        gradientY *
          gradientY,
      );

    if (
      gradientLength >
      0.0001
    ) {
      edgeNormalX[i] =
        gradientX /
        gradientLength;

      edgeNormalY[i] =
        gradientY /
        gradientLength;
    } else {
      edgeNormalX[i] =
        0;

      edgeNormalY[i] =
        0;
    }

    const boundary =
      a > 0.02 &&
      Math.min(
        alphaLeft,
        alphaRight,
        alphaUp,
        alphaDown,
      ) <
      0.08;

    edgeFlag[i] =
      boundary
        ? 1
        : 0;
  }

  edgeDistance.fill(
    999,
  );

  for (
    let y = 0;
    y < rows;
    y++
  ) {
    for (
      let x = 0;
      x < columns;
      x++
    ) {
      const i =
        y *
          columns +
        x;

      if (
        alpha[i] <=
          0.02 ||
        edgeFlag[i] >
          0.5
      ) {
        edgeDistance[i] =
          0;
      }
    }
  }

  for (
    let y = 0;
    y < rows;
    y++
  ) {
    for (
      let x = 0;
      x < columns;
      x++
    ) {
      const i =
        y *
          columns +
        x;

      if (
        x > 0
      ) {
        edgeDistance[i] =
          Math.min(
            edgeDistance[i],
            edgeDistance[
              i - 1
            ] + 1,
          );
      }

      if (
        y > 0
      ) {
        edgeDistance[i] =
          Math.min(
            edgeDistance[i],
            edgeDistance[
              i -
              columns
            ] + 1,
          );
      }
    }
  }

  for (
    let y =
      rows - 1;
    y >= 0;
    y--
  ) {
    for (
      let x =
        columns - 1;
      x >= 0;
      x--
    ) {
      const i =
        y *
          columns +
        x;

      if (
        x <
        columns - 1
      ) {
        edgeDistance[i] =
          Math.min(
            edgeDistance[i],
            edgeDistance[
              i + 1
            ] + 1,
          );
      }

      if (
        y <
        rows - 1
      ) {
        edgeDistance[i] =
          Math.min(
            edgeDistance[i],
            edgeDistance[
              i +
              columns
            ] + 1,
          );
      }
    }
  }

  let maximumDistance =
    1;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    if (
      alpha[i] >
      0.02 &&
      edgeDistance[i] <
      999
    ) {
      maximumDistance =
        Math.max(
          maximumDistance,
          edgeDistance[i],
        );
    }
  }

  for (
    let i = 0;
    i < count;
    i++
  ) {
    if (
      alpha[i] <=
      0.02
    ) {
      edgeDistance[i] =
        0;
    } else {
      edgeDistance[i] =
        clamp01(
          edgeDistance[i] /
          maximumDistance,
        );
    }
  }

  geometry.setAttribute(
    "productAlpha",
    new THREE.BufferAttribute(
      alpha,
      1,
    ),
  );

  geometry.setAttribute(
    "productRed",
    new THREE.BufferAttribute(
      red,
      1,
    ),
  );

  geometry.setAttribute(
    "productGreen",
    new THREE.BufferAttribute(
      green,
      1,
    ),
  );

  geometry.setAttribute(
    "productBlue",
    new THREE.BufferAttribute(
      blue,
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
    "productSaturation",
    new THREE.BufferAttribute(
      saturation,
      1,
    ),
  );

  geometry.setAttribute(
    "localContrast",
    new THREE.BufferAttribute(
      localContrast,
      1,
    ),
  );

  geometry.setAttribute(
    "lumaGradientX",
    new THREE.BufferAttribute(
      lumaGradientX,
      1,
    ),
  );

  geometry.setAttribute(
    "lumaGradientY",
    new THREE.BufferAttribute(
      lumaGradientY,
      1,
    ),
  );

  geometry.setAttribute(
    "edgeNormalX",
    new THREE.BufferAttribute(
      edgeNormalX,
      1,
    ),
  );

  geometry.setAttribute(
    "edgeNormalY",
    new THREE.BufferAttribute(
      edgeNormalY,
      1,
    ),
  );

  geometry.setAttribute(
    "edgeDistance",
    new THREE.BufferAttribute(
      edgeDistance,
      1,
    ),
  );

  return geometry;
};

const variantShader = (
  variant:
    ProductFieldVariant,
) => {
  if (
    variant ===
    "contour-terraces"
  ) {
    return `
      float band =
        floor(
          edgeDistance *
          12.0
        ) /
        11.0;

      float staircase =
        (
          0.5 -
          band
        ) *
        4.2;

      transformed.z +=
        staircase *
        strength *
        productAlpha;

      float contourPulse =
        sin(
          edgeDistance *
          35.0 -
          time *
          3.0
        );

      transformed.x +=
        edgeNormalX *
        contourPulse *
        0.28 *
        strength;

      transformed.y +=
        edgeNormalY *
        contourPulse *
        0.28 *
        strength;
    `;
  }

  if (
    variant ===
    "chromatic-field"
  ) {
    return `
      vec2 chromaVector =
        vec2(
          productRed -
          productBlue,
          productGreen -
          (
            productRed +
            productBlue
          ) *
          0.5
        );

      float chromaDepth =
        (
          productBlue -
          productRed
        ) *
        3.2 +
        productSaturation *
        1.5;

      transformed.xy +=
        chromaVector *
        1.8 *
        strength *
        productAlpha;

      transformed.z +=
        chromaDepth *
        strength *
        productAlpha;
    `;
  }

  if (
    variant ===
    "contrast-emboss"
  ) {
    return `
      float feature =
        smoothstep(
          0.015,
          0.18,
          localContrast
        );

      transformed.z +=
        feature *
        3.5 *
        strength *
        productAlpha;

      transformed.x +=
        lumaGradientX *
        2.2 *
        strength *
        feature;

      transformed.y +=
        lumaGradientY *
        2.2 *
        strength *
        feature;
    `;
  }

  if (
    variant ===
    "silhouette-normal"
  ) {
    return `
      float edgeInfluence =
        exp(
          -edgeDistance *
          7.0
        ) *
        productAlpha;

      float burst =
        (
          1.4 +
          0.8 *
          sin(
            time *
            2.2 +
            productLuma *
            8.0
          )
        );

      transformed.x +=
        edgeNormalX *
        burst *
        edgeInfluence *
        strength;

      transformed.y +=
        edgeNormalY *
        burst *
        edgeInfluence *
        strength;

      transformed.z +=
        edgeInfluence *
        1.8 *
        strength;
    `;
  }

  if (
    variant ===
    "luminance-strata"
  ) {
    return `
      float level =
        floor(
          productLuma *
          9.0
        ) /
        8.0;

      float depth =
        (
          level -
          0.5
        ) *
        4.6;

      transformed.z +=
        depth *
        strength *
        productAlpha;

      transformed.x +=
        (
          level -
          0.5
        ) *
        0.7 *
        strength *
        productAlpha;
    `;
  }

  if (
    variant ===
    "color-region-split"
  ) {
    return `
      vec2 direction =
        vec2(
          0.0
        );

      float depth =
        0.0;

      if (
        productRed >=
        productGreen &&
        productRed >=
        productBlue
      ) {
        direction =
          vec2(
            -1.0,
            0.25
          );

        depth =
          1.8;
      }

      else if (
        productGreen >=
        productRed &&
        productGreen >=
        productBlue
      ) {
        direction =
          vec2(
            0.15,
            1.0
          );

        depth =
          -1.3;
      }

      else {
        direction =
          vec2(
            1.0,
            -0.3
          );

        depth =
          2.4;
      }

      float regionStrength =
        (
          0.25 +
          productSaturation *
          1.4
        ) *
        productAlpha;

      transformed.xy +=
        direction *
        regionStrength *
        strength;

      transformed.z +=
        depth *
        regionStrength *
        strength;
    `;
  }

  if (
    variant ===
    "gradient-flow"
  ) {
    return `
      vec2 gradient =
        vec2(
          lumaGradientX,
          lumaGradientY
        );

      float magnitude =
        length(
          gradient
        );

      vec2 flow =
        magnitude >
        0.0001
          ? normalize(
              gradient
            )
          : vec2(
              0.0
            );

      float feature =
        smoothstep(
          0.01,
          0.16,
          magnitude
        );

      transformed.xy +=
        flow *
        feature *
        1.7 *
        strength *
        productAlpha;

      transformed.z +=
        sin(
          productLuma *
          18.0 +
          time *
          2.4
        ) *
        feature *
        1.6 *
        strength;
    `;
  }

  if (
    variant ===
    "medial-ridge"
  ) {
    return `
      float core =
        pow(
          edgeDistance,
          1.7
        ) *
        productAlpha;

      transformed.z +=
        core *
        3.7 *
        strength;

      transformed.x *=
        1.0 -
        core *
        0.11 *
        strength;

      transformed.y *=
        1.0 -
        core *
        0.035 *
        strength;

      transformed.z +=
        sin(
          edgeDistance *
          18.0 +
          time *
          1.6
        ) *
        core *
        0.35 *
        strength;
    `;
  }

  if (
    variant ===
    "edge-distance-cascade"
  ) {
    return `
      float front =
        fract(
          time *
          0.28
        );

      float distanceToFront =
        abs(
          edgeDistance -
          front
        );

      float wave =
        exp(
          -distanceToFront *
          18.0
        );

      transformed.z +=
        wave *
        2.8 *
        strength *
        productAlpha;

      transformed.x +=
        edgeNormalX *
        wave *
        0.42 *
        strength;

      transformed.y +=
        edgeNormalY *
        wave *
        0.42 *
        strength;
    `;
  }

  return `
    float featureMask =
      smoothstep(
        0.025,
        0.14,
        localContrast +
        productSaturation *
        0.08
      ) *
      productAlpha;

    float angle =
      (
        productLuma -
        0.5
      ) *
      2.8 *
      strength *
      featureMask;

    float c =
      cos(
        angle
      );

    float s =
      sin(
        angle
      );

    vec2 rotated =
      vec2(
        transformed.x *
          c -
        transformed.y *
          s,

        transformed.x *
          s +
        transformed.y *
          c
      );

    transformed.xy =
      mix(
        transformed.xy,
        rotated,
        featureMask *
        strength
      );

    transformed.z +=
      featureMask *
      (
        1.0 +
        productLuma *
        1.8
      ) *
      strength;
  `;
};

const ProductFieldSurface:
  React.FC<{
    texture: THREE.Texture;
    image: HTMLImageElement;
    product: ProductAnalysis;
    frame: number;
    fps: number;
    variant:
      ProductFieldVariant;
  }> = ({
    texture,
    image,
    product,
    frame,
    fps,
    variant,
  }) => {
    const geometry =
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

        m.onBeforeCompile =
          (
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

            shader.vertexShader =
              shader.vertexShader.replace(
                "void main() {",
                `
                attribute float productAlpha;
                attribute float productRed;
                attribute float productGreen;
                attribute float productBlue;
                attribute float productLuma;
                attribute float productSaturation;
                attribute float localContrast;
                attribute float lumaGradientX;
                attribute float lumaGradientY;
                attribute float edgeNormalX;
                attribute float edgeNormalY;
                attribute float edgeDistance;

                uniform float strength;
                uniform float time;

                void main() {
                `,
              );

            shader.vertexShader =
              shader.vertexShader.replace(
                "#include <begin_vertex>",
                `
                vec3 transformed =
                  position;

                ${variantShader(
                  variant,
                )}
                `,
              );

            m.userData.shader =
              shader;
          };

        m.customProgramCacheKey =
          () =>
            `as5-product-field-${variant}-v1`;

        return m;
      }, [
        texture,
        variant,
      ]);

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
            };
          }
        | undefined;

    if (shader) {
      shader.uniforms
        .strength.value =
          strength;

      shader.uniforms
        .time.value =
          frame /
          fps;
    }

    return (
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
          0.012,
        ]}
      />
    );
  };

const ProductFieldScene:
  React.FC<{
    imageSrc: string;
    frame: number;
    fps: number;
    variant:
      ProductFieldVariant;
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

    const rotationY =
      Math.sin(
        seconds *
          0.8,
      ) *
      0.012;

    const floatY =
      Math.sin(
        seconds *
          1.1,
      ) *
      0.06;

    const reveal =
      interpolate(
        frame,
        [
          fps *
            1.2,
          fps *
            2.7,
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
        <ProductFieldSurface
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
          variant={
            variant
          }
        />
      </group>
    );
  };

const Scene:
  React.FC<{
    imageSrc?: string;
    frame: number;
    fps: number;
    variant:
      ProductFieldVariant;
  }> = ({
    imageSrc,
    frame,
    fps,
    variant,
  }) => {
    if (
      !imageSrc
    ) {
      return null;
    }

    return (
      <Suspense
        fallback={
          null
        }
      >
        <ProductFieldScene
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
    );
  };

export const ProductFieldTopologyTemplate:
  React.FC<
    ProductFieldTemplateProps & {
      variant:
        ProductFieldVariant;
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

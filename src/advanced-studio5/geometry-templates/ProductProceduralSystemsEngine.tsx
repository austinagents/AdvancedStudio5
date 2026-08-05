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

export type ProductProceduralVariant =
  | "contour-shells"
  | "feature-isolation"
  | "color-layer-stack"
  | "medial-skeleton"
  | "surface-compression"
  | "contour-ribbons"
  | "feature-wave"
  | "chromatic-volume"
  | "topology-crumple"
  | "field-fusion";

export type ProductProceduralTemplateProps = {
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

const indexFor = (
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
    py *
      width +
    px
  ) * 4;
};

const sample = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
) => {
  const i =
    indexFor(
      width,
      height,
      x,
      y,
    );

  const r =
    data[i] /
    255;

  const g =
    data[
      i + 1
    ] /
    255;

  const b =
    data[
      i + 2
    ] /
    255;

  const a =
    data[
      i + 3
    ] /
    255;

  const luma =
    r * 0.2126 +
    g * 0.7152 +
    b * 0.0722;

  return {
    r,
    g,
    b,
    a,
    luma,
  };
};

const buildGeometry = (
  image: HTMLImageElement,
  product: ProductAnalysis,
) => {
  /*
   * Dense enough for real deformation,
   * still ONE continuous product surface.
   */
  const segmentsX = 72;
  const segmentsY = 180;

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

  const luma =
    new Float32Array(
      count,
    );

  const saturation =
    new Float32Array(
      count,
    );

  const contrast =
    new Float32Array(
      count,
    );

  const gradientX =
    new Float32Array(
      count,
    );

  const gradientY =
    new Float32Array(
      count,
    );

  const normalX =
    new Float32Array(
      count,
    );

  const normalY =
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

  const edge =
    new Float32Array(
      count,
    );

  const distance =
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

    const center =
      sample(
        data,
        width,
        height,
        px,
        py,
      );

    const radius =
      3;

    const left =
      sample(
        data,
        width,
        height,
        px - radius,
        py,
      );

    const right =
      sample(
        data,
        width,
        height,
        px + radius,
        py,
      );

    const up =
      sample(
        data,
        width,
        height,
        px,
        py - radius,
      );

    const down =
      sample(
        data,
        width,
        height,
        px,
        py + radius,
      );

    alpha[i] =
      center.a;

    red[i] =
      center.r;

    green[i] =
      center.g;

    blue[i] =
      center.b;

    luma[i] =
      center.luma;

    saturation[i] =
      Math.max(
        center.r,
        center.g,
        center.b,
      ) -
      Math.min(
        center.r,
        center.g,
        center.b,
      );

    contrast[i] =
      (
        Math.abs(
          center.luma -
          left.luma
        ) +
        Math.abs(
          center.luma -
          right.luma
        ) +
        Math.abs(
          center.luma -
          up.luma
        ) +
        Math.abs(
          center.luma -
          down.luma
        )
      ) /
      4;

    gradientX[i] =
      (
        right.luma -
        left.luma
      ) *
      0.5;

    gradientY[i] =
      (
        up.luma -
        down.luma
      ) *
      0.5;

    const ax =
      right.a -
      left.a;

    const ay =
      up.a -
      down.a;

    const length =
      Math.sqrt(
        ax * ax +
        ay * ay,
      );

    if (
      length >
      0.0001
    ) {
      normalX[i] =
        ax /
        length;

      normalY[i] =
        ay /
        length;
    }

    const isEdge =
      center.a >
        0.02 &&
      Math.min(
        left.a,
        right.a,
        up.a,
        down.a,
      ) <
        0.08;

    edge[i] =
      isEdge
        ? 1
        : 0;
  }

  distance.fill(
    999,
  );

  /*
   * Distance-to-silhouette field.
   */
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
        edge[i] >
          0.5
      ) {
        distance[i] =
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
        distance[i] =
          Math.min(
            distance[i],
            distance[
              i - 1
            ] + 1,
          );
      }

      if (
        y > 0
      ) {
        distance[i] =
          Math.min(
            distance[i],
            distance[
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
        distance[i] =
          Math.min(
            distance[i],
            distance[
              i + 1
            ] + 1,
          );
      }

      if (
        y <
        rows - 1
      ) {
        distance[i] =
          Math.min(
            distance[i],
            distance[
              i +
              columns
            ] + 1,
          );
      }
    }
  }

  let maxDistance =
    1;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    if (
      alpha[i] >
        0.02 &&
      distance[i] <
        999
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
    if (
      alpha[i] <=
      0.02
    ) {
      distance[i] =
        0;
    } else {
      distance[i] =
        clamp01(
          distance[i] /
          maxDistance,
        );
    }
  }

  const add =
    (
      name: string,
      array:
        Float32Array,
    ) => {
      geometry.setAttribute(
        name,
        new THREE.BufferAttribute(
          array,
          1,
        ),
      );
    };

  add(
    "productAlpha",
    alpha,
  );

  add(
    "productLuma",
    luma,
  );

  add(
    "productSaturation",
    saturation,
  );

  add(
    "productContrast",
    contrast,
  );

  add(
    "gradientX",
    gradientX,
  );

  add(
    "gradientY",
    gradientY,
  );

  add(
    "edgeNormalX",
    normalX,
  );

  add(
    "edgeNormalY",
    normalY,
  );

  add(
    "edgeDistance",
    distance,
  );

  add(
    "productRed",
    red,
  );

  add(
    "productGreen",
    green,
  );

  add(
    "productBlue",
    blue,
  );

  return geometry;
};

const deformationFor = (
  variant:
    ProductProceduralVariant,
) => {
  switch (
    variant
  ) {
    case "contour-shells":
      return `
        /*
         * FIELD 1: silhouette distance
         * FIELD 2: alpha normal
         *
         * PHASE A: concentric contour shells
         * PHASE B: shells shear/orbit
         */
        float shell =
          floor(
            edgeDistance *
            10.0
          ) /
          9.0;

        float shellPulse =
          sin(
            shell *
            18.0 +
            time *
            2.0
          );

        transformed.z +=
          (
            shell -
            0.5
          ) *
          4.0 *
          phaseA *
          productAlpha;

        transformed.xy +=
          vec2(
            edgeNormalX,
            edgeNormalY
          ) *
          shellPulse *
          0.55 *
          phaseA *
          productAlpha;

        float orbit =
          (
            shell -
            0.5
          ) *
          0.42 *
          phaseB;

        float oc =
          cos(
            orbit
          );

        float os =
          sin(
            orbit
          );

        transformed.xy =
          vec2(
            transformed.x *
              oc -
            transformed.y *
              os,

            transformed.x *
              os +
            transformed.y *
              oc
          );
      `;

    case "feature-isolation":
      return `
        /*
         * FIELD 1: local contrast
         * FIELD 2: luminance gradient
         */
        float feature =
          smoothstep(
            0.018,
            0.16,
            productContrast
          ) *
          productAlpha;

        vec2 gradient =
          vec2(
            gradientX,
            gradientY
          );

        float gradientLength =
          length(
            gradient
          );

        vec2 direction =
          gradientLength >
            0.0001
            ? normalize(
                gradient
              )
            : vec2(
                0.0
              );

        transformed.z +=
          feature *
          4.2 *
          phaseA;

        transformed.xy +=
          direction *
          feature *
          1.25 *
          phaseB;

        transformed.z +=
          sin(
            productLuma *
            20.0 +
            time *
            3.0
          ) *
          feature *
          0.55 *
          phaseB;
      `;

    case "color-layer-stack":
      return `
        /*
         * FIELD 1: RGB dominance
         * FIELD 2: saturation
         */
        float maxChannel =
          max(
            productRed,
            max(
              productGreen,
              productBlue
            )
          );

        float redMask =
          step(
            productGreen,
            productRed
          ) *
          step(
            productBlue,
            productRed
          );

        float greenMask =
          step(
            productRed,
            productGreen
          ) *
          step(
            productBlue,
            productGreen
          );

        float blueMask =
          1.0 -
          max(
            redMask,
            greenMask
          );

        float layer =
          redMask *
            -1.0 +
          greenMask *
            0.0 +
          blueMask *
            1.0;

        float chroma =
          (
            0.25 +
            productSaturation *
            1.8
          ) *
          productAlpha;

        transformed.z +=
          layer *
          3.0 *
          chroma *
          phaseA;

        transformed.x +=
          layer *
          1.15 *
          chroma *
          phaseB;

        transformed.y +=
          (
            maxChannel -
            0.5
          ) *
          0.8 *
          phaseB;
      `;

    case "medial-skeleton":
      return `
        /*
         * FIELD 1: edge distance
         * FIELD 2: contrast
         *
         * Interior ridge behaves as structural skeleton.
         */
        float core =
          pow(
            edgeDistance,
            2.4
          ) *
          productAlpha;

        float detail =
          smoothstep(
            0.01,
            0.14,
            productContrast
          );

        transformed.x *=
          1.0 -
          core *
          0.72 *
          phaseA;

        transformed.y *=
          1.0 -
          core *
          0.18 *
          phaseA;

        transformed.z +=
          core *
          4.5 *
          phaseA;

        transformed.xy +=
          vec2(
            edgeNormalX,
            edgeNormalY
          ) *
          (
            1.0 -
            core
          ) *
          detail *
          0.75 *
          phaseB;
      `;

    case "surface-compression":
      return `
        /*
         * FIELD 1: luminance
         * FIELD 2: local contrast
         */
        float lightField =
          productLuma -
          0.5;

        float detail =
          smoothstep(
            0.015,
            0.14,
            productContrast
          );

        transformed.z +=
          lightField *
          4.0 *
          phaseA *
          productAlpha;

        float compression =
          (
            detail *
            0.22
          ) *
          phaseB;

        transformed.xy *=
          1.0 -
          compression;

        transformed.z +=
          detail *
          sin(
            time *
            3.0 +
            edgeDistance *
            20.0
          ) *
          0.7 *
          phaseB;
      `;

    case "contour-ribbons":
      return `
        /*
         * FIELD 1: edge distance
         * FIELD 2: gradient direction
         */
        float ribbonBand =
          abs(
            fract(
              edgeDistance *
              8.0
            ) -
            0.5
          );

        float ribbon =
          1.0 -
          smoothstep(
            0.10,
            0.28,
            ribbonBand
          );

        vec2 gradient =
          vec2(
            gradientX,
            gradientY
          );

        float gl =
          length(
            gradient
          );

        vec2 tangent =
          gl >
            0.0001
            ? normalize(
                vec2(
                  -gradient.y,
                  gradient.x
                )
              )
            : vec2(
                0.0
              );

        transformed.z +=
          ribbon *
          sin(
            edgeDistance *
            28.0 +
            time *
            2.5
          ) *
          2.6 *
          phaseA *
          productAlpha;

        transformed.xy +=
          tangent *
          ribbon *
          0.85 *
          phaseB;
      `;

    case "feature-wave":
      return `
        /*
         * FIELD 1: gradient magnitude
         * FIELD 2: edge distance
         */
        vec2 gradient =
          vec2(
            gradientX,
            gradientY
          );

        float magnitude =
          length(
            gradient
          );

        float feature =
          smoothstep(
            0.008,
            0.14,
            magnitude
          );

        float front =
          fract(
            time *
            0.24
          );

        float wave =
          exp(
            -abs(
              edgeDistance -
              front
            ) *
            20.0
          );

        transformed.z +=
          wave *
          (
            1.0 +
            feature *
            2.5
          ) *
          2.0 *
          phaseA *
          productAlpha;

        if (
          magnitude >
          0.0001
        ) {
          transformed.xy +=
            normalize(
              gradient
            ) *
            wave *
            feature *
            0.9 *
            phaseB;
        }
      `;

    case "chromatic-volume":
      return `
        /*
         * FIELD 1: RGB vector
         * FIELD 2: luminance
         */
        vec3 chroma =
          vec3(
            productRed,
            productGreen,
            productBlue
          ) -
          vec3(
            productLuma
          );

        transformed.x +=
          (
            chroma.r -
            chroma.b
          ) *
          2.5 *
          phaseA *
          productAlpha;

        transformed.y +=
          (
            chroma.g -
            chroma.r
          ) *
          2.0 *
          phaseA *
          productAlpha;

        transformed.z +=
          (
            chroma.b -
            chroma.g
          ) *
          4.2 *
          phaseA *
          productAlpha;

        transformed.z +=
          (
            productLuma -
            0.5
          ) *
          2.0 *
          phaseB *
          productAlpha;
      `;

    case "topology-crumple":
      return `
        /*
         * FIELD 1: contrast
         * FIELD 2: gradient direction
         * FIELD 3: silhouette distance
         */
        vec2 gradient =
          vec2(
            gradientX,
            gradientY
          );

        float magnitude =
          length(
            gradient
          );

        float crease =
          smoothstep(
            0.012,
            0.15,
            productContrast +
            magnitude *
            0.7
          );

        float interior =
          smoothstep(
            0.05,
            0.75,
            edgeDistance
          );

        float fold =
          sin(
            transformed.x *
              5.0 +
            transformed.y *
              3.0 +
            productLuma *
              12.0
          );

        transformed.z +=
          fold *
          crease *
          interior *
          2.8 *
          phaseA;

        transformed.x +=
          gradientY *
          crease *
          2.0 *
          phaseB;

        transformed.y -=
          gradientX *
          crease *
          2.0 *
          phaseB;
      `;

    case "field-fusion":
    default:
      return `
        /*
         * Full multi-field fusion.
         *
         * alpha
         * silhouette distance
         * luminance
         * saturation
         * local contrast
         * image gradient
         */
        vec2 gradient =
          vec2(
            gradientX,
            gradientY
          );

        float magnitude =
          length(
            gradient
          );

        vec2 direction =
          magnitude >
            0.0001
            ? normalize(
                gradient
              )
            : vec2(
                0.0
              );

        float detail =
          smoothstep(
            0.012,
            0.15,
            productContrast
          );

        float core =
          pow(
            edgeDistance,
            1.6
          );

        float chroma =
          productSaturation;

        float field =
          (
            detail *
              0.35 +
            core *
              0.30 +
            chroma *
              0.20 +
            productLuma *
              0.15
          ) *
          productAlpha;

        transformed.z +=
          (
            core *
              2.8 +
            detail *
              2.0 -
            productLuma *
              1.2
          ) *
          phaseA *
          productAlpha;

        transformed.xy +=
          direction *
          field *
          1.25 *
          phaseA;

        float angle =
          (
            productLuma -
            0.5
          ) *
          field *
          1.8 *
          phaseB;

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
            phaseB *
            field
          );

        transformed.z +=
          sin(
            edgeDistance *
              24.0 +
            time *
              2.2 +
            productSaturation *
              8.0
          ) *
          field *
          0.65 *
          phaseB;
      `;
  }
};

const ProductProceduralSurface:
  React.FC<{
    texture: THREE.Texture;
    image: HTMLImageElement;
    product: ProductAnalysis;
    frame: number;
    fps: number;
    variant:
      ProductProceduralVariant;
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
          buildGeometry(
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
        /*
         * Proven AS5 material.
         * We only modify vertices.
         */
        const m =
          createExactProductMaterial(
            texture,
          );

        m.onBeforeCompile =
          (
            shader,
          ) => {
            shader.uniforms
              .phaseA = {
                value: 1,
              };

            shader.uniforms
              .phaseB = {
                value: 0,
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
                attribute float productLuma;
                attribute float productSaturation;
                attribute float productContrast;
                attribute float gradientX;
                attribute float gradientY;
                attribute float edgeNormalX;
                attribute float edgeNormalY;
                attribute float edgeDistance;
                attribute float productRed;
                attribute float productGreen;
                attribute float productBlue;

                uniform float phaseA;
                uniform float phaseB;
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

                ${deformationFor(
                  variant,
                )}
                `,
              );

            m.userData.shader =
              shader;
          };

        m.customProgramCacheKey =
          () =>
            `as5-procedural-system-${variant}-v1`;

        return m;
      }, [
        texture,
        variant,
      ]);

    /*
     * THREE STAGE SYSTEM
     *
     * 0.0–1.15s:
     * establish first geometry state
     *
     * 1.15–2.45s:
     * secondary interaction
     *
     * 2.45–3.65s:
     * both fields resolve EXACTLY to zero
     */
    const stageAIn =
      smooth01(
        interpolate(
          frame,
          [
            0,
            fps * 0.55,
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
        ),
      );

    const stageAOut =
      smooth01(
        interpolate(
          frame,
          [
            fps * 2.45,
            fps * 3.65,
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
        ),
      );

    const phaseA =
      stageAIn *
      (
        1 -
        stageAOut
      );

    const stageBIn =
      smooth01(
        interpolate(
          frame,
          [
            fps * 1.0,
            fps * 1.65,
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
        ),
      );

    const stageBOut =
      smooth01(
        interpolate(
          frame,
          [
            fps * 2.65,
            fps * 3.65,
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
        ),
      );

    const phaseB =
      stageBIn *
      (
        1 -
        stageBOut
      );

    const shader =
      material.userData
        .shader as
        | {
            uniforms: {
              phaseA: {
                value: number;
              };
              phaseB: {
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
        .phaseA.value =
          phaseA;

      shader.uniforms
        .phaseB.value =
          phaseB;

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
        frustumCulled={
          false
        }
      />
    );
  };

const LoadedScene:
  React.FC<{
    imageSrc: string;
    frame: number;
    fps: number;
    variant:
      ProductProceduralVariant;
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

    const scale =
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
          Math.sin(
            seconds *
            1.1,
          ) *
            0.06,
          0,
        ]}
        rotation={[
          0,
          Math.sin(
            seconds *
            0.8,
          ) *
            0.012,
          0,
        ]}
        scale={[
          scale,
          scale,
          scale,
        ]}
      >
        <ProductProceduralSurface
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
      ProductProceduralVariant;
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
        <LoadedScene
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

export const ProductProceduralSystemTemplate:
  React.FC<
    ProductProceduralTemplateProps & {
      variant:
        ProductProceduralVariant;
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

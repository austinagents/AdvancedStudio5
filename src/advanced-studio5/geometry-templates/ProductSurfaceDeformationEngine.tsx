import React, {
  Suspense,
  useMemo,
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

export type SurfaceVariant =
  | "wave"
  | "sine-slice"
  | "lens"
  | "pinch"
  | "twist"
  | "shockwave"
  | "noise"
  | "gravity"
  | "ripple"
  | "elastic";

export type ProductSurfaceTemplateProps = {
  imageSrc?: string;
};

type ProductAnalysis = {
  planeWidth: number;
  planeHeight: number;
  offsetX: number;
  offsetY: number;
};

const analyzeProduct = (
  image: HTMLImageElement,
): ProductAnalysis => {
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
      "Unable to analyze product image.",
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

  const pixels =
    context.getImageData(
      0,
      0,
      width,
      height,
    ).data;

  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  for (
    let y = 0;
    y < height;
    y++
  ) {
    for (
      let x = 0;
      x < width;
      x++
    ) {
      const alpha =
        pixels[
          (
            y * width +
            x
          ) *
            4 +
          3
        ];

      if (alpha > 1) {
        minX =
          Math.min(
            minX,
            x,
          );

        maxX =
          Math.max(
            maxX,
            x,
          );

        minY =
          Math.min(
            minY,
            y,
          );

        maxY =
          Math.max(
            maxY,
            y,
          );
      }
    }
  }

  if (
    maxX < minX ||
    maxY < minY
  ) {
    throw new Error(
      "No product silhouette found.",
    );
  }

  /*
   * EXACT SAME final sizing rule
   * as our accepted product.
   */
  const visiblePixelsW =
    maxX - minX + 1;

  const visiblePixelsH =
    maxY - minY + 1;

  const visibleHeight = 5.55;

  const planeHeight =
    visibleHeight *
    (
      height /
      visiblePixelsH
    );

  const planeWidth =
    planeHeight *
    (
      width /
      height
    );

  const centerX =
    (
      minX +
      maxX +
      1
    ) / 2;

  const centerY =
    (
      minY +
      maxY +
      1
    ) / 2;

  const offsetX =
    -(
      (
        centerX /
        width -
        0.5
      ) *
      planeWidth
    );

  const offsetY =
    (
      centerY /
      height -
      0.5
    ) *
    planeHeight;

  return {
    planeWidth,
    planeHeight,
    offsetX,
    offsetY,
  };
};

const deformationCode = (
  variant: SurfaceVariant,
) => {
  switch (variant) {
    case "wave":
      return `
        float wave =
          sin(
            position.y * 3.2 +
            time * 2.8
          );

        transformed.z +=
          wave *
          1.15 *
          strength;

        transformed.x +=
          sin(
            position.y * 1.7 +
            time * 1.4
          ) *
          0.22 *
          strength;
      `;

    case "sine-slice":
      return `
        float slice =
          floor(
            uv.y * 28.0
          );

        float phase =
          slice * 0.72;

        transformed.z +=
          sin(
            phase +
            time * 3.4
          ) *
          1.35 *
          strength;

        transformed.x +=
          cos(
            phase +
            time * 2.1
          ) *
          0.20 *
          strength;
      `;

    case "lens":
      return `
        vec2 centered =
          uv -
          vec2(
            0.5
          );

        float distanceFromCenter =
          length(
            centered
          );

        float lens =
          exp(
            -distanceFromCenter *
            distanceFromCenter *
            16.0
          );

        transformed.z +=
          lens *
          2.15 *
          strength;

        transformed.xy +=
          centered *
          lens *
          0.85 *
          strength;
      `;

    case "pinch":
      return `
        vec2 centered =
          uv -
          vec2(
            0.5
          );

        float d =
          length(
            centered
          );

        float pinch =
          smoothstep(
            0.72,
            0.0,
            d
          );

        transformed.xy -=
          centered *
          pinch *
          0.72 *
          strength;

        transformed.z +=
          pinch *
          sin(
            time * 2.6
          ) *
          0.75 *
          strength;
      `;

    case "twist":
      return `
        float normalizedY =
          uv.y -
          0.5;

        float angle =
          normalizedY *
          4.8 *
          strength;

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
            transformed.x * c -
              transformed.z * s,
            transformed.x * s +
              transformed.z * c
          );

        transformed.x =
          rotated.x;

        transformed.z =
          rotated.y;
      `;

    case "shockwave":
      return `
        vec2 centered =
          uv -
          vec2(
            0.5
          );

        float d =
          length(
            centered
          );

        float ringCenter =
          fract(
            time * 0.32
          ) *
          0.72;

        float ring =
          exp(
            -pow(
              (
                d -
                ringCenter
              ) *
              16.0,
              2.0
            )
          );

        transformed.z +=
          ring *
          2.3 *
          strength;

        transformed.xy +=
          normalize(
            centered +
            vec2(
              0.0001
            )
          ) *
          ring *
          0.38 *
          strength;
      `;

    case "noise":
      return `
        float n1 =
          sin(
            position.x * 5.7 +
            position.y * 3.1 +
            time * 2.0
          );

        float n2 =
          cos(
            position.y * 7.2 -
            position.x * 2.3 +
            time * 1.3
          );

        float noiseValue =
          n1 * 0.62 +
          n2 * 0.38;

        transformed.z +=
          noiseValue *
          1.15 *
          strength;

        transformed.x +=
          n2 *
          0.16 *
          strength;
      `;

    case "gravity":
      return `
        float normalizedY =
          uv.y -
          0.5;

        float pull =
          sign(
            normalizedY
          ) *
          pow(
            abs(
              normalizedY
            ) *
            2.0,
            1.6
          );

        transformed.x +=
          pull *
          0.82 *
          strength;

        transformed.z +=
          abs(
            normalizedY
          ) *
          1.2 *
          strength;

        transformed.y -=
          sin(
            uv.x *
            3.14159265
          ) *
          0.32 *
          strength;
      `;

    case "ripple":
      return `
        float scan =
          fract(
            time * 0.26
          );

        float distanceToScan =
          abs(
            uv.y -
            scan
          );

        float ripple =
          exp(
            -distanceToScan *
            18.0
          ) *
          sin(
            distanceToScan *
            55.0 -
            time * 5.0
          );

        transformed.z +=
          ripple *
          1.7 *
          strength;

        transformed.x +=
          ripple *
          0.12 *
          strength;
      `;

    case "elastic":
      return `
        float xStretch =
          1.0 +
          sin(
            time * 2.7
          ) *
          0.48 *
          strength;

        float yStretch =
          1.0 +
          cos(
            time * 2.1
          ) *
          0.30 *
          strength;

        transformed.x *=
          xStretch;

        transformed.y *=
          yStretch;

        transformed.z +=
          sin(
            uv.y *
            12.0 +
            time * 3.2
          ) *
          0.34 *
          strength;
      `;
  }
};

const DeformedProduct:
  React.FC<{
    imageSrc: string;
    frame: number;
    fps: number;
    variant: SurfaceVariant;
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

    /*
     * SAME accepted product
     * texture pipeline.
     */
    texture.colorSpace =
      THREE.SRGBColorSpace;

    texture.wrapS =
      THREE.ClampToEdgeWrapping;

    texture.wrapT =
      THREE.ClampToEdgeWrapping;

    texture.magFilter =
      THREE.LinearFilter;

    texture.minFilter =
      THREE.LinearMipmapLinearFilter;

    texture.generateMipmaps =
      true;

    texture.anisotropy = 16;

    texture.needsUpdate =
      true;

    const image =
      texture.image as
        HTMLImageElement;

    const product =
      useMemo(
        () =>
          analyzeProduct(
            image,
          ),
        [image],
      );

    /*
     * Dense continuous surface.
     * No detached shards.
     */
    const geometry =
      useMemo(
        () =>
          new THREE.PlaneGeometry(
            product.planeWidth,
            product.planeHeight,
            64,
            160,
          ),
        [
          product.planeWidth,
          product.planeHeight,
        ],
      );

    const material =
      useMemo(() => {
        /*
         * SAME accepted final
         * MeshBasicMaterial.
         *
         * Only vertex positions
         * are modified.
         */
        const m =
          new THREE.MeshBasicMaterial(
            {
              map: texture,
              transparent: true,
              alphaTest: 0,
              depthWrite: true,
              toneMapped: false,
              side:
                THREE.FrontSide,
            },
          );

        m.onBeforeCompile = (
          shader,
        ) => {
          shader.uniforms.time =
            {
              value: 0,
            };

          shader.uniforms.strength =
            {
              value: 1,
            };

          shader.vertexShader =
            shader.vertexShader.replace(
              "void main() {",
              `
              uniform float time;
              uniform float strength;

              void main() {
              `,
            );

          shader.vertexShader =
            shader.vertexShader.replace(
              "#include <begin_vertex>",
              `
              vec3 transformed =
                vec3(
                  position
                );

              ${deformationCode(
                variant,
              )}
              `,
            );

          m.userData.shader =
            shader;
        };

        m.customProgramCacheKey =
          () =>
            `as5-surface-${variant}-v1`;

        return m;
      }, [
        texture,
        variant,
      ]);

    /*
     * Effect strength drops
     * completely to zero.
     *
     * Final state therefore =
     * exact undeformed product.
     */
    const settle =
      interpolate(
        frame,
        [
          0,
          fps * 3.4,
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

    const smoothSettle =
      settle *
      settle *
      (
        3 -
        2 * settle
      );

    const strength =
      1 -
      smoothSettle;

    const shader =
      material.userData
        .shader as
        | {
            uniforms: {
              time: {
                value: number;
              };
              strength: {
                value: number;
              };
            };
          }
        | undefined;

    if (shader) {
      shader.uniforms
        .time.value =
          frame / fps;

      shader.uniforms
        .strength.value =
          strength;
    }

    /*
     * Preserve exact accepted
     * hero movement.
     */
    const seconds =
      frame / fps;

    const rotationY =
      Math.sin(
        seconds * 0.8,
      ) * 0.012;

    const floatY =
      Math.sin(
        seconds * 1.1,
      ) * 0.06;

    /*
     * Keep existing hero reveal.
     */
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
            0,
          ]}
        />
      </group>
    );
  };

const Scene:
  React.FC<{
    imageSrc?: string;
    frame: number;
    fps: number;
    variant: SurfaceVariant;
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
      <Suspense
        fallback={null}
      >
        <DeformedProduct
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

export const ProductSurfaceDeformationTemplate:
  React.FC<
    ProductSurfaceTemplateProps & {
      variant: SurfaceVariant;
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
          width={width}
          height={height}
          camera={{
            position: [
              0,
              0,
              9,
            ],
            fov: 38,
            near: 0.1,
            far: 100,
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

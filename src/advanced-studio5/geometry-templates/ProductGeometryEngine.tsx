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
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type GeometryVariant =
  | "voxel"
  | "ribbon"
  | "radial"
  | "layers"
  | "helix"
  | "magnetic"
  | "liquid"
  | "origami"
  | "scanline"
  | "tunnel";

export type ProductGeometryTemplateProps = {
  imageSrc?: string;
};

type ProductData = {
  planeWidth: number;
  planeHeight: number;
  offsetX: number;
  offsetY: number;
};

const analyzeProduct = (
  image: HTMLImageElement,
): ProductData => {
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

  const ctx =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      },
    );

  if (!ctx) {
    throw new Error(
      "Unable to analyze product image.",
    );
  }

  ctx.clearRect(
    0,
    0,
    width,
    height,
  );

  ctx.drawImage(
    image,
    0,
    0,
    width,
    height,
  );

  const pixels =
    ctx.getImageData(
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
   * EXACTLY mirrors ProductMesh.
   */
  const visiblePixelsW =
    maxX -
    minX +
    1;

  const visiblePixelsH =
    maxY -
    minY +
    1;

  const visibleHeight =
    5.55;

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
    ) /
    2;

  const centerY =
    (
      minY +
      maxY +
      1
    ) /
    2;

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

const seeded = (
  index: number,
  salt: number,
) => {
  const x =
    Math.sin(
      index *
        12.9898 +
        salt *
          78.233,
    ) *
    43758.5453;

  return (
    x -
    Math.floor(x)
  );
};

const geometrySettings: Record<
  GeometryVariant,
  {
    x: number;
    y: number;
  }
> = {
  voxel: {
    x: 30,
    y: 90,
  },

  ribbon: {
    x: 14,
    y: 120,
  },

  radial: {
    x: 34,
    y: 100,
  },

  layers: {
    x: 12,
    y: 128,
  },

  helix: {
    x: 26,
    y: 120,
  },

  magnetic: {
    x: 30,
    y: 110,
  },

  liquid: {
    x: 34,
    y: 128,
  },

  origami: {
    x: 20,
    y: 72,
  },

  scanline: {
    x: 12,
    y: 140,
  },

  tunnel: {
    x: 30,
    y: 110,
  },
};

const deformationForVariant = (
  variant: GeometryVariant,
) => {
  switch (variant) {
    case "voxel":
      return `
        float cell =
          0.34;

        vec3 start =
          target;

        start.x =
          floor(
            target.x /
              cell
          ) *
          cell;

        start.y =
          floor(
            target.y /
              cell
          ) *
          cell;

        start.x *=
          1.7;

        start.y *=
          1.15;

        start.z =
          (
            aSeed -
            0.5
          ) *
          8.0;

        start.x +=
          (
            fract(
              aSeed *
              19.31
            ) -
            0.5
          ) *
          3.8;

        localProgress =
          smoothstep(
            aSeed *
              0.16,
            0.72 +
              aSeed *
              0.18,
            progress
          );
      `;

    case "ribbon":
      return `
        float wave =
          target.y *
            2.4 +
          aSeed *
            6.28318;

        vec3 start =
          target;

        start.x +=
          sin(wave) *
          4.8;

        start.z +=
          cos(wave) *
          4.5;

        start.y *=
          0.82;

        start.x +=
          (
            uv.x -
            0.5
          ) *
          2.0;

        localProgress =
          smoothstep(
            uv.x *
              0.20,
            0.70 +
              uv.x *
              0.20,
            progress
          );
      `;

    case "radial":
      return `
        vec2 radial =
          normalize(
            target.xy +
            vec2(
              0.0001
            )
          );

        float distanceOut =
          4.0 +
          aSeed *
          6.5;

        vec3 start =
          target;

        start.xy =
          radial *
          distanceOut;

        start.z =
          (
            aSeed -
            0.5
          ) *
          7.5;

        localProgress =
          smoothstep(
            aSeed *
              0.18,
            0.76 +
              aSeed *
              0.14,
            progress
          );
      `;

    case "layers":
      return `
        float band =
          floor(
            uv.y *
            30.0
          );

        float bandSeed =
          fract(
            sin(
              band *
              91.731
            ) *
            43758.5453
          );

        vec3 start =
          target;

        start.x +=
          (
            bandSeed -
            0.5
          ) *
          9.0;

        start.z =
          (
            fract(
              bandSeed *
              8.13
            ) -
            0.5
          ) *
          6.0;

        start.y =
          target.y *
          1.12;

        localProgress =
          smoothstep(
            uv.y *
              0.28,
            0.60 +
              uv.y *
              0.28,
            progress
          );
      `;

    case "helix":
      return `
        float angle =
          uv.y *
            31.4159 +
          aSeed *
            2.0;

        float radius =
          3.0 +
          aSeed *
          1.8;

        vec3 start =
          vec3(
            cos(angle) *
              radius,
            target.y *
              1.18,
            sin(angle) *
              radius
          );

        start.x +=
          target.x *
          0.35;

        localProgress =
          smoothstep(
            uv.y *
              0.16,
            0.72 +
              uv.y *
              0.18,
            progress
          );
      `;

    case "magnetic":
      return `
        float field =
          target.y *
            1.65 +
          aSeed *
            6.28318;

        vec3 start =
          target;

        start.x +=
          sin(field) *
          (
            3.5 +
            aSeed *
            2.2
          );

        start.z +=
          cos(field) *
          (
            2.8 +
            aSeed *
            2.0
          );

        start.y +=
          sin(
            field *
            0.5
          ) *
          2.2;

        localProgress =
          smoothstep(
            aSeed *
              0.14,
            0.75 +
              aSeed *
              0.15,
            progress
          );
      `;

    case "liquid":
      return `
        vec3 start =
          target;

        start.y =
          -5.4 -
          aSeed *
          4.5 +
          uv.y *
          1.4;

        start.x +=
          sin(
            uv.y *
              18.0 +
            aSeed *
              8.0
          ) *
          2.5;

        start.z =
          (
            aSeed -
            0.5
          ) *
          4.5;

        localProgress =
          smoothstep(
            (
              1.0 -
              uv.y
            ) *
              0.28,
            0.62 +
              (
                1.0 -
                uv.y
              ) *
              0.28,
            progress
          );
      `;

    case "origami":
      return `
        float gridX =
          floor(
            uv.x *
            10.0
          );

        float gridY =
          floor(
            uv.y *
            24.0
          );

        float parity =
          mod(
            gridX +
            gridY,
            2.0
          );

        float fold =
          parity *
            2.0 -
          1.0;

        vec3 start =
          target;

        start.z +=
          fold *
          (
            2.8 +
            aSeed *
            3.0
          );

        start.x +=
          fold *
          (
            uv.y -
            0.5
          ) *
          3.8;

        start.y +=
          (
            aSeed -
            0.5
          ) *
          1.8;

        localProgress =
          smoothstep(
            aSeed *
              0.18,
            0.70 +
              aSeed *
              0.20,
            progress
          );
      `;

    case "scanline":
      return `
        float row =
          floor(
            uv.y *
            72.0
          );

        float side =
          mod(
            row,
            2.0
          ) *
            2.0 -
          1.0;

        vec3 start =
          target;

        start.x +=
          side *
          (
            4.5 +
            aSeed *
            2.0
          );

        start.z =
          (
            aSeed -
            0.5
          ) *
          2.0;

        localProgress =
          smoothstep(
            uv.y *
              0.70,
            uv.y *
              0.70 +
              0.26,
            progress
          );
      `;

    case "tunnel":
      return `
        float angle =
          aSeed *
            6.28318 +
          uv.y *
            12.0;

        float radialScale =
          2.4 +
          aSeed *
          2.2;

        vec3 start =
          target;

        start.xy *=
          radialScale;

        start.x +=
          cos(angle) *
          2.5;

        start.y +=
          sin(angle) *
          2.5;

        start.z =
          6.0 +
          aSeed *
          11.0;

        localProgress =
          smoothstep(
            aSeed *
              0.20,
            0.70 +
              aSeed *
              0.18,
            progress
          );
      `;
  }
};

const ProductGeometry:
  React.FC<{
    imageSrc: string;
    frame: number;
    fps: number;
    variant:
      GeometryVariant;
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
     * EXACT accepted product
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

    texture.anisotropy =
      16;

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

    const settings =
      geometrySettings[
        variant
      ];

    const geometry =
      useMemo(() => {
        const g =
          new THREE.PlaneGeometry(
            product.planeWidth,
            product.planeHeight,
            settings.x,
            settings.y,
          );

        const position =
          g.attributes
            .position as
            THREE.BufferAttribute;

        const seeds =
          new Float32Array(
            position.count,
          );

        for (
          let i = 0;
          i <
          position.count;
          i++
        ) {
          seeds[i] =
            seeded(
              i,
              97,
            );
        }

        g.setAttribute(
          "aSeed",
          new THREE.BufferAttribute(
            seeds,
            1,
          ),
        );

        return g;
      }, [
        product.planeWidth,
        product.planeHeight,
        settings.x,
        settings.y,
      ]);

    const deformation =
      deformationForVariant(
        variant,
      );

    const material =
      useMemo(() => {
        /*
         * SAME final material as
         * accepted ProductMesh.
         *
         * Only vertex positions
         * are procedurally altered.
         */
        const m =
          new THREE.MeshBasicMaterial(
            {
              map: texture,
              transparent:
                true,
              alphaTest: 0,
              depthWrite:
                true,
              toneMapped:
                false,
              side:
                THREE.FrontSide,
            },
          );

        m.onBeforeCompile =
          (
            shader,
          ) => {
            shader.uniforms
              .uProgress = {
                value: 0,
              };

            shader.uniforms
              .uTime = {
                value: 0,
              };

            shader.vertexShader =
              shader.vertexShader.replace(
                "void main() {",
                `
                attribute float aSeed;

                uniform float uProgress;
                uniform float uTime;

                void main() {
                `,
              );

            shader.vertexShader =
              shader.vertexShader.replace(
                "#include <begin_vertex>",
                `
                vec3 target =
                  position;

                float progress =
                  clamp(
                    uProgress,
                    0.0,
                    1.0
                  );

                float localProgress =
                  progress;

                ${deformation}

                localProgress =
                  clamp(
                    localProgress,
                    0.0,
                    1.0
                  );

                float eased =
                  localProgress *
                  localProgress *
                  (
                    3.0 -
                    2.0 *
                    localProgress
                  );

                vec3 transformed =
                  mix(
                    start,
                    target,
                    eased
                  );

                /*
                 * HARD FINAL-STATE
                 * GUARANTEE.
                 *
                 * At the end, geometry
                 * becomes the exact
                 * accepted product plane.
                 */
                if (
                  progress >
                  0.985
                ) {
                  transformed =
                    target;
                }
                `,
              );

            m.userData.shader =
              shader;
          };

        m.customProgramCacheKey =
          () =>
            `as5-${variant}-v1`;

        return m;
      }, [
        texture,
        deformation,
        variant,
      ]);

    const rawAssembly =
      spring({
        frame,
        fps,
        config: {
          damping: 18,
          stiffness: 70,
          mass: 0.8,
        },
        durationInFrames:
          Math.round(
            fps *
              3.2,
          ),
      });

    const assembly =
      Math.max(
        0,
        Math.min(
          1,
          rawAssembly,
        ),
      );

    const shader =
      material.userData
        .shader as
        | {
            uniforms: {
              uProgress: {
                value:
                  number;
              };
              uTime: {
                value:
                  number;
              };
            };
          }
        | undefined;

    if (shader) {
      shader.uniforms
        .uProgress.value =
          assembly;

      shader.uniforms
        .uTime.value =
          frame /
          fps;
    }

    /*
     * EXACT accepted hero motion.
     */
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
            0.012,
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
    variant:
      GeometryVariant;
  }> = ({
    imageSrc,
    frame,
    fps,
    variant,
  }) => {
    return (
      <>
        {imageSrc ? (
          <Suspense
            fallback={
              null
            }
          >
            <ProductGeometry
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
        ) : null}
      </>
    );
  };

export const ProductGeometryTemplate:
  React.FC<
    ProductGeometryTemplateProps & {
      variant:
        GeometryVariant;
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

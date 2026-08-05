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
  createProductPanelGeometry,
  type ProductAnalysis,
} from "./ProductGeometryCore";

export type SpatialVariant =
  | "echo"
  | "mobius"
  | "tunnel"
  | "blinds"
  | "layers"
  | "cylinder"
  | "kaleidoscope"
  | "accordion"
  | "portal"
  | "extrusion";

export type ProductSpatialTemplateProps = {
  imageSrc?: string;
};

const smooth01 = (
  value: number,
) => {
  const t =
    THREE.MathUtils.clamp(
      value,
      0,
      1,
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

const SurfaceWarp:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    strength: number;
    time: number;
    mode:
      | "mobius"
      | "cylinder";
  }> = ({
    texture,
    product,
    strength,
    time,
    mode,
  }) => {
    const geometry =
      useMemo(
        () =>
          new THREE.PlaneGeometry(
            product.planeWidth,
            product.planeHeight,
            96,
            160,
          ),
        [
          product.planeWidth,
          product.planeHeight,
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

          shader.vertexShader =
            shader.vertexShader.replace(
              "void main() {",
              `
              uniform float strength;
              uniform float time;

              void main() {
              `,
            );

          const transform =
            mode ===
            "mobius"
              ? `
              vec3 transformed =
                position;

              float u =
                uv.x -
                0.5;

              float v =
                uv.y -
                0.5;

              float angle =
                u *
                6.2831853;

              float twist =
                angle *
                0.5;

              float radius =
                2.1;

              vec3 ribbon =
                vec3(
                  (
                    radius +
                    v *
                    cos(
                      twist
                    ) *
                    1.5
                  ) *
                  cos(
                    angle
                  ),

                  v *
                  sin(
                    twist
                  ) *
                  3.0,

                  (
                    radius +
                    v *
                    cos(
                      twist
                    ) *
                    1.5
                  ) *
                  sin(
                    angle
                  )
                );

              ribbon.x -=
                radius;

              transformed =
                mix(
                  transformed,
                  ribbon,
                  strength
                );
              `
              : `
              vec3 transformed =
                position;

              float normalizedX =
                uv.x -
                0.5;

              float angle =
                normalizedX *
                4.8 *
                strength;

              float radius =
                2.0;

              vec3 wrapped =
                vec3(
                  sin(
                    angle
                  ) *
                  radius,
                  position.y,
                  (
                    1.0 -
                    cos(
                      angle
                    )
                  ) *
                  radius
                );

              transformed.x =
                mix(
                  position.x,
                  wrapped.x,
                  strength
                );

              transformed.z =
                mix(
                  position.z,
                  wrapped.z,
                  strength
                );
              `;

          shader.vertexShader =
            shader.vertexShader.replace(
              "#include <begin_vertex>",
              transform,
            );

          m.userData.shader =
            shader;
        };

        m.customProgramCacheKey =
          () =>
            `as5-spatial-${mode}-v1`;

        return m;
      }, [
        texture,
        mode,
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
            };
          }
        | undefined;

    if (shader) {
      shader.uniforms
        .strength.value =
          strength;

      shader.uniforms
        .time.value =
          time;
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

const EchoEffect:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    strength: number;
    time: number;
  }> = ({
    texture,
    product,
    strength,
    time,
  }) => {
    const copies = 18;

    return (
      <>
        {Array.from(
          {
            length:
              copies,
          },
          (
            _,
            index,
          ) => {
            const t =
              index /
              Math.max(
                copies -
                  1,
                1,
              );

            const isHero =
              index === 0;

            const z =
              isHero
                ? 0
                : (
                    -0.4 -
                    t * 9
                  ) *
                  strength;

            const x =
              isHero
                ? 0
                : Math.sin(
                    time *
                      1.4 +
                      index *
                        0.58,
                  ) *
                  0.7 *
                  strength;

            const y =
              isHero
                ? 0
                : Math.cos(
                    time *
                      1.1 +
                      index *
                        0.41,
                  ) *
                  0.4 *
                  strength;

            const scale =
              isHero
                ? 1
                : 1 -
                  t *
                    0.42 *
                    strength;

            const opacity =
              isHero
                ? 1
                : strength *
                  (
                    0.32 -
                    t *
                      0.22
                  );

            return (
              <group
                key={
                  index
                }
                position={[
                  x,
                  y,
                  z,
                ]}
                scale={[
                  scale,
                  scale,
                  scale,
                ]}
              >
                <ExactProduct
                  texture={
                    texture
                  }
                  product={
                    product
                  }
                  opacity={
                    opacity
                  }
                />
              </group>
            );
          },
        )}
      </>
    );
  };

const TunnelEffect:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    strength: number;
    time: number;
  }> = ({
    texture,
    product,
    strength,
    time,
  }) => {
    const copies = 22;

    return (
      <>
        {Array.from(
          {
            length:
              copies,
          },
          (
            _,
            index,
          ) => {
            const t =
              index /
              (
                copies -
                1
              );

            const z =
              -(
                t *
                14
              ) *
              strength;

            const rotation =
              (
                index *
                0.11 +
                time *
                  0.18
              ) *
              strength;

            const scale =
              1 -
              t *
                0.62 *
                strength;

            const opacity =
              index === 0
                ? 1
                : strength *
                  (
                    0.30 -
                    t *
                      0.22
                  );

            return (
              <group
                key={
                  index
                }
                position={[
                  0,
                  0,
                  z,
                ]}
                rotation={[
                  0,
                  0,
                  rotation,
                ]}
                scale={[
                  scale,
                  scale,
                  scale,
                ]}
              >
                <ExactProduct
                  texture={
                    texture
                  }
                  product={
                    product
                  }
                  opacity={
                    opacity
                  }
                />
              </group>
            );
          },
        )}
      </>
    );
  };

const PortalEffect:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    strength: number;
    time: number;
  }> = ({
    texture,
    product,
    strength,
    time,
  }) => {
    const copies = 14;

    return (
      <>
        {Array.from(
          {
            length:
              copies,
          },
          (
            _,
            index,
          ) => {
            const t =
              index /
              (
                copies -
                1
              );

            const pulse =
              Math.sin(
                time *
                  2 +
                  index *
                    0.72,
              );

            const scale =
              index === 0
                ? 1
                : (
                    0.28 +
                    t *
                      1.65 +
                    pulse *
                      0.05
                  );

            const z =
              index === 0
                ? 0
                : (
                    -5 +
                    t *
                      10
                  ) *
                  strength;

            const opacity =
              index === 0
                ? 1
                : 0.18 *
                  strength;

            return (
              <group
                key={
                  index
                }
                position={[
                  0,
                  0,
                  z,
                ]}
                scale={[
                  1 +
                    (
                      scale -
                      1
                    ) *
                      strength,
                  1 +
                    (
                      scale -
                      1
                    ) *
                      strength,
                  1,
                ]}
              >
                <ExactProduct
                  texture={
                    texture
                  }
                  product={
                    product
                  }
                  opacity={
                    opacity
                  }
                />
              </group>
            );
          },
        )}
      </>
    );
  };

const KaleidoscopeEffect:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    strength: number;
    time: number;
  }> = ({
    texture,
    product,
    strength,
    time,
  }) => {
    const copies = 8;

    return (
      <>
        <ExactProduct
          texture={
            texture
          }
          product={
            product
          }
        />

        {Array.from(
          {
            length:
              copies,
          },
          (
            _,
            index,
          ) => {
            const angle =
              index /
                copies *
                Math.PI *
                2 +
              time *
                0.22;

            const radius =
              4.2 *
              strength;

            const x =
              Math.cos(
                angle,
              ) *
              radius;

            const y =
              Math.sin(
                angle,
              ) *
              radius;

            const scale =
              0.46 +
              0.14 *
                Math.sin(
                  time +
                    index,
                );

            return (
              <group
                key={
                  index
                }
                position={[
                  x,
                  y,
                  -0.8,
                ]}
                rotation={[
                  0,
                  0,
                  angle +
                    Math.PI /
                      2,
                ]}
                scale={[
                  scale,
                  scale,
                  scale,
                ]}
              >
                <ExactProduct
                  texture={
                    texture
                  }
                  product={
                    product
                  }
                  opacity={
                    0.42 *
                    strength
                  }
                />
              </group>
            );
          },
        )}
      </>
    );
  };

const PanelEffect:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    strength: number;
    time: number;
    mode:
      | "blinds"
      | "layers"
      | "accordion";
  }> = ({
    texture,
    product,
    strength,
    time,
    mode,
  }) => {
    const count =
      mode ===
      "layers"
        ? 34
        : 30;

    const finalBlend =
      smooth01(
        THREE.MathUtils.clamp(
          (
            0.16 -
            strength
          ) /
            0.16,
          0,
          1,
        ),
      );

    return (
      <>
        <ExactProduct
          texture={
            texture
          }
          product={
            product
          }
          opacity={
            finalBlend
          }
        />

        {Array.from(
          {
            length:
              count,
          },
          (
            _,
            index,
          ) => {
            const t0 =
              index /
              count;

            const t1 =
              (
                index +
                1
              ) /
              count;

            const vertical =
              mode !==
              "layers";

            const geometry =
              createProductPanelGeometry(
                product,
                vertical
                  ? t0
                  : 0,
                vertical
                  ? t1
                  : 1,
                vertical
                  ? 0
                  : t0,
                vertical
                  ? 1
                  : t1,
              );

            const material =
              createExactProductMaterial(
                texture,
                1 -
                  finalBlend,
              );

            const centered =
              (
                index +
                0.5
              ) /
                count -
              0.5;

            let z = 0;
            let rotY = 0;
            let rotX = 0;
            let x = 0;
            let y = 0;

            if (
              mode ===
              "blinds"
            ) {
              rotY =
                Math.sin(
                  time *
                    1.9 +
                    index *
                      0.32,
                ) *
                1.15 *
                strength;

              z =
                Math.cos(
                  index *
                    0.45 +
                    time,
                ) *
                1.2 *
                strength;
            }

            if (
              mode ===
              "layers"
            ) {
              z =
                centered *
                  13 *
                  strength +
                Math.sin(
                  index *
                    0.5 +
                    time *
                      1.5,
                ) *
                  0.45 *
                  strength;

              x =
                Math.sin(
                  index *
                    0.31,
                ) *
                0.5 *
                strength;
            }

            if (
              mode ===
              "accordion"
            ) {
              const sign =
                index %
                  2 ===
                0
                  ? 1
                  : -1;

              rotY =
                sign *
                1.12 *
                strength;

              z =
                sign *
                1.2 *
                strength;

              y =
                Math.sin(
                  index *
                    0.25 +
                    time,
                ) *
                0.12 *
                strength;
            }

            return (
              <mesh
                key={
                  index
                }
                geometry={
                  geometry
                }
                material={
                  material
                }
                position={[
                  product.offsetX +
                    x,
                  product.offsetY +
                    y,
                  0.012 +
                    z,
                ]}
                rotation={[
                  rotX,
                  rotY,
                  0,
                ]}
              />
            );
          },
        )}
      </>
    );
  };

const ExtrusionEffect:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    strength: number;
    time: number;
  }> = ({
    texture,
    product,
    strength,
    time,
  }) => {
    const geometry =
      useMemo(() => {
        if (
          product
            .silhouette
            .length <
          6
        ) {
          return null;
        }

        const shape =
          new THREE.Shape();

        const first =
          product
            .silhouette[0];

        shape.moveTo(
          first[0],
          first[1],
        );

        for (
          let i = 1;
          i <
          product
            .silhouette
            .length;
          i++
        ) {
          const point =
            product
              .silhouette[i];

          shape.lineTo(
            point[0],
            point[1],
          );
        }

        shape.closePath();

        const g =
          new THREE.ExtrudeGeometry(
            shape,
            {
              depth: 0.9,
              bevelEnabled: true,
              bevelSize: 0.035,
              bevelThickness: 0.035,
              bevelSegments: 2,
              steps: 1,
            },
          );

        g.center();

        return g;
      }, [
        product,
      ]);

    const sideMaterial =
      useMemo(
        () =>
          new THREE.MeshStandardMaterial(
            {
              color:
                "#161a21",
              roughness:
                0.42,
              metalness:
                0.35,
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

    const finalBlend =
      smooth01(
        THREE.MathUtils.clamp(
          (
            0.22 -
            strength
          ) /
            0.22,
          0,
          1,
        ),
      );

    return (
      <>
        {geometry ? (
          <group
            position={[
              product.offsetX,
              product.offsetY,
              -0.3,
            ]}
            rotation={[
              0.22 *
                strength,
              (
                1.15 +
                Math.sin(
                  time *
                    0.8,
                ) *
                  0.25
              ) *
                strength,
              -0.06 *
                strength,
            ]}
          >
            <mesh
              geometry={
                geometry
              }
              material={
                sideMaterial
              }
              scale={[
                1,
                1,
                Math.max(
                  strength,
                  0.001,
                ),
              ]}
            />
          </group>
        ) : null}

        <ExactProduct
          texture={
            texture
          }
          product={
            product
          }
          opacity={
            finalBlend
          }
        />
      </>
    );
  };

const SpatialProduct:
  React.FC<{
    imageSrc: string;
    frame: number;
    fps: number;
    variant: SpatialVariant;
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
          fps *
            3.6,
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

    let effect:
      React.ReactNode =
        null;

    if (
      variant ===
      "echo"
    ) {
      effect = (
        <EchoEffect
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
        />
      );
    }

    if (
      variant ===
      "mobius"
    ) {
      effect = (
        <SurfaceWarp
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
          mode="mobius"
        />
      );
    }

    if (
      variant ===
      "tunnel"
    ) {
      effect = (
        <TunnelEffect
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
        />
      );
    }

    if (
      variant ===
      "blinds"
    ) {
      effect = (
        <PanelEffect
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
          mode="blinds"
        />
      );
    }

    if (
      variant ===
      "layers"
    ) {
      effect = (
        <PanelEffect
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
          mode="layers"
        />
      );
    }

    if (
      variant ===
      "cylinder"
    ) {
      effect = (
        <SurfaceWarp
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
          mode="cylinder"
        />
      );
    }

    if (
      variant ===
      "kaleidoscope"
    ) {
      effect = (
        <KaleidoscopeEffect
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
        />
      );
    }

    if (
      variant ===
      "accordion"
    ) {
      effect = (
        <PanelEffect
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
          mode="accordion"
        />
      );
    }

    if (
      variant ===
      "portal"
    ) {
      effect = (
        <PortalEffect
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
        />
      );
    }

    if (
      variant ===
      "extrusion"
    ) {
      effect = (
        <ExtrusionEffect
          texture={
            texture
          }
          product={
            product
          }
          strength={
            strength
          }
          time={
            seconds
          }
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
    variant: SpatialVariant;
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
            18
          }
          color="#8cbfff"
        />

        <Suspense
          fallback={
            null
          }
        >
          <SpatialProduct
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

export const ProductSpatialTopologyTemplate:
  React.FC<
    ProductSpatialTemplateProps & {
      variant:
        SpatialVariant;
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

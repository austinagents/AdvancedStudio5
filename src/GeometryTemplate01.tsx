import React, {Suspense, useMemo} from "react";
import {ThreeCanvas} from "@remotion/three";
import {useTexture} from "@react-three/drei";
import * as THREE from "three";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type GeometryTemplate01Props = {
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
    image.naturalWidth || image.width;

  const height =
    image.naturalHeight || image.height;

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext("2d", {
      willReadFrequently: true,
    });

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
          (y * width + x) *
            4 +
          3
        ];

      if (alpha > 1) {
        minX =
          Math.min(minX, x);

        maxX =
          Math.max(maxX, x);

        minY =
          Math.min(minY, y);

        maxY =
          Math.max(maxY, y);
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
   * EXACTLY match ProductMesh.tsx.
   */
  const visiblePixelsW =
    maxX - minX + 1;

  const visiblePixelsH =
    maxY - minY + 1;

  const visibleHeight = 5.55;

  const planeHeight =
    visibleHeight *
    (height / visiblePixelsH);

  const planeWidth =
    planeHeight *
    (width / height);

  const centerX =
    (minX + maxX + 1) / 2;

  const centerY =
    (minY + maxY + 1) / 2;

  const offsetX =
    -(
      (centerX / width - 0.5) *
      planeWidth
    );

  const offsetY =
    (
      centerY / height - 0.5
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
      index * 12.9898 +
        salt * 78.233,
    ) * 43758.5453;

  return x - Math.floor(x);
};

const ProductAssembly: React.FC<{
  imageSrc: string;
  frame: number;
  fps: number;
}> = ({
  imageSrc,
  frame,
  fps,
}) => {
  const texture =
    useTexture(imageSrc);

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

  texture.generateMipmaps = true;

  texture.anisotropy = 16;

  texture.needsUpdate = true;

  const image =
    texture.image as HTMLImageElement;

  const product =
    useMemo(
      () =>
        analyzeProduct(image),
      [image],
    );

  /*
   * Dense procedural grid.
   *
   * IMPORTANT:
   * Texture resolution is NOT limited by this grid.
   * At full assembly the original product texture
   * renders continuously across the finished surface.
   */
  const geometry =
    useMemo(() => {
      const segmentsX = 44;
      const segmentsY = 128;

      const g =
        new THREE.PlaneGeometry(
          product.planeWidth,
          product.planeHeight,
          segmentsX,
          segmentsY,
        );

      const position =
        g.attributes
          .position as THREE.BufferAttribute;

      const count =
        position.count;

      const starts =
        new Float32Array(
          count * 3,
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const angle =
          seeded(i, 1) *
          Math.PI *
          2;

        const radius =
          4 +
          seeded(i, 2) *
          7;

        starts[i * 3] =
          Math.cos(angle) *
          radius;

        starts[
          i * 3 + 1
        ] =
          (
            seeded(i, 3) -
            0.5
          ) * 11;

        starts[
          i * 3 + 2
        ] =
          (
            seeded(i, 4) -
            0.5
          ) * 8;
      }

      g.setAttribute(
        "assemblyStart",
        new THREE.BufferAttribute(
          starts,
          3,
        ),
      );

      return g;
    }, [
      product.planeWidth,
      product.planeHeight,
    ]);

  const material =
    useMemo(() => {
      /*
       * IMPORTANT:
       * Use the SAME material pipeline as the accepted
       * ProductMesh so assembly=1 renders identically.
       *
       * We modify only the vertex positions.
       * Three.js keeps ownership of texture sampling,
       * sRGB handling, alpha and final color output.
       */
      const m =
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0,
          depthWrite: true,
          toneMapped: false,
          side: THREE.FrontSide,
        });

      m.onBeforeCompile = (shader) => {
        shader.uniforms.assembly = {
          value: 0,
        };

        shader.uniforms.pointPhase = {
          value: 0,
        };

        shader.vertexShader =
          shader.vertexShader.replace(
            "void main() {",
            `
            attribute vec3 assemblyStart;

            uniform float assembly;
            uniform float pointPhase;

            void main() {
            `,
          );

        shader.vertexShader =
          shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
            vec3 target =
              position;

            float stagger =
              clamp(
                assembly * 1.18 -
                fract(
                  sin(
                    dot(
                      position.xy,
                      vec2(
                        12.9898,
                        78.233
                      )
                    )
                  ) *
                  43758.5453
                ) * 0.18,
                0.0,
                1.0
              );

            float eased =
              stagger *
              stagger *
              (
                3.0 -
                2.0 * stagger
              );

            vec3 dispersed =
              assemblyStart;

            dispersed.z +=
              sin(
                pointPhase +
                position.y * 2.0
              ) * 0.22;

            vec3 transformed =
              mix(
                dispersed,
                target,
                eased
              );
            `,
          );

        m.userData.shader =
          shader;
      };

      m.customProgramCacheKey =
        () =>
          "as5-product-geometry-v1";

      return m;
    }, [texture]);

  const assembly =
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
          fps * 3.2,
        ),
    });

  const compiledShader =
    material.userData.shader as
      | {
          uniforms: {
            assembly: {
              value: number;
            };
            pointPhase: {
              value: number;
            };
          };
        }
      | undefined;

  if (compiledShader) {
    compiledShader.uniforms
      .assembly.value =
        assembly;

    compiledShader.uniforms
      .pointPhase.value =
        frame * 0.045;
  }

  /*
   * Keep the exact existing
   * ProductMesh hero motion.
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
   * Existing product reveal:
   * 1.2 sec -> 2.7 sec
   * scale 0.8 -> 1.0
   */
  const reveal =
    interpolate(
      frame,
      [
        fps * 1.2,
        fps * 2.7,
      ],
      [0, 1],
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
      [0, 1],
      [0.8, 1],
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
        geometry={geometry}
        material={material}
        position={[
          product.offsetX,
          product.offsetY,
          0.012,
        ]}
      />
    </group>
  );
};

const Scene: React.FC<{
  imageSrc?: string;
  frame: number;
  fps: number;
}> = ({
  imageSrc,
  frame,
  fps,
}) => {
  return (
    <>
      <ambientLight
        intensity={1.15}
      />

      <directionalLight
        position={[4, 6, 8]}
        intensity={4}
      />

      <pointLight
        position={[-4, 0, 6]}
        intensity={26}
        color="#8cbfff"
      />

      <pointLight
        position={[4, -3, 4]}
        intensity={16}
        color="#f7d7aa"
      />

      {imageSrc ? (
        <Suspense fallback={null}>
          <ProductAssembly
            imageSrc={imageSrc}
            frame={frame}
            fps={fps}
          />
        </Suspense>
      ) : null}
    </>
  );
};

export const GeometryTemplate01:
  React.FC<
    GeometryTemplate01Props
  > = ({imageSrc}) => {
    const frame =
      useCurrentFrame();

    const {
      fps,
      width,
      height,
    } = useVideoConfig();

    return (
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #182131 0%, #090b10 48%, #030405 100%)",
          overflow: "hidden",
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
            width: "100%",
            height: "100%",
          }}
        >
          <Scene
            imageSrc={imageSrc}
            frame={frame}
            fps={fps}
          />
        </ThreeCanvas>
      </AbsoluteFill>
    );
  };

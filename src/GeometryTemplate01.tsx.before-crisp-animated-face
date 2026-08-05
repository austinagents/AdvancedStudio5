import React, {Suspense, useMemo} from "react";
import {ThreeCanvas} from "@remotion/three";
import * as THREE from "three";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {ProductMesh} from "./advanced-studio5/ProductMesh";

export type GeometryTemplate01Props = {
  imageSrc?: string;
};

const PARTICLE_COUNT = 1800;

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

const ParticleField: React.FC<{
  frame: number;
  fps: number;
}> = ({frame, fps}) => {
  const geometry = useMemo(() => {
    const positions =
      new Float32Array(
        PARTICLE_COUNT * 3,
      );

    const starts =
      new Float32Array(
        PARTICLE_COUNT * 3,
      );

    const targets =
      new Float32Array(
        PARTICLE_COUNT * 3,
      );

    for (
      let i = 0;
      i < PARTICLE_COUNT;
      i++
    ) {
      const i3 = i * 3;

      const angle =
        seeded(i, 1) *
        Math.PI *
        2;

      const radius =
        5 +
        seeded(i, 2) * 7;

      starts[i3] =
        Math.cos(angle) * radius;

      starts[i3 + 1] =
        (seeded(i, 3) - 0.5) *
        10;

      starts[i3 + 2] =
        (seeded(i, 4) - 0.5) *
        7;

      const y =
        (seeded(i, 5) - 0.5) *
        6.5;

      const width =
        2.4 *
        (
          0.78 +
          0.22 *
            Math.cos(
              Math.abs(y) /
                3.25 *
                Math.PI *
                0.7,
            )
        );

      targets[i3] =
        (seeded(i, 6) - 0.5) *
        width *
        2;

      targets[i3 + 1] = y;

      targets[i3 + 2] =
        (seeded(i, 7) - 0.5) *
        1.5;

      positions[i3] =
        starts[i3];

      positions[i3 + 1] =
        starts[i3 + 1];

      positions[i3 + 2] =
        starts[i3 + 2];
    }

    const g =
      new THREE.BufferGeometry();

    g.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    );

    g.userData.starts = starts;
    g.userData.targets = targets;

    return g;
  }, []);

  const assembly = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 70,
      mass: 0.8,
    },
    durationInFrames:
      Math.round(fps * 3.2),
  });

  const pulse =
    Math.sin(frame * 0.045) *
    0.06;

  const position =
    geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;

  const starts =
    geometry.userData
      .starts as Float32Array;

  const targets =
    geometry.userData
      .targets as Float32Array;

  for (
    let i = 0;
    i < PARTICLE_COUNT;
    i++
  ) {
    const i3 = i * 3;

    const stagger =
      Math.max(
        0,
        Math.min(
          1,
          assembly * 1.3 -
            seeded(i, 8) *
              0.32,
        ),
      );

    const eased =
      stagger *
      stagger *
      (3 - 2 * stagger);

    const tx =
      targets[i3] *
      (
        1 +
        pulse *
          seeded(i, 9)
      );

    const ty =
      targets[i3 + 1] *
      (
        1 +
        pulse *
          seeded(i, 10)
      );

    const tz =
      targets[i3 + 2] +
      Math.sin(
        frame * 0.035 +
          i * 0.17,
      ) *
        0.12;

    position.array[i3] =
      THREE.MathUtils.lerp(
        starts[i3],
        tx,
        eased,
      );

    position.array[i3 + 1] =
      THREE.MathUtils.lerp(
        starts[i3 + 1],
        ty,
        eased,
      );

    position.array[i3 + 2] =
      THREE.MathUtils.lerp(
        starts[i3 + 2],
        tz,
        eased,
      );
  }

  position.needsUpdate = true;

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.88}
        color="#d8e9ff"
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
      />
    </points>
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
  const reveal = interpolate(
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

  const scale =
    interpolate(
      reveal,
      [0, 1],
      [0.8, 1],
    );

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

      <ParticleField
        frame={frame}
        fps={fps}
      />

      <group
        scale={[
          scale,
          scale,
          scale,
        ]}
      >
        <Suspense fallback={null}>
          <ProductMesh
            imageSrc={
              imageSrc ?? ""
            }
            frame={frame}
            fps={fps}
          />
        </Suspense>
      </group>
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
            position: [0, 0, 9],
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

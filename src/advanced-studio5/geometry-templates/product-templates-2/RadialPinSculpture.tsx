import React, { useLayoutEffect, useMemo, useRef } from "react";

import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import * as THREE from "three";

import {
  PT2PhysicalFormation,
  buildProductField,
  createExactRGBMaterial,
  setExactProductRGB,
  type PT2Timing,
} from "./PT2PhysicalSystemsSupport";

import { PT2Canvas, type PT2LoadedProduct } from "./ProductTemplates2Runtime";

import { getPT2Timing } from "./ProductTemplates2Core";

type Props = {
  imageSrc: string;
};

const UP = new THREE.Vector3(0, 1, 0);

const Geometry: React.FC<
  PT2LoadedProduct & {
    timing: PT2Timing;
  }
> = ({ image, texture, product, timing }) => {
  const field = useMemo(
    () => buildProductField(image, product, 58),
    [image, product],
  );

  const geometry = useMemo(() => {
    const radius = Math.min(field.cellWidth, field.cellHeight) * 0.14;

    return new THREE.CylinderGeometry(radius, radius * 0.72, 1, 9, 1, false);
  }, [field.cellHeight, field.cellWidth]);

  const material = useMemo(createExactRGBMaterial, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const color = useMemo(() => new THREE.Color(), []);

  const origin = useMemo(() => new THREE.Vector3(), []);

  const target = useMemo(() => new THREE.Vector3(), []);

  const direction = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    const influence = timing.geometryInfluence;

    target.set(
      Math.sin(timing.seconds * 0.62) * product.visibleWidth * 0.42,

      Math.cos(timing.seconds * 0.47) * product.visibleHeight * 0.3,

      2.4 + Math.sin(timing.seconds * 0.81) * 0.62,
    );

    for (let index = 0; index < field.cells.length; index++) {
      const cell = field.cells[index];

      setExactProductRGB(color, cell);

      mesh.setColorAt(index, color);

      origin.set(cell.x, cell.y, 0);

      direction.copy(target).sub(origin);

      const distance = Math.max(0.001, direction.length());

      direction.normalize();

      const height =
        (0.18 +
          cell.edge * 0.68 +
          cell.contrast * 0.48 +
          1.4 / (1 + distance)) *
        (0.86 + 0.14 * Math.sin(timing.seconds * 1.25 + cell.phase)) *
        influence;

      dummy.position.copy(origin).addScaledVector(direction, height / 2);

      dummy.quaternion.setFromUnitVectors(UP, direction);

      dummy.scale.set(influence, Math.max(0.001, height), influence);

      dummy.updateMatrix();

      mesh.setMatrixAt(index, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [
    color,
    direction,
    dummy,
    field.cells,
    origin,
    product.visibleHeight,
    product.visibleWidth,
    target,
    timing.geometryInfluence,
    timing.seconds,
  ]);

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, field.cells.length]}
        frustumCulled={false}
      />

      <PT2PhysicalFormation
        texture={texture}
        image={image}
        product={product}
        timing={timing}
        resolveStyle="radial-pins"
      />
    </>
  );
};

const RadialPinScene: React.FC<Props> = ({ imageSrc }) => {
  const frame = useCurrentFrame();

  const { fps, width, height } = useVideoConfig();

  const timing = getPT2Timing(frame, fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      <OffthreadVideo
        src={staticFile(
          "advanced-studio5/product-templates-2/template-65-background.mp4",
        )}
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <PT2Canvas
        imageSrc={imageSrc}
        width={width}
        height={height}
        transparentBackground
      >
        {(loaded) => <Geometry {...loaded} timing={timing} />}
      </PT2Canvas>
    </AbsoluteFill>
  );
};

export const RadialPinSculpture: React.FC<Props> = (props) => {
  return <RadialPinScene {...props} />;
};

export default RadialPinSculpture;

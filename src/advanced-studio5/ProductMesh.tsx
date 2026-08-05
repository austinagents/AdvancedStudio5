import React, {useMemo} from "react";
import * as THREE from "three";
import {useTexture} from "@react-three/drei";

type ProductMeshProps = {
  imageSrc: string;
  frame: number;
  fps: number;
};

type ProductData = {
  planeWidth: number;
  planeHeight: number;
  offsetX: number;
  offsetY: number;
  visibleWidth: number;
  visibleHeight: number;
};

const analyzeProduct = (
  image: HTMLImageElement,
): ProductData => {
  const width =
    image.naturalWidth || image.width;

  const height =
    image.naturalHeight || image.height;

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx) {
    throw new Error("Unable to read product image.");
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const pixels =
    ctx.getImageData(0, 0, width, height).data;

  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha =
        pixels[(y * width + x) * 4 + 3];

      if (alpha > 1) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error("No product silhouette found.");
  }

  const visiblePixelsW =
    maxX - minX + 1;

  const visiblePixelsH =
    maxY - minY + 1;

  const visibleHeight = 5.55;

  const visibleWidth =
    visibleHeight *
    (visiblePixelsW / visiblePixelsH);

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
    visibleWidth,
    visibleHeight,
  };
};

const LoadedProductMesh:
  React.FC<ProductMeshProps> = ({
    imageSrc,
    frame,
    fps,
  }) => {
    const texture = useTexture(imageSrc);

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

    // Preserve fine label artwork when the product is displayed
    // at an angle or downscaled inside the Remotion preview.
    texture.anisotropy = 16;

    texture.needsUpdate = true;

    const image =
      texture.image as HTMLImageElement;

    const product =
      useMemo(
        () => analyzeProduct(image),
        [image],
      );

    const seconds = frame / fps;

    const rotationY =
      Math.sin(seconds * 0.8) *
      0.012;

    const rotationX = 0;

    const floatY =
      Math.sin(seconds * 1.1) *
      0.06;

    return (
      <group
        position={[0, floatY, 0]}
        rotation={[
          rotationX,
          rotationY,
          0,
        ]}
      >
        {/* EXACT PRODUCT ARTWORK */}
        <mesh
          position={[
            product.offsetX,
            product.offsetY,
            0.012,
          ]}
        >
          <planeGeometry
            args={[
              product.planeWidth,
              product.planeHeight,
            ]}
          />

          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0}
            depthWrite
            toneMapped={false}
            side={THREE.FrontSide}
          />
        </mesh>
      </group>
    );
  };

export const ProductMesh:
  React.FC<ProductMeshProps> = (
    props,
  ) => {
    if (!props.imageSrc) {
      return null;
    }

    return (
      <LoadedProductMesh
        {...props}
      />
    );
  };

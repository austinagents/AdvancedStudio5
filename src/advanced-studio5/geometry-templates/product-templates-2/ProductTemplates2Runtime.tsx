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
} from "remotion";

import {
  analyzeProduct,
  configureProductTexture,
  createProductPanelGeometry,
  type ProductAnalysis,
} from "../ProductGeometryCore";

import {
  createPT2ExactProductMaterial,
} from "./ProductTemplates2Core";

export type PT2LoadedProduct = {
  texture: THREE.Texture;
  image: HTMLImageElement;
  product: ProductAnalysis;
};

export const PT2Product:
  React.FC<{
    imageSrc: string;
    children: (
      loaded: PT2LoadedProduct,
    ) => React.ReactNode;
  }> = ({
    imageSrc,
    children,
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

    return (
      <>
        {children({
          texture,
          image,
          product,
        })}
      </>
    );
  };

export const PT2ExactProduct:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
  }> = ({
    texture,
    product,
  }) => {
    const material =
      useMemo(
        () =>
          createPT2ExactProductMaterial(
            texture,
          ),
        [
          texture,
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

export const PT2TexturedPanel:
  React.FC<{
    texture: THREE.Texture;
    product: ProductAnalysis;
    u0: number;
    u1: number;
    v0: number;
    v1: number;
    position?: [
      number,
      number,
      number,
    ];
    rotation?: [
      number,
      number,
      number,
    ];
    scale?: [
      number,
      number,
      number,
    ];
  }> = ({
    texture,
    product,
    u0,
    u1,
    v0,
    v1,
    position = [
      product.offsetX,
      product.offsetY,
      0,
    ],
    rotation = [
      0,
      0,
      0,
    ],
    scale = [
      1,
      1,
      1,
    ],
  }) => {
    const geometry =
      useMemo(
        () =>
          createProductPanelGeometry(
            product,
            u0,
            u1,
            v0,
            v1,
          ),
        [
          product,
          u0,
          u1,
          v0,
          v1,
        ],
      );

    const material =
      useMemo(
        () =>
          createPT2ExactProductMaterial(
            texture,
          ),
        [
          texture,
        ],
      );

    return (
      <mesh
        geometry={
          geometry
        }
        material={
          material
        }
        position={
          position
        }
        rotation={
          rotation
        }
        scale={
          scale
        }
        frustumCulled={
          false
        }
      />
    );
  };

export const PT2Canvas:
  React.FC<{
    imageSrc?: string;
    children: (
      loaded:
        PT2LoadedProduct,
    ) => React.ReactNode;
    width: number;
    height: number;
  }> = ({
    imageSrc,
    children,
    width,
    height,
  }) => {
    return (
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 44%, #182131 0%, #090b10 48%, #030405 100%)",
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
          {imageSrc ? (
            <Suspense
              fallback={
                null
              }
            >
              <PT2Product
                imageSrc={
                  imageSrc
                }
              >
                {children}
              </PT2Product>
            </Suspense>
          ) : null}
        </ThreeCanvas>
      </AbsoluteFill>
    );
  };

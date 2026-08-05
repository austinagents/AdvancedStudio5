import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {
  getPT2Timing,
} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Core";

import {
  PT2Canvas,
  PT2ExactProduct,
  PT2TexturedPanel,
} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Runtime";

export const GeometryTemplate60:
  React.FC<{imageSrc?: string}> = ({
    imageSrc,
  }) => {
    const frame =
      useCurrentFrame();

    const {
      fps,
      width,
      height,
    } =
      useVideoConfig();

    const timing =
      getPT2Timing(
        frame,
        fps,
      );

    return (
      <PT2Canvas
        imageSrc={imageSrc}
        width={width}
        height={height}
      >
        {({texture, product}) => {
          if (timing.holding) {
            return (
              <PT2ExactProduct
                texture={texture}
                product={product}
              />
            );
          }

          const slices = 18;

          return (
            <>
              {Array.from(
                {length: slices},
                (_, index) => {
                  const v0 =
                    index /
                    slices;

                  const v1 =
                    (index + 1) /
                    slices;

                  const normalized =
                    (index + 0.5) /
                      slices -
                    0.5;

                  const distanceFromCenter =
                    Math.abs(
                      normalized,
                    ) * 2;

                  const contourProfile =
                    1 -
                    Math.pow(
                      distanceFromCenter,
                      1.7,
                    );

                  const side =
                    index % 2 === 0
                      ? 1
                      : -1;

                  const z =
                    contourProfile *
                    3.4 *
                    timing.phase1 *
                    timing.geometryInfluence;

                  const x =
                    side *
                    contourProfile *
                    0.65 *
                    timing.phase2 *
                    timing.geometryInfluence;

                  const rotationY =
                    side *
                    contourProfile *
                    0.28 *
                    timing.phase2 *
                    timing.geometryInfluence;

                  const rotationX =
                    normalized *
                    0.42 *
                    timing.phase3 *
                    timing.geometryInfluence;

                  const scaleX =
                    1 -
                    contourProfile *
                      0.14 *
                      timing.phase1 *
                      timing.geometryInfluence;

                  return (
                    <PT2TexturedPanel
                      key={index}
                      texture={texture}
                      product={product}
                      u0={0}
                      u1={1}
                      v0={v0}
                      v1={v1}
                      position={[
                        product.offsetX +
                          x,
                        product.offsetY,
                        z,
                      ]}
                      rotation={[
                        rotationX,
                        rotationY,
                        0,
                      ]}
                      scale={[
                        scaleX,
                        1,
                        1,
                      ]}
                    />
                  );
                },
              )}
            </>
          );
        }}
      </PT2Canvas>
    );
  };

import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";

import {getPT2Timing} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Core";
import {
  PT2Canvas,
  PT2ExactProduct,
  PT2TexturedPanel,
} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Runtime";

export const GeometryTemplate63: React.FC<{imageSrc?: string}> = ({imageSrc}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const timing = getPT2Timing(frame, fps);

  return (
    <PT2Canvas imageSrc={imageSrc} width={width} height={height}>
      {({texture, product}) => {
        if (timing.holding) {
          return <PT2ExactProduct texture={texture} product={product} />;
        }

        const columns = 6;
        const rows = 9;

        return (
          <>
            {Array.from({length: columns * rows}, (_, index) => {
              const x = index % columns;
              const y = Math.floor(index / columns);

              const seed =
                ((index * 37) % 101) /
                101;

              const angle =
                seed *
                Math.PI *
                2;

              const radius =
                (0.5 + seed * 2.8) *
                timing.phase1 *
                timing.geometryInfluence;

              return (
                <PT2TexturedPanel
                  key={index}
                  texture={texture}
                  product={product}
                  u0={x / columns}
                  u1={(x + 1) / columns}
                  v0={y / rows}
                  v1={(y + 1) / rows}
                  position={[
                    product.offsetX +
                      Math.cos(angle) *
                        radius,
                    product.offsetY +
                      Math.sin(angle) *
                        radius,
                    (seed - 0.5) *
                      6 *
                      timing.phase2 *
                      timing.geometryInfluence,
                  ]}
                  rotation={[
                    (seed - 0.5) *
                      0.7 *
                      timing.phase2 *
                      timing.geometryInfluence,
                    (0.5 - seed) *
                      0.9 *
                      timing.phase2 *
                      timing.geometryInfluence,
                    (seed - 0.5) *
                      0.3 *
                      timing.phase3 *
                      timing.geometryInfluence,
                  ]}
                />
              );
            })}
          </>
        );
      }}
    </PT2Canvas>
  );
};

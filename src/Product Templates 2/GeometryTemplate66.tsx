import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";

import {getPT2Timing} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Core";
import {
  PT2Canvas,
  PT2ExactProduct,
  PT2TexturedPanel,
} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Runtime";

export const GeometryTemplate66: React.FC<{imageSrc?: string}> = ({imageSrc}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const timing = getPT2Timing(frame, fps);

  return (
    <PT2Canvas imageSrc={imageSrc} width={width} height={height}>
      {({texture, product}) => {
        if (timing.holding) {
          return <PT2ExactProduct texture={texture} product={product} />;
        }

        const columns = 3;
        const rows = 4;

        return (
          <>
            {Array.from({length: columns * rows}, (_, index) => {
              const x = index % columns;
              const y = Math.floor(index / columns);

              const cx =
                x - 1;

              const cy =
                y - 1.5;

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
                      cx *
                        2.3 *
                        timing.phase1 *
                        timing.geometryInfluence,
                    product.offsetY +
                      cy *
                        1.7 *
                        timing.phase1 *
                        timing.geometryInfluence,
                    (
                      Math.abs(cx) +
                      Math.abs(cy)
                    ) *
                      0.8 *
                      timing.phase2 *
                      timing.geometryInfluence,
                  ]}
                  rotation={[
                    cy *
                      -0.22 *
                      timing.phase3 *
                      timing.geometryInfluence,
                    cx *
                      0.5 *
                      timing.phase2 *
                      timing.geometryInfluence,
                    0,
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

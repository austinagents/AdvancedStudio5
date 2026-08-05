import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";

import {getPT2Timing} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Core";
import {
  PT2Canvas,
  PT2ExactProduct,
  PT2TexturedPanel,
} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Runtime";

export const GeometryTemplate61: React.FC<{imageSrc?: string}> = ({imageSrc}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const timing = getPT2Timing(frame, fps);

  return (
    <PT2Canvas imageSrc={imageSrc} width={width} height={height}>
      {({texture, product}) => {
        if (timing.holding) {
          return <PT2ExactProduct texture={texture} product={product} />;
        }

        const columns = 4;
        const rows = 6;

        return (
          <>
            {Array.from({length: columns * rows}, (_, index) => {
              const x = index % columns;
              const y = Math.floor(index / columns);
              const side = (x + y) % 2 === 0 ? 1 : -1;

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
                    product.offsetX,
                    product.offsetY,
                    side *
                      0.7 *
                      timing.phase2 *
                      timing.geometryInfluence,
                  ]}
                  rotation={[
                    y % 2 === 0
                      ? side *
                        0.7 *
                        timing.phase1 *
                        timing.geometryInfluence
                      : 0,
                    y % 2 !== 0
                      ? side *
                        0.8 *
                        timing.phase1 *
                        timing.geometryInfluence
                      : 0,
                    side *
                      0.05 *
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

import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";

import {getPT2Timing} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Core";
import {
  PT2Canvas,
  PT2ExactProduct,
  PT2TexturedPanel,
} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Runtime";

export const GeometryTemplate57: React.FC<{imageSrc?: string}> = ({imageSrc}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const timing = getPT2Timing(frame, fps);

  return (
    <PT2Canvas imageSrc={imageSrc} width={width} height={height}>
      {({texture, product}) => {
        if (timing.holding) {
          return <PT2ExactProduct texture={texture} product={product} />;
        }

        const strips = 16;

        return (
          <>
            {Array.from({length: strips}, (_, index) => {
              const u0 = index / strips;
              const u1 = (index + 1) / strips;
              const normalized = (index + 0.5) / strips - 0.5;
              const side = index % 2 === 0 ? -1 : 1;

              return (
                <PT2TexturedPanel
                  key={index}
                  texture={texture}
                  product={product}
                  u0={u0}
                  u1={u1}
                  v0={0}
                  v1={1}
                  position={[
                    product.offsetX +
                      normalized *
                        0.7 *
                        timing.phase2 *
                        timing.geometryInfluence,
                    product.offsetY +
                      Math.sin(index * 0.7 + timing.seconds * 1.4) *
                        0.16 *
                        timing.phase3 *
                        timing.geometryInfluence,
                    (Math.abs(normalized) * 4.4 + side * 0.3) *
                      timing.phase1 *
                      timing.geometryInfluence,
                  ]}
                  rotation={[
                    0,
                    side *
                      (0.95 * timing.phase1 + 0.22 * timing.phase2) *
                      timing.geometryInfluence,
                    side *
                      0.04 *
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

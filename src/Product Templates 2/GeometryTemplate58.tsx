import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";

import {getPT2Timing} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Core";
import {
  PT2Canvas,
  PT2ExactProduct,
  PT2TexturedPanel,
} from "../advanced-studio5/geometry-templates/product-templates-2/ProductTemplates2Runtime";

export const GeometryTemplate58: React.FC<{imageSrc?: string}> = ({imageSrc}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const timing = getPT2Timing(frame, fps);

  return (
    <PT2Canvas imageSrc={imageSrc} width={width} height={height}>
      {({texture, product}) => {
        if (timing.holding) {
          return <PT2ExactProduct texture={texture} product={product} />;
        }

        const sections = 14;

        return (
          <>
            {Array.from({length: sections}, (_, index) => {
              const v0 = index / sections;
              const v1 = (index + 1) / sections;
              const normalized = (index + 0.5) / sections - 0.5;
              const permutation = (index * 5) % sections;

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
                      normalized *
                        1.2 *
                        timing.phase2 *
                        timing.geometryInfluence,
                    product.offsetY,
                    (permutation / sections - 0.5) *
                      6 *
                      timing.phase1 *
                      timing.geometryInfluence,
                  ]}
                  rotation={[
                    normalized *
                      0.7 *
                      timing.phase3 *
                      timing.geometryInfluence,
                    0,
                    normalized *
                      0.08 *
                      timing.phase2 *
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

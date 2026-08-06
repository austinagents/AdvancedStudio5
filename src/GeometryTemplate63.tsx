import React from "react";

import {
  VoronoiDepthCrystal,
} from "./advanced-studio5/geometry-templates/product-templates-2/VoronoiDepthCrystal";

export type GeometryTemplate63Props = {
  imageSrc: string;
};

export const GeometryTemplate63:
  React.FC<
    GeometryTemplate63Props
  > = (
    props,
  ) => {
    return (
      <VoronoiDepthCrystal
        {...props}
      />
    );
  };

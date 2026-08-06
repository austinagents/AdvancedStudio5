import React from "react";

import {
  PolyhedralGranularBody,
} from "./advanced-studio5/geometry-templates/product-templates-2/PolyhedralGranularBody";

export type GeometryTemplate77Props = {
  imageSrc: string;
};

export const GeometryTemplate77:
  React.FC<
    GeometryTemplate77Props
  > = (
    props,
  ) => {
    return (
      <PolyhedralGranularBody
        {...props}
      />
    );
  };

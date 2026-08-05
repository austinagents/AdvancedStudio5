import React from "react";

import {
  ProductSurfaceDeformationTemplate,
  type ProductSurfaceTemplateProps,
} from "./advanced-studio5/geometry-templates/ProductSurfaceDeformationEngine";

export const GeometryTemplate15:
  React.FC<
    ProductSurfaceTemplateProps
  > = (
    props,
  ) => {
    return (
      <ProductSurfaceDeformationTemplate
        {...props}
        variant="pinch"
      />
    );
  };

import React from "react";

import {
  ProductSpatialTopologyTemplate,
  type ProductSpatialTemplateProps,
} from "./advanced-studio5/geometry-templates/ProductSpatialTopologyEngine";

export const GeometryTemplate26:
  React.FC<
    ProductSpatialTemplateProps
  > = (
    props,
  ) => {
    return (
      <ProductSpatialTopologyTemplate
        {...props}
        variant="layers"
      />
    );
  };

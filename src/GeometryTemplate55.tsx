import React from "react";

import {
  ProductProceduralSystemTemplate,
  type ProductProceduralTemplateProps,
} from "./advanced-studio5/geometry-templates/ProductProceduralSystemsEngine";

export const GeometryTemplate55:
  React.FC<
    ProductProceduralTemplateProps
  > = (
    props,
  ) => {
    return (
      <ProductProceduralSystemTemplate
        {...props}
        variant="topology-crumple"
      />
    );
  };

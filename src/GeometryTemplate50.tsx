import React from "react";

import {
  ProductProceduralSystemTemplate,
  type ProductProceduralTemplateProps,
} from "./advanced-studio5/geometry-templates/ProductProceduralSystemsEngine";

export const GeometryTemplate50:
  React.FC<
    ProductProceduralTemplateProps
  > = (
    props,
  ) => {
    return (
      <ProductProceduralSystemTemplate
        {...props}
        variant="medial-skeleton"
      />
    );
  };

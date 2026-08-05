import React from "react";

import {
  ProductProceduralSystemTemplate,
  type ProductProceduralTemplateProps,
} from "./advanced-studio5/geometry-templates/ProductProceduralSystemsEngine";

export const GeometryTemplate51:
  React.FC<
    ProductProceduralTemplateProps
  > = (
    props,
  ) => {
    return (
      <ProductProceduralSystemTemplate
        {...props}
        variant="surface-compression"
      />
    );
  };

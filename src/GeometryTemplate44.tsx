import React from "react";

import {
  ProductFieldTopologyTemplate,
  type ProductFieldTemplateProps,
} from "./advanced-studio5/geometry-templates/ProductFieldTopologyEngine";

export const GeometryTemplate44:
  React.FC<
    ProductFieldTemplateProps
  > = (
    props,
  ) => {
    return (
      <ProductFieldTopologyTemplate
        {...props}
        variant="medial-ridge"
      />
    );
  };

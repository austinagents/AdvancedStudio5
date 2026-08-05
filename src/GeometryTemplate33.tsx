import React from "react";

import {
  ProductDerivedTopologyTemplate,
  type ProductDerivedTopologyProps,
} from "./advanced-studio5/geometry-templates/ProductDerivedTopologyEngine";

export const GeometryTemplate33:
  React.FC<
    ProductDerivedTopologyProps
  > = (
    props,
  ) => {
    return (
      <ProductDerivedTopologyTemplate
        {...props}
        variant="edge-growth"
      />
    );
  };

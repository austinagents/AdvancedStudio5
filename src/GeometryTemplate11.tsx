import React from "react";

import {
  ProductGeometryTemplate,
  type ProductGeometryTemplateProps,
} from "./advanced-studio5/geometry-templates/ProductGeometryEngine";

export const GeometryTemplate11:
  React.FC<
    ProductGeometryTemplateProps
  > = (props) => {
    return (
      <ProductGeometryTemplate
        {...props}
        variant="tunnel"
      />
    );
  };

import React from "react";

import {
  ContourRibArchitecture,
} from "./advanced-studio5/geometry-templates/product-templates-2/ContourRibArchitecture";

export type GeometryTemplate64Props = {
  imageSrc: string;
};

export const GeometryTemplate64:
  React.FC<
    GeometryTemplate64Props
  > = (
    props,
  ) => {
    return (
      <ContourRibArchitecture
        {...props}
      />
    );
  };

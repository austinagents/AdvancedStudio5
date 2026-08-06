import React from "react";

import {
  DualMeshCells,
} from "./advanced-studio5/geometry-templates/product-templates-2/DualMeshCells";

export type GeometryTemplate60Props = {
  imageSrc: string;
};

export const GeometryTemplate60:
  React.FC<
    GeometryTemplate60Props
  > = (
    props,
  ) => {
    return (
      <DualMeshCells
        {...props}
      />
    );
  };

import React from "react";

import {
  HelicalStrandVolume,
} from "./advanced-studio5/geometry-templates/product-templates-2/HelicalStrandVolume";

export type GeometryTemplate68Props = {
  imageSrc: string;
};

export const GeometryTemplate68:
  React.FC<
    GeometryTemplate68Props
  > = (
    props,
  ) => {
    return (
      <HelicalStrandVolume
        {...props}
      />
    );
  };

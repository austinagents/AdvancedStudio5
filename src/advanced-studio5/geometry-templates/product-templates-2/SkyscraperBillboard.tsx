import React from "react";

import {
  AbsoluteFill,
  staticFile,
} from "remotion";

export const SkyscraperBillboard:
  React.FC = () => {
    return (
      <AbsoluteFill
        style={{
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <img
          src={staticFile(
            "advanced-studio5/product-templates-2/template-58-skyscraper-billboard.png",
          )}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            display: "block",
          }}
        />
      </AbsoluteFill>
    );
  };

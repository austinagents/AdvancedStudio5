import React from "react";

import {
  Composition,
  staticFile,
} from "remotion";

import {
  GeometryTemplate57,
} from "../GeometryTemplate57";






















import {
  PT2BackgroundProvider,
} from "./geometry-templates/product-templates-2/ProductTemplates2Runtime";

const FPS = 30;
const DURATION = 12 * FPS;

export type ProductTemplates2RenderProps = {
  templateNumber: string;
  imageSrc: string;
  useBackgroundVideo?: boolean;
};

type GeometryComponent =
  React.ComponentType<{
    imageSrc: string;
  }>;

const templateComponents:
Record<string, GeometryComponent> = {
  "57": GeometryTemplate57,
};

const ProductTemplates2Render:
React.FC<ProductTemplates2RenderProps> = ({
  templateNumber,
  imageSrc,
  useBackgroundVideo = false,
}) => {
  const Template =
    templateComponents[
      templateNumber
    ];

  if (!Template) {
    throw new Error(
      `Unknown Product Templates 2 template: ${templateNumber}`,
    );
  }

  return (
    <PT2BackgroundProvider
      backgroundVideoSrc={
        useBackgroundVideo
          ? staticFile(
              "advanced-studio5/uploads/background-video.mp4",
            )
          : undefined
      }
    >
      <Template
        imageSrc={
          imageSrc
        }
      />
    </PT2BackgroundProvider>
  );
};

const defaultProps:
ProductTemplates2RenderProps = {
  templateNumber: "57",
  imageSrc: "",
  useBackgroundVideo:
    false,
};

export const ProductTemplates2RenderRoot:
React.FC = () => {
  return (
    <>
      <Composition
        id="AdvancedStudio5ProductTemplates2Portrait"
        component={
          ProductTemplates2Render
        }
        durationInFrames={
          DURATION
        }
        fps={
          FPS
        }
        width={
          1080
        }
        height={
          1350
        }
        defaultProps={
          defaultProps
        }
      />

      <Composition
        id="AdvancedStudio5ProductTemplates2Square"
        component={
          ProductTemplates2Render
        }
        durationInFrames={
          DURATION
        }
        fps={
          FPS
        }
        width={
          1080
        }
        height={
          1080
        }
        defaultProps={
          defaultProps
        }
      />

      <Composition
        id="AdvancedStudio5ProductTemplates2Vertical"
        component={
          ProductTemplates2Render
        }
        durationInFrames={
          DURATION
        }
        fps={
          FPS
        }
        width={
          1080
        }
        height={
          1920
        }
        defaultProps={
          defaultProps
        }
      />
    </>
  );
};

import React from "react";

import {
  Composition,
  staticFile,
} from "remotion";

import {
  GeometryTemplate57,
} from "../GeometryTemplate57";

import {
  GeometryTemplate58,
} from "../GeometryTemplate58";

import {
  GeometryTemplate59,
} from "../GeometryTemplate59";

import {
  GeometryTemplate60,
} from "../GeometryTemplate60";

import {
  GeometryTemplate61,
} from "../GeometryTemplate61";

import {
  GeometryTemplate62,
} from "../GeometryTemplate62";

import {
  GeometryTemplate63,
} from "../GeometryTemplate63";

import {
  GeometryTemplate64,
} from "../GeometryTemplate64";

import {
  GeometryTemplate65,
} from "../GeometryTemplate65";

import {
  GeometryTemplate66,
} from "../GeometryTemplate66";

import {
  GeometryTemplate67,
} from "../GeometryTemplate67";

import {
  GeometryTemplate68,
} from "../GeometryTemplate68";

import {
  GeometryTemplate69,
} from "../GeometryTemplate69";

import {
  GeometryTemplate70,
} from "../GeometryTemplate70";

import {
  GeometryTemplate71,
} from "../GeometryTemplate71";

import {
  GeometryTemplate72,
} from "../GeometryTemplate72";

import {
  GeometryTemplate73,
} from "../GeometryTemplate73";

import {
  GeometryTemplate74,
} from "../GeometryTemplate74";

import {
  GeometryTemplate75,
} from "../GeometryTemplate75";

import {
  GeometryTemplate76,
} from "../GeometryTemplate76";

import {
  GeometryTemplate77,
} from "../GeometryTemplate77";

import {
  GeometryTemplate78,
} from "../GeometryTemplate78";

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
  "58": GeometryTemplate58,
  "59": GeometryTemplate59,
  "60": GeometryTemplate60,
  "61": GeometryTemplate61,
  "62": GeometryTemplate62,
  "63": GeometryTemplate63,
  "64": GeometryTemplate64,
  "65": GeometryTemplate65,
  "66": GeometryTemplate66,
  "67": GeometryTemplate67,
  "68": GeometryTemplate68,
  "69": GeometryTemplate69,
  "70": GeometryTemplate70,
  "71": GeometryTemplate71,
  "72": GeometryTemplate72,
  "73": GeometryTemplate73,
  "74": GeometryTemplate74,
  "75": GeometryTemplate75,
  "76": GeometryTemplate76,
  "77": GeometryTemplate77,
  "78": GeometryTemplate78,
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

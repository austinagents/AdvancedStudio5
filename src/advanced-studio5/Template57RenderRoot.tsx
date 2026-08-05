import React from "react";

import {
  Composition,
} from "remotion";

import {
  GeometryTemplate57,
  type GeometryTemplate57Props,
} from "../GeometryTemplate57";

const FPS = 30;
const DURATION = 12 * FPS;

export const Template57RenderRoot:
  React.FC = () => {
    return (
      <>
        <Composition
          id="AdvancedStudio5Template57Portrait"
          component={
            GeometryTemplate57
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
          defaultProps={{
            imageSrc: "",
          } satisfies GeometryTemplate57Props}
        />

        <Composition
          id="AdvancedStudio5Template57Square"
          component={
            GeometryTemplate57
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
          defaultProps={{
            imageSrc: "",
          } satisfies GeometryTemplate57Props}
        />

        <Composition
          id="AdvancedStudio5Template57Vertical"
          component={
            GeometryTemplate57
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
          defaultProps={{
            imageSrc: "",
          } satisfies GeometryTemplate57Props}
        />
      </>
    );
  };

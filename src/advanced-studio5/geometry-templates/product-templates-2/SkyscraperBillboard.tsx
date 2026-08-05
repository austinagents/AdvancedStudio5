import React from "react";

import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SkyscraperBillboard:
  React.FC = () => {
    const frame =
      useCurrentFrame();

    const {
      fps,
    } =
      useVideoConfig();

    const seconds =
      frame /
      fps;

    /*
     * ENVIRONMENT MOTION ONLY
     *
     * Reference behavior:
     * the environment has subtle camera life,
     * while the billboard itself does not pre-light,
     * pulse, glow, or animate before the subject appears.
     */

    const progress =
      interpolate(
        seconds,
        [
          0,
          12,
        ],
        [
          0,
          1,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        },
      );

    /*
     * Slow cinematic push.
     *
     * Enough movement to make the plate feel alive,
     * but small enough to preserve the straight-on
     * building composition.
     */
    const scale =
      interpolate(
        progress,
        [
          0,
          1,
        ],
        [
          1.025,
          1.085,
        ],
      );

    /*
     * Very small camera drift.
     *
     * This mimics the subtle movement visible in the
     * reference environment without inventing parallax
     * or independently moving the building.
     */
    const x =
      interpolate(
        progress,
        [
          0,
          1,
        ],
        [
          0.35,
          -0.65,
        ],
      );

    const y =
      interpolate(
        progress,
        [
          0,
          1,
        ],
        [
          0.55,
          -1.15,
        ],
      );

    return (
      <AbsoluteFill
        style={{
          backgroundColor:
            "#000",
          overflow:
            "hidden",
        }}
      >
        <img
          src={staticFile(
            "advanced-studio5/product-templates-2/template-58-skyscraper-billboard.png",
          )}
          alt=""
          draggable={
            false
          }
          style={{
            position:
              "absolute",

            left:
              "50%",
            top:
              "50%",

            width:
              "100%",
            height:
              "100%",

            display:
              "block",

            objectFit:
              "cover",

            objectPosition:
              "50% 50%",

            transform:
              `
                translate(
                  calc(-50% + ${x}%),
                  calc(-50% + ${y}%)
                )
                scale(${scale})
              `,

            transformOrigin:
              "50% 50%",

            /*
             * Deliberately unchanged.
             * No animated exposure or light treatment.
             */
            filter:
              "none",
          }}
        />
      </AbsoluteFill>
    );
  };

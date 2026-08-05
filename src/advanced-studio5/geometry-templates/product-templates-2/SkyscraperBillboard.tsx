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

    const progress =
      interpolate(
        seconds,
        [0, 18],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      );

    const scale =
      interpolate(
        progress,
        [0, 1],
        [1.025, 1.085],
      );

    const x =
      interpolate(
        progress,
        [0, 1],
        [0.35, -0.65],
      );

    const y =
      interpolate(
        progress,
        [0, 1],
        [0.55, -1.15],
      );

    /*
     * Actual liquid motion.
     *
     * Slow-changing turbulence coordinates create
     * continuous viscous movement instead of a glow pulse.
     */
    const turbulenceX =
      0.008 +
      Math.sin(
        seconds * 0.42,
      ) *
        0.0022;

    const turbulenceY =
      0.021 +
      Math.sin(
        seconds * 0.31 + 1.4,
      ) *
        0.004;

    const displacement =
      28 +
      Math.sin(
        seconds * 0.55,
      ) *
        7;

    const flowOffset =
      (seconds * 32) % 240;

    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          overflow: "hidden",
        }}
      >
        <AbsoluteFill
          style={{
            transform: `
              translate(
                ${x}%,
                ${y}%
              )
              scale(${scale})
            `,
            transformOrigin: "50% 50%",
          }}
        >
          <img
            src={staticFile(
              "advanced-studio5/product-templates-2/template-58-skyscraper-billboard.png",
            )}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              objectPosition: "50% 50%",
            }}
          />

          {/*
           * LIQUID-GOLD SCREEN
           *
           * IMPORTANT:
           * - zero blur outside this element
           * - zero box shadow
           * - zero environmental glow
           * - overflow hidden
           *
           * Every animated pixel is clipped here.
           */}
          <div
            style={{
              position: "absolute",

              /*
               * Deliberately inset from the billboard's
               * black physical frame.
               *
               * We are animating ONLY the gold display face.
               */
              left: "36.6631%",
              top: "26.9139%",
              width: "26.5675%",
              height: "38.4569%",

              overflow: "hidden",
              clipPath: "inset(0)",
              contain: "paint",

              pointerEvents: "none",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 600 1000"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
              }}
            >
              <defs>
                <filter
                  id="template58-liquid-gold"
                  x="0%"
                  y="0%"
                  width="100%"
                  height="100%"
                  colorInterpolationFilters="sRGB"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency={`${turbulenceX} ${turbulenceY}`}
                    numOctaves="3"
                    seed="58"
                    stitchTiles="stitch"
                    result="waterNoise"
                  />

                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="waterNoise"
                    scale={displacement}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="warpedGold"
                  />

                  <feGaussianBlur
                    in="warpedGold"
                    stdDeviation="2.3"
                    result="softGold"
                  />

                  <feSpecularLighting
                    in="waterNoise"
                    surfaceScale="7"
                    specularConstant="0.65"
                    specularExponent="22"
                    lightingColor="#fff1b8"
                    result="specular"
                  >
                    <feDistantLight
                      azimuth="225"
                      elevation="48"
                    />
                  </feSpecularLighting>

                  <feComposite
                    in="specular"
                    in2="SourceGraphic"
                    operator="in"
                    result="clippedSpecular"
                  />

                  <feBlend
                    in="softGold"
                    in2="clippedSpecular"
                    mode="screen"
                  />
                </filter>

                <linearGradient
                  id="template58-gold-base"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#ffd15b"
                  />

                  <stop
                    offset="24%"
                    stopColor="#f4aa20"
                  />

                  <stop
                    offset="48%"
                    stopColor="#ffd866"
                  />

                  <stop
                    offset="69%"
                    stopColor="#d98a10"
                  />

                  <stop
                    offset="100%"
                    stopColor="#ffc846"
                  />
                </linearGradient>

                <linearGradient
                  id="template58-flow-band"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgba(255,255,255,0)"
                  />

                  <stop
                    offset="42%"
                    stopColor="rgba(255,246,199,0.12)"
                  />

                  <stop
                    offset="50%"
                    stopColor="rgba(255,255,230,0.44)"
                  />

                  <stop
                    offset="58%"
                    stopColor="rgba(255,230,155,0.10)"
                  />

                  <stop
                    offset="100%"
                    stopColor="rgba(255,255,255,0)"
                  />
                </linearGradient>
              </defs>

              <g
                filter="url(#template58-liquid-gold)"
              >
                <rect
                  x="0"
                  y="0"
                  width="600"
                  height="1000"
                  fill="url(#template58-gold-base)"
                />

                <rect
                  x="-100"
                  y={-500 + flowOffset}
                  width="800"
                  height="520"
                  fill="url(#template58-flow-band)"
                />

                <rect
                  x="-100"
                  y={-20 + flowOffset}
                  width="800"
                  height="520"
                  fill="url(#template58-flow-band)"
                  opacity="0.72"
                />

                <rect
                  x="-100"
                  y={460 + flowOffset}
                  width="800"
                  height="520"
                  fill="url(#template58-flow-band)"
                  opacity="0.48"
                />
              </g>
            </svg>

            {/*
             * Preserve the original warm gold identity.
             *
             * This is contained entirely inside the screen
             * and does not create light outside it.
             */}
            <AbsoluteFill
              style={{
                background:
                  "rgba(247, 169, 28, 0.10)",
                pointerEvents: "none",
              }}
            />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  };

import * as THREE from "three";

import {
  interpolate,
} from "remotion";

import {
  analyzeProduct,
  configureProductTexture,
  createExactProductMaterial,
  type ProductAnalysis,
} from "../ProductGeometryCore";

/*
 * PRODUCT TEMPLATES 2
 *
 * Shared infrastructure ONLY.
 *
 * This file must NOT become another shared effect engine.
 *
 * Every template 57–66 owns its actual geometry architecture.
 */

export {
  analyzeProduct,
  configureProductTexture,
  createExactProductMaterial,
};

export type {
  ProductAnalysis,
};

export const PT2_TOTAL_SECONDS =
  8;

export const PT2_GEOMETRY_SECONDS =
  6;

export const PT2_HOLD_SECONDS =
  2;

const clamp01 = (
  value: number,
) =>
  THREE.MathUtils.clamp(
    value,
    0,
    1,
  );

export const smooth01 = (
  value: number,
) => {
  const t =
    clamp01(
      value,
    );

  return (
    t *
    t *
    (
      3 -
      2 * t
    )
  );
};

/*
 * Three-stage timing.
 *
 * Templates may interpret these stages differently,
 * but geometry MUST be completely resolved by 6.0s.
 */
export const getPT2Timing = (
  frame: number,
  fps: number,
) => {
  const seconds =
    frame /
    fps;

  if (
    seconds >=
    PT2_GEOMETRY_SECONDS
  ) {
    return {
      seconds,
      phase1: 0,
      phase2: 0,
      phase3: 0,
      resolve: 1,
      geometryInfluence: 0,
      holding: true,
    };
  }

  const phase1 =
    smooth01(
      interpolate(
        seconds,
        [
          0,
          0.65,
          2.7,
          3.6,
        ],
        [
          0.4,
          1,
          1,
          0,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        },
      ),
    );

  const phase2 =
    smooth01(
      interpolate(
        seconds,
        [
          1.3,
          2.4,
          4.2,
          5.25,
        ],
        [
          0,
          1,
          1,
          0,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        },
      ),
    );

  const phase3 =
    smooth01(
      interpolate(
        seconds,
        [
          3.2,
          4.15,
          5.2,
          6,
        ],
        [
          0,
          1,
          1,
          0,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        },
      ),
    );

  const resolve =
    smooth01(
      interpolate(
        seconds,
        [
          4.8,
          6,
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
      ),
    );

  return {
    seconds,
    phase1,
    phase2,
    phase3,
    resolve,
    geometryInfluence:
      1 -
      resolve,
    holding: false,
  };
};

/*
 * Mandatory final product material.
 *
 * Any template may create arbitrary geometry during
 * 0–6 seconds, but the final resolved product must
 * use this proven material path.
 */
export const createPT2ExactProductMaterial = (
  texture: THREE.Texture,
) =>
  createExactProductMaterial(
    texture,
  );

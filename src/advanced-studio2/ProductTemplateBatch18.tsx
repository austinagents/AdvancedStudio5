import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {getProductTemplate} from "./product-templates";
import type {ProductVideoProps} from "./ProductVideo";
import {ProductTemplateBatch18Blender} from "./ProductTemplateBatch18Blender";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const range = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, clamp);

const Product: React.FC<{
  src: string;
  style?: React.CSSProperties;
}> = ({src, style}) =>
  src ? (
    <Img
      src={src}
      style={{width: "100%", height: "100%", objectFit: "contain", ...style}}
    />
  ) : (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        color: "#F4F0E8",
        fontSize: 18,
        fontWeight: 850,
        letterSpacing: 3,
      }}
    >
      UPLOAD PRODUCT
    </div>
  );

const Material: React.FC<{
  src: string | null;
  style?: React.CSSProperties;
}> = ({src, style}) =>
  src ? (
    <Img
      src={src}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }}
    />
  ) : null;

const Faultline: React.FC<ProductVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const template = getProductTemplate(props.templateId);
  const materialSrc = props.polyHavenTexture?.localSrc
    ? staticFile(props.polyHavenTexture.localSrc.replace(/^\/+/, ""))
    : null;
  const vertical = height / width > 1.55;
  const compact = height / width < 1.15;

  const split = range(frame, [12, 42], [0, 1]);
  const shotOneOut = range(frame, [66, 78], [1, 0]);
  const shotTwoIn = range(frame, [68, 80], [0, 1]);
  const shotTwoOut = range(frame, [176, 190], [1, 0]);
  const heroIn = range(frame, [180, 198], [0, 1]);
  const closingLight = range(frame, [282, 299], [0, 1]);

  const openingProductScale = range(frame, [18, 48, 70], [0.76, 1, 1.06]);
  const openingProductY = range(frame, [18, 48, 70], [8, 0, -2]);
  const studyProductX = range(frame, [72, 116, 176], [17, -12, 7]);
  const studyProductScale = range(frame, [72, 116, 176], [1.06, 1.38, 1.1]);
  const studyRotation = range(frame, [72, 116, 176], [-3, 2.5, -1]);
  const heroScale = range(frame, [188, 230, 299], [0.88, 1, 1.025]);
  const lightSweep = range(frame, [82, 154], [-35, 135]);

  const openingWidth = vertical ? 78 : compact ? 56 : 64;
  const openingHeight = vertical ? 62 : compact ? 70 : 66;
  const studyWidth = vertical ? 76 : compact ? 58 : 66;
  const studyHeight = vertical ? 64 : compact ? 74 : 68;
  const heroWidth = vertical ? 70 : compact ? 54 : 61;
  const heroHeight = vertical ? 61 : compact ? 70 : 65;

  return (
    <AbsoluteFill
      style={{
        background: "#050505",
        color: template.foreground,
        overflow: "hidden",
      }}
    >
      {/* Shot 1: a mineral macro opens immediately around the product. */}
      <AbsoluteFill style={{opacity: shotOneOut}}>
        <Material
          src={materialSrc}
          style={{
            filter: "brightness(.34) contrast(1.48) saturate(.68)",
            transform: `scale(${range(frame, [0, 76], [1.3, 1.08])}) translateY(${range(frame, [0, 76], [-3, 2])}%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 48%, rgba(214,170,91,.22), transparent 24%), linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.66))",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: `${50 - split * 32}%`,
            overflow: "hidden",
            boxShadow: split > 0.02 ? "18px 0 50px rgba(0,0,0,.72)" : "none",
          }}
        >
          <Material
            src={materialSrc}
            style={{
              width,
              maxWidth: "none",
              filter: "brightness(.23) contrast(1.58) saturate(.62)",
              transform: `scale(1.3) translateY(-2%)`,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: `${50 - split * 32}%`,
            overflow: "hidden",
            boxShadow: split > 0.02 ? "-18px 0 50px rgba(0,0,0,.72)" : "none",
          }}
        >
          <Material
            src={materialSrc}
            style={{
              right: 0,
              left: "auto",
              width,
              maxWidth: "none",
              filter: "brightness(.23) contrast(1.58) saturate(.62)",
              transform: `scale(1.3) translateY(-2%)`,
              transformOrigin: "right center",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "49%",
            width: `${openingWidth}%`,
            height: `${openingHeight}%`,
            transform: `translate(-50%, -50%) translateY(${openingProductY}%) scale(${openingProductScale})`,
            opacity: range(frame, [10, 24], [0, 1]),
            filter:
              "drop-shadow(0 34px 48px rgba(0,0,0,.78)) drop-shadow(0 0 28px rgba(214,170,91,.16))",
          }}
        >
          <Product src={props.imageSrc} />
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: vertical ? 5 : 4,
            background:
              "linear-gradient(180deg, transparent 4%, #FFF1C7 32%, #D6AA5B 68%, transparent 96%)",
            transform: `translateX(-50%) scaleY(${split})`,
            transformOrigin: "center",
            opacity: range(frame, [8, 18, 50, 66], [0, 1, 1, 0]),
            boxShadow: "0 0 34px rgba(214,170,91,.75)",
          }}
        />
      </AbsoluteFill>

      {/* Shot 2: the product drives a single continuous material study. */}
      <AbsoluteFill style={{opacity: shotTwoIn * shotTwoOut}}>
        <Material
          src={materialSrc}
          style={{
            filter: "brightness(.19) contrast(1.55) saturate(.58)",
            transform: `scale(${range(frame, [72, 188], [1.12, 1.24])}) translateX(${range(frame, [72, 188], [-3, 4])}%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(115deg, rgba(0,0,0,.84) 0%, rgba(0,0,0,.22) 48%, rgba(0,0,0,.76) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: `${lightSweep}%`,
            top: "-20%",
            width: vertical ? "18%" : "13%",
            height: "140%",
            transform: "rotate(13deg)",
            background:
              "linear-gradient(90deg, transparent, rgba(255,241,199,.19), rgba(214,170,91,.42), transparent)",
            filter: "blur(14px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: `${50 + studyProductX}%`,
            top: "50%",
            width: `${studyWidth}%`,
            height: `${studyHeight}%`,
            transform: `translate(-50%, -50%) rotate(${studyRotation}deg) scale(${studyProductScale})`,
            filter:
              "drop-shadow(0 42px 58px rgba(0,0,0,.82)) drop-shadow(0 0 38px rgba(214,170,91,.13))",
          }}
        >
          <Product src={props.imageSrc} />
        </div>

        <div
          style={{
            position: "absolute",
            left: vertical ? "8%" : "6%",
            top: vertical ? "10%" : "8%",
            width: vertical ? "24%" : "20%",
            height: 2,
            background: "#D6AA5B",
            transform: `scaleX(${range(frame, [96, 124], [0, 1])})`,
            transformOrigin: "left center",
            opacity: range(frame, [92, 102, 158, 176], [0, 1, 1, 0]),
          }}
        />
      </AbsoluteFill>

      {/* Shot 3: clean, product-dominant campaign hero. */}
      <AbsoluteFill style={{opacity: heroIn}}>
        <Material
          src={materialSrc}
          style={{
            filter: "brightness(.23) contrast(1.46) saturate(.62)",
            transform: `scale(${range(frame, [188, 299], [1.18, 1.08])})`,
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 46%, rgba(214,170,91,.28), rgba(5,5,5,.22) 30%, rgba(5,5,5,.9) 78%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: vertical ? "14%" : "11%",
            width: vertical ? "64%" : compact ? "48%" : "55%",
            height: vertical ? "7%" : "8%",
            transform: "translateX(-50%)",
            background:
              "linear-gradient(180deg, rgba(214,170,91,.28), rgba(12,10,7,.96))",
            clipPath: "polygon(9% 0, 91% 0, 100% 100%, 0 100%)",
            filter: "drop-shadow(0 24px 35px rgba(0,0,0,.86))",
          }}
        >
          <Material
            src={materialSrc}
            style={{
              filter: "brightness(.42) contrast(1.45) saturate(.7)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: vertical ? "47%" : "46%",
            width: `${heroWidth}%`,
            height: `${heroHeight}%`,
            transform: `translate(-50%, -50%) scale(${heroScale})`,
            filter:
              "drop-shadow(0 44px 62px rgba(0,0,0,.85)) drop-shadow(0 0 42px rgba(214,170,91,.18))",
          }}
        >
          <Product src={props.imageSrc} />
        </div>

        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            bottom: vertical ? "7%" : "5.5%",
            color: "#F4F0E8",
            fontSize: vertical ? 34 : 29,
            fontWeight: 900,
            letterSpacing: vertical ? 5 : 4,
            lineHeight: 1,
            textAlign: "center",
            textTransform: "uppercase",
            opacity: range(frame, [238, 252], [0, 1]),
          }}
        >
          {props.productName}
        </div>

        <AbsoluteFill
          style={{
            background:
              "linear-gradient(115deg, transparent 38%, rgba(255,241,199,.19) 49%, transparent 60%)",
            transform: `translateX(${range(frame, [282, 299], [-80, 80])}%)`,
            opacity: closingLight,
            mixBlendMode: "screen",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch18: React.FC<ProductVideoProps> = (props) =>
  props.templateId === "faultline" ? <Faultline {...props} /> : <ProductTemplateBatch18Blender {...props} />;

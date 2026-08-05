import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  getProductTemplate,
  productVideoDuration,
  type ProductMediaSlotId,
  type ProductTemplateId,
} from "./product-templates";
export {
  getProductVideoDuration,
  productVideoBatch2Duration,
  productVideoBatch3Duration,
  productVideoBatch4Duration,
  productVideoBatch5Duration,
  productVideoBatch6Duration,
  productVideoBatch7Duration,
  productVideoBatch8Duration,
  productVideoBatch9Duration,
  productVideoBatch10Duration,
  productVideoBatch11Duration,
  productVideoBatch12Duration,
  productVideoBatch13Duration,
  productVideoBatch14Duration,
  productVideoBatch15Duration,
  productVideoBatch16Duration,
  productVideoBatch17Duration,
  productVideoBatch18Duration,
  productVideoBatch19Duration,
  productVideoDuration,
} from "./product-templates";
import {ProductTemplateBatch2} from "./ProductTemplateBatch2";
import {ProductTemplateBatch3} from "./ProductTemplateBatch3";
import {ProductTemplateBatch4} from "./ProductTemplateBatch4";
import {ProductTemplateBatch5} from "./ProductTemplateBatch5";
import {ProductTemplateBatch6} from "./ProductTemplateBatch6";
import {ProductTemplateBatch7} from "./ProductTemplateBatch7";
import {ProductTemplateBatch8} from "./ProductTemplateBatch8";
import {ProductTemplateBatch9} from "./ProductTemplateBatch9";
import {ProductTemplateBatch10} from "./ProductTemplateBatch10";
import {ProductTemplateBatch11} from "./ProductTemplateBatch11";
import {ProductTemplateBatch12} from "./ProductTemplateBatch12";
import {ProductTemplateBatch13} from "./ProductTemplateBatch13";
import {ProductTemplateBatch14} from "./ProductTemplateBatch14";
import {ProductTemplateBatch15} from "./ProductTemplateBatch15";
import {ProductTemplateBatch16} from "./ProductTemplateBatch16";
import {ProductTemplateBatch17} from "./ProductTemplateBatch17";
import {ProductTemplateBatch18} from "./ProductTemplateBatch18";
import {ProductTemplateBatch19} from "./ProductTemplateBatch19";
import type {PolyHavenTextureSelection} from "./polyhaven-assets";

export type ProductVideoFormat = "portrait" | "square" | "vertical";

export type ProductVideoProps = {
  templateId: ProductTemplateId;
  imageSrc: string;
  media?: Partial<Record<ProductMediaSlotId, string>>;
  productName: string;
  headline?: string;
  subheadline?: string;
  eyebrow?: string;
  cta?: string;
  accent?: string;
  polyHavenTexture?: PolyHavenTextureSelection;
  formatId: ProductVideoFormat;
};

export const productVideoFps = 30;

export const productVideoFormats = {
  portrait: {width: 1080, height: 1350},
  square: {width: 1080, height: 1080},
  vertical: {width: 1080, height: 1920},
} as const;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const PlaceholderProduct: React.FC<{accent: string; foreground: string}> = ({
  accent,
  foreground,
}) => (
  <div
    style={{
      width: "58%",
      height: "68%",
      border: `2px dashed ${accent}`,
      borderRadius: 42,
      display: "grid",
      placeItems: "center",
      color: foreground,
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 2,
      opacity: 0.7,
    }}
  >
    UPLOAD PRODUCT
  </div>
);

export const ProductVideo: React.FC<ProductVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const template = getProductTemplate(props.templateId);
  if (template.batch === 2) {
    return <ProductTemplateBatch2 {...props} />;
  }
  if (template.batch === 3) {
    return <ProductTemplateBatch3 {...props} />;
  }
  if (template.batch === 4) {
    return <ProductTemplateBatch4 {...props} />;
  }
  if (template.batch === 5) {
    return <ProductTemplateBatch5 {...props} />;
  }
  if (template.batch === 6) {
    return <ProductTemplateBatch6 {...props} />;
  }
  if (template.batch === 7) {
    return <ProductTemplateBatch7 {...props} />;
  }
  if (template.batch === 8) {
    return <ProductTemplateBatch8 {...props} />;
  }
  if (template.batch === 9) {
    return <ProductTemplateBatch9 {...props} />;
  }
  if (template.batch === 10) {
    return <ProductTemplateBatch10 {...props} />;
  }
  if (template.batch === 11) {
    return <ProductTemplateBatch11 {...props} />;
  }
  if (template.batch === 12) {
    return <ProductTemplateBatch12 {...props} />;
  }
  if (template.batch === 13) {
    return <ProductTemplateBatch13 {...props} />;
  }
  if (template.batch === 14) {
    return <ProductTemplateBatch14 {...props} />;
  }
  if (template.batch === 15) {
    return <ProductTemplateBatch15 {...props} />;
  }
  if (template.batch === 16) {
    return <ProductTemplateBatch16 {...props} />;
  }
  if (template.batch === 17) {
    return <ProductTemplateBatch17 {...props} />;
  }
  if (template.batch === 18) {
    return <ProductTemplateBatch18 {...props} />;
  }
  if (template.batch === 19) {
    return <ProductTemplateBatch19 {...props} />;
  }
  const accent = props.accent || template.accent;
  const vertical = height / width > 1.55;
  const compact = height / width < 1.15;
  const enter = spring({
    fps,
    frame,
    config: {damping: 18, stiffness: 90, mass: 0.9},
  });
  const settle = interpolate(frame, [0, productVideoDuration], [1.04, 1], clamp);
  const imageX = interpolate(frame, [0, productVideoDuration], [22, -12], clamp);
  const textY = interpolate(enter, [0, 1], [70, 0], clamp);
  const lineWidth = interpolate(frame, [8, 54], [0, 100], clamp);
  const proofOpacity = interpolate(frame, [72, 92, 150, 170], [0, 1, 1, 0], clamp);
  const ctaOpacity = interpolate(frame, [126, 148], [0, 1], clamp);

  const isSplit = template.layout === "split" || template.layout === "editorial";
  const isTechnical = template.layout === "technical";
  const imageWidth = isSplit && !vertical ? "52%" : vertical ? "84%" : "72%";
  const imageHeight = isSplit && !vertical ? "68%" : vertical ? "52%" : "62%";
  const imageTop = vertical ? "28%" : isSplit ? "23%" : "21%";
  const imageLeft = isSplit && !vertical ? "70%" : "50%";
  const textWidth = isSplit && !vertical ? "45%" : vertical ? "86%" : "82%";
  const textLeft = isSplit && !vertical ? "7%" : "50%";
  const textTop = vertical ? "7%" : isSplit ? "17%" : "7%";

  return (
    <AbsoluteFill
      style={{
        background: template.background,
        color: template.foreground,
        fontFamily:
          'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            template.id === "aura"
              ? `radial-gradient(circle at 70% 58%, ${accent}55 0, transparent 42%)`
              : template.id === "chromatic"
                ? `linear-gradient(135deg, ${template.background}, ${template.surface})`
                : `radial-gradient(circle at 72% 50%, ${template.surface} 0, transparent 48%)`,
        }}
      />

      {isTechnical ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.2,
            backgroundImage: `linear-gradient(${accent}44 1px, transparent 1px), linear-gradient(90deg, ${accent}44 1px, transparent 1px)`,
            backgroundSize: `${Math.round(width / 12)}px ${Math.round(width / 12)}px`,
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: imageLeft,
          top: imageTop,
          width: imageWidth,
          height: imageHeight,
          transform: `translateX(calc(-50% + ${imageX}px)) scale(${enter * template.imageScale * settle})`,
          transformOrigin: "center",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "76%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: `${accent}22`,
            filter: `blur(${Math.round(width * 0.035)}px)`,
            transform: `scale(${0.86 + enter * 0.16})`,
          }}
        />
        {props.imageSrc ? (
          <Img
            src={props.imageSrc}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              objectFit: template.imageFit,
              filter: "drop-shadow(0 40px 55px rgba(0,0,0,.28))",
            }}
          />
        ) : (
          <PlaceholderProduct accent={accent} foreground={template.foreground} />
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: textLeft,
          top: textTop,
          width: textWidth,
          transform: `${isSplit && !vertical ? "" : "translateX(-50%)"} translateY(${textY}px)`,
          opacity: enter,
          textAlign:
            template.layout === "center" || template.layout === "poster"
              ? "center"
              : "left",
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: compact ? 19 : vertical ? 24 : 22,
            fontWeight: 800,
            letterSpacing: 4,
            marginBottom: vertical ? 24 : 18,
          }}
        >
          {props.eyebrow || template.eyebrow}
        </div>
        <div
          style={{
            fontSize: compact ? 68 : vertical ? 80 : isSplit ? 61 : 72,
            lineHeight: 0.94,
            letterSpacing: -2.5,
            wordSpacing: 9,
            fontWeight: 900,
            maxWidth: vertical ? 900 : undefined,
          }}
        >
          {props.headline || template.headline}
        </div>
        <div
          style={{
            width: `${lineWidth}%`,
            height: 4,
            background: accent,
            margin:
              template.layout === "center" || template.layout === "poster"
                ? `${vertical ? 26 : 22}px auto`
                : `${vertical ? 26 : 22}px 0`,
          }}
        />
        <div
          style={{
            color: template.muted,
            fontSize: compact ? 22 : vertical ? 27 : 24,
            lineHeight: 1.35,
            maxWidth: 700,
            margin:
              template.layout === "center" || template.layout === "poster"
                ? "0 auto"
                : 0,
          }}
        >
          {props.subheadline || template.subheadline}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: vertical ? "7%" : "6%",
          right: vertical ? "7%" : "6%",
          bottom: vertical ? "8%" : "7%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          opacity: proofOpacity,
        }}
      >
        <div>
          <div
            style={{
              fontSize: compact ? 17 : 19,
              letterSpacing: 3,
              color: template.muted,
              marginBottom: 10,
            }}
          >
            PRODUCT
          </div>
          <div
            style={{
              fontSize: compact ? 30 : vertical ? 38 : 34,
              fontWeight: 850,
            }}
          >
            {props.productName || "Your Product"}
          </div>
        </div>
        <div
          style={{
            padding: `${compact ? 14 : 17}px ${compact ? 22 : 28}px`,
            borderRadius: 999,
            background: accent,
            color:
              template.id === "aura" || template.id === "launch"
                ? "#ffffff"
                : template.background,
            fontSize: compact ? 17 : 19,
            fontWeight: 850,
            opacity: ctaOpacity,
          }}
        >
          {props.cta || template.cta} →
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: Math.round(width * 0.028),
          border: `1px solid ${template.foreground}22`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

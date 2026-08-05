import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {getProductTemplate} from "./product-templates";
import type {ProductVideoProps} from "./ProductVideo";

type Placement = {frame: number; x: number; y: number; scale: number; rotation: number};
const ROOT = "advanced-studio2-assets/blender/template18";

const usePlacements = (templateId: string) => {
  const [data, setData] = React.useState<Placement[] | null>(null);
  const [handle] = React.useState(() => delayRender(`Load ${templateId} placement`));
  React.useEffect(() => {
    fetch(staticFile(`${ROOT}/${templateId}/placement.json`))
      .then((response) => {
        if (!response.ok) throw new Error(`Missing placement data for ${templateId}`);
        return response.json() as Promise<Placement[]>;
      })
      .then((placements) => {
        if (placements.length !== 300) throw new Error(`${templateId} placement data must contain 300 frames`);
        setData(placements);
        continueRender(handle);
      })
      .catch((error) => {
        continueRender(handle);
        throw error;
      });
  }, [handle, templateId]);
  return data;
};

export const ProductTemplateBatch18Blender: React.FC<ProductVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const template = getProductTemplate(props.templateId);
  const placements = usePlacements(props.templateId);
  if (!placements) return null;
  const placement = placements[Math.min(frame, 299)];
  const cropScale = Math.max(width / 1920, height / 1920);
  const masterSize = 1920 * cropScale;
  const copyIn = Math.max(0, Math.min(1, (frame - 232) / 24));
  const mediaStyle: React.CSSProperties = {
    position: "absolute", left: "50%", top: "50%", width: masterSize, height: masterSize,
    transform: "translate(-50%, -50%)",
  };
  return (
    <AbsoluteFill style={{background: template.background, overflow: "hidden"}}>
      <OffthreadVideo muted src={staticFile(`${ROOT}/${props.templateId}/background.mp4`)} style={mediaStyle} />
      <div style={{
        position: "absolute",
        left: `calc(50% + ${(placement.x - 0.5) * masterSize}px)`,
        top: `calc(50% + ${(placement.y - 0.5) * masterSize}px)`,
        width: placement.scale * masterSize,
        height: placement.scale * masterSize,
        transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
      }}>
        {props.imageSrc ? <Img src={props.imageSrc} style={{
          width: "100%", height: "100%", objectFit: "contain",
          filter: "drop-shadow(0 28px 34px rgba(0,0,0,.48))",
        }} /> : null}
      </div>
      <Img
        src={staticFile(
          `${ROOT}/${props.templateId}/foreground/${String(frame).padStart(4, "0")}.png`,
        )}
        style={mediaStyle}
      />
      <div style={{
        position: "absolute", left: "7%", right: "7%", bottom: "5%",
        color: template.foreground, textAlign: template.layout === "editorial" ? "left" : "center",
        opacity: copyIn, textShadow: "0 3px 24px rgba(0,0,0,.65)",
      }}>
        <div style={{color: props.accent || template.accent, fontSize: 16, fontWeight: 900, letterSpacing: 4}}>
          {props.eyebrow || template.eyebrow}
        </div>
        <div style={{fontSize: height > width * 1.55 ? 72 : 58, fontWeight: 900, lineHeight: 0.95, marginTop: 12}}>
          {props.headline || template.headline}
        </div>
        <div style={{fontSize: 19, color: template.muted, marginTop: 14}}>
          {props.subheadline || template.subheadline}
        </div>
        <div style={{fontSize: 18, color: props.accent || template.accent, fontWeight: 850, marginTop: 15}}>
          {props.cta || template.cta} →
        </div>
      </div>
    </AbsoluteFill>
  );
};

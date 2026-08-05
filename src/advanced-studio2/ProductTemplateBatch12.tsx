import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {getProductTemplate} from "./product-templates";
import type {ProductVideoProps} from "./ProductVideo";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const move = (
  frame: number,
  input: [number, number],
  output: [number, number],
) =>
  interpolate(frame, input, output, {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const phase = (
  frame: number,
  input: [number, number, number, number],
  output: [number, number, number, number],
) => interpolate(frame, input, output, clamp);

const useScene = (props: ProductVideoProps) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const template = getProductTemplate(props.templateId);
  return {
    frame,
    width,
    height,
    vertical: height / width > 1.55,
    compact: height / width < 1.15,
    template,
    accent: props.accent || template.accent,
    eyebrow: props.eyebrow || template.eyebrow,
    headline: props.headline || template.headline,
    subheadline: props.subheadline || template.subheadline,
    cta: props.cta || template.cta,
  };
};

type Scene = ReturnType<typeof useScene>;

const Material: React.FC<{
  src?: string;
  opacity?: number;
  scale?: number;
  position?: string;
  style?: React.CSSProperties;
}> = ({src, opacity = 0.72, scale = 1.05, position = "center", style}) =>
  src ? (
    <Img
      src={staticFile(src.replace(/^\/+/, ""))}
      style={{
        position: "absolute",
        inset: "-5%",
        width: "110%",
        height: "110%",
        objectFit: "cover",
        objectPosition: position,
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    />
  ) : null;

const Product: React.FC<{
  src: string;
  style?: React.CSSProperties;
}> = ({src, style}) =>
  src ? (
    <Img
      src={src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        filter: "drop-shadow(0 34px 38px rgba(0,0,0,.36))",
        ...style,
      }}
    />
  ) : (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: "2px dashed currentColor",
        display: "grid",
        placeItems: "center",
        opacity: 0.35,
        fontWeight: 900,
        letterSpacing: 3,
        ...style,
      }}
    >
      UPLOAD PRODUCT
    </div>
  );

const Copy: React.FC<{
  scene: Scene;
  align?: "left" | "center" | "right";
  light?: boolean;
  style?: React.CSSProperties;
}> = ({scene, align = "left", light = false, style}) => (
  <div
    style={{
      textAlign: align,
      color: light ? "#fff" : scene.template.foreground,
      ...style,
    }}
  >
    <div
      style={{
        color: scene.accent,
        fontSize: 14,
        fontWeight: 900,
        letterSpacing: 4,
      }}
    >
      {scene.eyebrow}
    </div>
    <div
      style={{
        marginTop: 16,
        fontSize: scene.vertical ? 76 : scene.compact ? 54 : 66,
        fontWeight: 900,
        lineHeight: 0.9,
        letterSpacing: -3,
      }}
    >
      {scene.headline}
    </div>
    <div
      style={{
        maxWidth: 560,
        margin:
          align === "center" ? "20px auto 0" : align === "right" ? "20px 0 0 auto" : "20px 0 0",
        color: light ? "#e7e2d8" : scene.template.muted,
        fontSize: 17,
        lineHeight: 1.4,
      }}
    >
      {scene.subheadline}
    </div>
    <div style={{marginTop: 22, color: scene.accent, fontWeight: 800}}>
      {scene.cta} →
    </div>
  </div>
);

const MaterialNoir: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const scan = move(s.frame, [0, 205], [-40, 140]);
  const reveal = move(s.frame, [72, 176], [0, 1]);
  const finish = move(s.frame, [212, 280], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.82}
        scale={1.15}
        style={{filter: "grayscale(1) contrast(1.25) brightness(.38)"}}
      />
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(90deg,#000 4%,transparent 52%,#000 96%)"}} />
      <div style={{position: "absolute", left: `${scan}%`, top: "-20%", width: "18%", height: "140%", background: `linear-gradient(90deg,transparent,${s.accent}aa,transparent)`, filter: "blur(34px)", transform: "rotate(12deg)"}} />
      <div style={{position: "absolute", left: "50%", top: "50%", width: s.vertical ? "72%" : "46%", height: s.vertical ? "50%" : "66%", transform: `translate(-50%,-50%) scale(${0.84 + reveal * 0.16})`, opacity: reveal}}>
        <Product src={props.imageSrc} />
      </div>
      <Copy scene={s} light align="center" style={{position: "absolute", left: "7%", right: "7%", bottom: "6%", opacity: finish, transform: `translateY(${(1 - finish) * 24}px)`}} />
    </AbsoluteFill>
  );
};

const MineralGallery: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const open = move(s.frame, [18, 138], [0, 1]);
  const settle = move(s.frame, [138, 230], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      {[0, 1, 2].map((index) => (
        <div key={index} style={{position: "absolute", left: `${index * 33.34}%`, top: 0, width: "33.4%", height: "100%", overflow: "hidden", transform: `translateY(${(1 - open) * (index % 2 ? -100 : 100)}%)`}}>
          <Material src={props.polyHavenTexture?.localSrc} opacity={0.9} scale={1.2} style={{left: `${-index * 100}%`, width: "300%", filter: `saturate(.65) brightness(${0.82 + index * 0.08})`}} />
        </div>
      ))}
      <div style={{position: "absolute", inset: 0, background: `rgba(242,237,228,${settle * 0.72})`}} />
      <div style={{position: "absolute", left: "50%", top: s.vertical ? "47%" : "52%", width: s.vertical ? "68%" : "42%", height: s.vertical ? "45%" : "62%", transform: `translate(-50%,-50%) scale(${0.9 + settle * 0.1})`}}>
        <Product src={props.imageSrc} />
      </div>
      <Copy scene={s} align={s.vertical ? "center" : "left"} style={{position: "absolute", left: "6%", right: "6%", top: "6%", opacity: settle}} />
    </AbsoluteFill>
  );
};

const WetAsphalt: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const track = move(s.frame, [0, 205], [1.24, 1]);
  const hero = move(s.frame, [82, 188], [0, 1]);
  const copy = move(s.frame, [205, 276], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden", perspective: 900}}>
      <Material src={props.polyHavenTexture?.localSrc} opacity={0.86} scale={track} position="center bottom" style={{transformOrigin: "50% 100%", transform: `perspective(800px) rotateX(58deg) scale(${track * 1.7})`, filter: "grayscale(.45) brightness(.38) contrast(1.3)"}} />
      <div style={{position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 74%,${s.accent}55,transparent 48%),linear-gradient(#02040755,#020407 88%)`}} />
      <div style={{position: "absolute", left: "50%", top: "48%", width: s.vertical ? "75%" : "48%", height: s.vertical ? "48%" : "66%", transform: `translate(-50%,-50%) scale(${0.72 + hero * 0.28})`, opacity: hero}}>
        <Product src={props.imageSrc} style={{filter: `drop-shadow(0 48px 34px ${s.accent}55)`}} />
      </div>
      <Copy scene={s} light align="center" style={{position: "absolute", left: "7%", right: "7%", bottom: "5%", opacity: copy}} />
    </AbsoluteFill>
  );
};

const TravertineSun: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const sun = move(s.frame, [0, 220], [-30, 115]);
  const product = move(s.frame, [44, 162], [0, 1]);
  const end = move(s.frame, [190, 272], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material src={props.polyHavenTexture?.localSrc} opacity={0.86} scale={1.08} style={{filter: "sepia(.25) saturate(.78) brightness(1.05)"}} />
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(110deg,rgba(255,240,200,.65),transparent 45%,rgba(60,25,8,.28))"}} />
      <div style={{position: "absolute", left: `${sun}%`, top: "-20%", width: "22%", height: "140%", background: "#fff0c0aa", filter: "blur(24px)", transform: "rotate(15deg)"}} />
      <div style={{position: "absolute", left: s.vertical ? "50%" : "67%", top: "54%", width: s.vertical ? "68%" : "43%", height: s.vertical ? "45%" : "65%", transform: `translate(-50%,-50%) translateY(${(1 - product) * 90}px)`, opacity: product}}>
        <Product src={props.imageSrc} />
      </div>
      <Copy scene={s} align={s.vertical ? "center" : "left"} style={{position: "absolute", left: "6%", right: s.vertical ? "6%" : "54%", top: s.vertical ? "6%" : "18%", opacity: end}} />
    </AbsoluteFill>
  );
};

const BrushedAlloy: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const scan = move(s.frame, [12, 178], [-10, 110]);
  const lock = move(s.frame, [118, 218], [0, 1]);
  const finish = move(s.frame, [218, 282], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <Material src={props.polyHavenTexture?.localSrc} opacity={0.68} scale={1.05} style={{filter: "grayscale(1) contrast(1.35) brightness(.48)"}} />
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(90deg,#06080bcc,transparent,#06080bcc)"}} />
      <div style={{position: "absolute", left: `${scan}%`, top: 0, width: 3, height: "100%", background: s.accent, boxShadow: `0 0 34px 10px ${s.accent}`}} />
      <div style={{position: "absolute", left: "50%", top: "50%", width: s.vertical ? "70%" : "45%", height: s.vertical ? "48%" : "66%", transform: `translate(-50%,-50%) scale(${0.82 + lock * 0.18})`}}>
        <Product src={props.imageSrc} style={{clipPath: `inset(0 ${100 - lock * 100}% 0 0)`}} />
      </div>
      <div style={{position: "absolute", inset: "4%", border: `1px solid ${s.accent}88`, opacity: finish}} />
      <Copy scene={s} light style={{position: "absolute", left: "6%", right: s.vertical ? "6%" : "55%", top: "6%", opacity: finish}} />
    </AbsoluteFill>
  );
};

const PaperAtelier: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const page = move(s.frame, [12, 136], [100, 0]);
  const crop = move(s.frame, [116, 218], [0, 1]);
  const finish = move(s.frame, [218, 282], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material src={props.polyHavenTexture?.localSrc} opacity={0.42} scale={1.04} style={{filter: "grayscale(.7) brightness(1.2)"}} />
      <div style={{position: "absolute", inset: "5%", background: s.template.surface, transform: `translateX(${page}%)`, boxShadow: "0 30px 70px #392b1d35", overflow: "hidden"}}>
        <div style={{position: "absolute", left: "5%", top: "5%", right: "5%", height: "42%", overflow: "hidden", clipPath: "polygon(0 0,100% 3%,96% 100%,3% 94%)"}}>
          <Material src={props.polyHavenTexture?.localSrc} opacity={0.95} scale={1.16} />
        </div>
        <div style={{position: "absolute", left: s.vertical ? "16%" : "55%", top: s.vertical ? "36%" : "26%", width: s.vertical ? "68%" : "38%", height: s.vertical ? "44%" : "62%", transform: `scale(${0.82 + crop * 0.18})`}}>
          <Product src={props.imageSrc} />
        </div>
        <Copy scene={s} style={{position: "absolute", left: "6%", right: s.vertical ? "6%" : "54%", bottom: "7%", opacity: finish}} />
      </div>
    </AbsoluteFill>
  );
};

const ConcreteRunway: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const travel = move(s.frame, [0, 210], [-55, 50]);
  const resolve = move(s.frame, [205, 280], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden", perspective: 900}}>
      <Material src={props.polyHavenTexture?.localSrc} opacity={0.88} scale={1.15} style={{filter: "grayscale(1) brightness(.5) contrast(1.2)"}} />
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(90deg,#080908cc,transparent,#080908cc)"}} />
      <div style={{position: "absolute", left: `${travel}%`, top: "50%", width: s.vertical ? "70%" : "42%", height: s.vertical ? "47%" : "66%", transform: "translate(-50%,-50%)"}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", left: "5%", right: "5%", bottom: "5%", height: 5, background: `linear-gradient(90deg,${s.accent} ${travel + 45}%,#fff2 ${travel + 45}%)`}} />
      <Copy scene={s} light align={s.vertical ? "center" : "right"} style={{position: "absolute", left: s.vertical ? "7%" : "50%", right: "7%", top: s.vertical ? "6%" : "13%", opacity: resolve}} />
    </AbsoluteFill>
  );
};

const VelvetChamber: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const curtain = move(s.frame, [18, 158], [0, 1]);
  const spotlight = move(s.frame, [88, 208], [0, 1]);
  const finish = move(s.frame, [210, 282], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <Material src={props.polyHavenTexture?.localSrc} opacity={0.72} scale={1.2} style={{filter: "sepia(.4) hue-rotate(290deg) saturate(1.5) brightness(.5)"}} />
      <div style={{position: "absolute", left: 0, top: 0, width: "51%", height: "100%", background: `${s.template.surface}ee`, transform: `translateX(${-curtain * 102}%)`, boxShadow: "12px 0 44px #0008"}} />
      <div style={{position: "absolute", right: 0, top: 0, width: "51%", height: "100%", background: `${s.template.surface}ee`, transform: `translateX(${curtain * 102}%)`, boxShadow: "-12px 0 44px #0008"}} />
      <div style={{position: "absolute", left: "50%", top: "48%", width: s.vertical ? "72%" : "46%", height: s.vertical ? "48%" : "66%", transform: `translate(-50%,-50%) scale(${0.84 + spotlight * 0.16})`, opacity: spotlight}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 42%,transparent 12%,rgba(0,0,0,${0.78 - spotlight * 0.3}) 72%)`}} />
      <Copy scene={s} light align="center" style={{position: "absolute", left: "7%", right: "7%", bottom: "5%", opacity: finish}} />
    </AbsoluteFill>
  );
};

const TimberRitual: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const morning = move(s.frame, [0, 180], [-25, 120]);
  const enter = move(s.frame, [42, 162], [0, 1]);
  const copy = move(s.frame, [192, 278], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material src={props.polyHavenTexture?.localSrc} opacity={0.86} scale={1.1} style={{filter: "sepia(.35) saturate(.9) brightness(.9)"}} />
      <div style={{position: "absolute", left: `${morning}%`, top: "-15%", width: "35%", height: "130%", background: "linear-gradient(90deg,transparent,#fff3c999,transparent)", filter: "blur(25px)", transform: "rotate(9deg)"}} />
      <div style={{position: "absolute", left: s.vertical ? "50%" : "68%", top: "53%", width: s.vertical ? "70%" : "43%", height: s.vertical ? "47%" : "68%", transform: `translate(-50%,-50%) translateY(${(1 - enter) * 75}px)`, opacity: enter}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(44,25,12,.58),transparent 65%)"}} />
      <Copy scene={s} light={false} align={s.vertical ? "center" : "left"} style={{position: "absolute", left: "6%", right: s.vertical ? "6%" : "54%", top: s.vertical ? "6%" : "20%", opacity: copy, padding: 24, background: s.vertical ? "#f3dfc1dd" : "#f3dfc1e8"}} />
    </AbsoluteFill>
  );
};

const StudioArchive: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const contact = phase(s.frame, [0, 26, 178, 218], [0, 1, 1, 0]);
  const hero = move(s.frame, [205, 274], [0, 1]);
  const cells = Array.from({length: 9});
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", inset: "4%", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, opacity: contact}}>
        {cells.map((_, index) => (
          <div key={index} style={{position: "relative", overflow: "hidden", background: "#222"}}>
            <Material src={props.polyHavenTexture?.localSrc} opacity={0.92} scale={1.1 + (index % 3) * 0.08} position={`${20 + (index % 3) * 30}% ${20 + Math.floor(index / 3) * 30}%`} style={{filter: `grayscale(${index % 2 ? 1 : 0}) contrast(${1 + index * 0.04})`}} />
            <span style={{position: "absolute", left: 8, bottom: 7, fontSize: 10, fontFamily: "monospace"}}>MATERIAL / 0{index + 1}</span>
          </div>
        ))}
      </div>
      <div style={{position: "absolute", inset: 0, background: s.template.surface, color: "#121212", opacity: hero, display: "grid", gridTemplateColumns: s.vertical ? "1fr" : "1fr 1fr", alignItems: "center", padding: "7%", gap: 30}}>
        <div style={{height: s.vertical ? "58%" : "72%", alignSelf: "center"}}>
          <Product src={props.imageSrc} />
        </div>
        <Copy scene={s} />
      </div>
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch12: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "material-noir":
      return <MaterialNoir {...props} />;
    case "mineral-gallery":
      return <MineralGallery {...props} />;
    case "wet-asphalt":
      return <WetAsphalt {...props} />;
    case "travertine-sun":
      return <TravertineSun {...props} />;
    case "brushed-alloy":
      return <BrushedAlloy {...props} />;
    case "paper-atelier":
      return <PaperAtelier {...props} />;
    case "concrete-runway":
      return <ConcreteRunway {...props} />;
    case "velvet-chamber":
      return <VelvetChamber {...props} />;
    case "timber-ritual":
      return <TimberRitual {...props} />;
    case "studio-archive":
      return <StudioArchive {...props} />;
    default:
      return null;
  }
};

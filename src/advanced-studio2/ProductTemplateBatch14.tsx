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

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const move = (frame: number, input: [number, number], output: [number, number]) =>
  interpolate(frame, input, output, {...clamp, easing: Easing.inOut(Easing.cubic)});

const useScene = (props: ProductVideoProps) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const template = getProductTemplate(props.templateId);
  return {
    frame, width, height, vertical: height / width > 1.55, compact: height / width < 1.15,
    template, accent: props.accent || template.accent,
    eyebrow: props.eyebrow || template.eyebrow, headline: props.headline || template.headline,
    subheadline: props.subheadline || template.subheadline, cta: props.cta || template.cta,
  };
};
type Scene = ReturnType<typeof useScene>;

const Material: React.FC<{src?: string; opacity?: number; style?: React.CSSProperties}> = ({
  src, opacity = 0.75, style,
}) => src ? (
  <Img src={staticFile(src.replace(/^\/+/, ""))} style={{
    position: "absolute", inset: "-5%", width: "110%", height: "110%",
    objectFit: "cover", opacity, ...style,
  }} />
) : null;

const Product: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) =>
  src ? <Img src={src} style={{
    width: "100%", height: "100%", objectFit: "contain",
    filter: "drop-shadow(0 34px 42px rgba(0,0,0,.36))", ...style,
  }} /> : <div style={{
    width: "100%", height: "100%", display: "grid", placeItems: "center",
    border: "2px dashed currentColor", opacity: 0.35, fontWeight: 900, letterSpacing: 3, ...style,
  }}>UPLOAD PRODUCT</div>;

const Copy: React.FC<{scene: Scene; align?: "left" | "center" | "right"; light?: boolean; style?: React.CSSProperties}> = ({
  scene, align = "left", light = false, style,
}) => <div style={{color: light ? "#fff" : scene.template.foreground, textAlign: align, ...style}}>
  <div style={{color: scene.accent, fontSize: 14, fontWeight: 900, letterSpacing: 4}}>{scene.eyebrow}</div>
  <div style={{marginTop: 15, fontSize: scene.vertical ? 76 : scene.compact ? 54 : 66, fontWeight: 900, lineHeight: .9, letterSpacing: -3}}>{scene.headline}</div>
  <div style={{
    maxWidth: 570, margin: align === "center" ? "20px auto 0" : align === "right" ? "20px 0 0 auto" : "20px 0 0",
    color: light ? "#e8e4dc" : scene.template.muted, fontSize: 17, lineHeight: 1.4,
  }}>{scene.subheadline}</div>
  <div style={{marginTop: 22, color: scene.accent, fontWeight: 800}}>{scene.cta} →</div>
</div>;

const hero = (s: Scene): React.CSSProperties => ({
  position: "absolute", left: "50%", top: s.vertical ? "48%" : "51%",
  width: s.vertical ? "72%" : "48%", height: s.vertical ? "50%" : "68%",
});

const maskStyle = (src: string): React.CSSProperties => ({
  WebkitMaskImage: src ? `url("${src}")` : undefined,
  maskImage: src ? `url("${src}")` : undefined,
  WebkitMaskSize: "contain", maskSize: "contain",
  WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
  WebkitMaskPosition: "center", maskPosition: "center",
});

const RackFocusAuthority: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const focus = move(s.frame, [22, 205], [0, 1]);
  const copy = move(s.frame, [210, 282], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.42} style={{filter: `grayscale(1) brightness(${.28 + focus * .18})`}} />
    <div style={{...hero(s), left: "18%", transform: `translate(-50%,-50%) scale(2.4)`, opacity: 1 - focus, filter: `blur(${focus * 28}px)`}}>
      <Product src={props.imageSrc} />
    </div>
    <div style={{...hero(s), transform: `translate(-50%,-50%) scale(${1.12 - focus * .12})`, filter: `blur(${(1 - focus) * 24}px)`}}>
      <Product src={props.imageSrc} style={{opacity: .25 + focus * .75}} />
    </div>
    <div style={{position: "absolute", left: "6%", right: "6%", top: "50%", height: 1, background: `linear-gradient(90deg,transparent,${s.accent},transparent)`, opacity: focus}} />
    <Copy scene={s} light align="center" style={{position: "absolute", left: "7%", right: "7%", bottom: "5%", opacity: copy}} />
  </AbsoluteFill>;
};

const SplitDiopterHero: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const seam = move(s.frame, [18, 205], [72, 43]);
  const finish = move(s.frame, [205, 280], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.5} style={{filter: "grayscale(1) brightness(.34)"}} />
    <div style={{position: "absolute", inset: 0, clipPath: `inset(0 ${100 - seam}% 0 0)`, overflow: "hidden"}}>
      <div style={{...hero(s), left: "26%", transform: "translate(-50%,-50%) scale(1.85)"}}><Product src={props.imageSrc} /></div>
    </div>
    <div style={{position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${seam}%)`, overflow: "hidden"}}>
      <div style={{...hero(s), left: "68%", transform: "translate(-50%,-50%)"}}><Product src={props.imageSrc} /></div>
    </div>
    <div style={{position: "absolute", left: `${seam}%`, top: "7%", bottom: "7%", width: 2, background: s.accent, boxShadow: `0 0 22px ${s.accent}`}} />
    <Copy scene={s} light style={{position: "absolute", left: "6%", right: s.vertical ? "6%" : "57%", top: "6%", opacity: finish}} />
  </AbsoluteFill>;
};

const ProductWake: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const travel = move(s.frame, [12, 212], [-28, 50]);
  const finish = move(s.frame, [208, 280], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.7} style={{filter: "sepia(.25) brightness(.58)"}} />
    {Array.from({length: 7}).map((_, i) => <div key={i} style={{
      position: "absolute", left: `${travel - 48 - i * 7}%`, top: `${25 + i * 7}%`,
      width: `${56 + i * 3}%`, height: 3, background: `linear-gradient(90deg,transparent,${s.accent}${i < 3 ? "cc" : "55"})`,
      transform: `skewX(-22deg)`, opacity: .9 - i * .1,
    }} />)}
    <div style={{...hero(s), left: `${travel}%`, transform: "translate(-50%,-50%)"}}><Product src={props.imageSrc} /></div>
    <Copy scene={s} light align={s.vertical ? "center" : "left"} style={{
      position: "absolute", left: "6%", right: s.vertical ? "6%" : "55%", bottom: s.vertical ? "5%" : "8%",
      opacity: finish, transform: `translateX(${(1 - finish) * -70}px)`,
    }} />
  </AbsoluteFill>;
};

const LightTransfer: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const light = move(s.frame, [12, 190], [-30, 130]);
  const transfer = move(s.frame, [178, 250], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.5} style={{filter: "grayscale(1) brightness(.3)"}} />
    <div style={{...hero(s), left: s.vertical ? "50%" : "67%", transform: "translate(-50%,-50%)"}}>
      <Product src={props.imageSrc} style={{filter: "brightness(.32) drop-shadow(0 36px 42px #0008)"}} />
      <div style={{position: "absolute", inset: 0, ...maskStyle(props.imageSrc), opacity: props.imageSrc ? 1 : 0,
        background: `linear-gradient(105deg,transparent ${light - 12}%,#fff ${light}%,${s.accent} ${light + 6}%,transparent ${light + 15}%)`,
        filter: `drop-shadow(0 0 18px ${s.accent})`}} />
    </div>
    <div style={{position: "absolute", left: `${light}%`, top: "18%", width: 2, height: "64%", background: s.accent, opacity: 1 - transfer}} />
    <Copy scene={s} light style={{position: "absolute", left: "6%", right: s.vertical ? "6%" : "55%", top: s.vertical ? "6%" : "18%", opacity: transfer,
      filter: `drop-shadow(0 0 ${transfer * 12}px ${s.accent}66)`}} />
  </AbsoluteFill>;
};

const CalibrationLock: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const lock = move(s.frame, [12, 210], [0, 1]);
  const finish = move(s.frame, [208, 282], [0, 1]);
  const insetX = 8 + lock * (s.vertical ? 13 : 23);
  const insetY = 6 + lock * 17;
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.4} style={{filter: "grayscale(1) brightness(.28)"}} />
    <div style={{...hero(s), transform: `translate(-50%,-50%) scale(${.86 + lock * .14})`}}><Product src={props.imageSrc} /></div>
    <div style={{position: "absolute", left: `${insetX}%`, right: `${insetX}%`, top: `${insetY}%`, bottom: `${insetY}%`,
      border: `2px solid ${s.accent}`, boxShadow: `inset 0 0 0 1px #fff2`}} />
    {[0, 1, 2, 3].map((i) => <div key={i} style={{position: "absolute", width: 42, height: 42,
      left: i % 2 ? `calc(${100 - insetX}% - 42px)` : `${insetX}%`, top: i > 1 ? `calc(${100 - insetY}% - 42px)` : `${insetY}%`,
      borderLeft: i % 2 ? "none" : `5px solid ${s.accent}`, borderRight: i % 2 ? `5px solid ${s.accent}` : "none",
      borderTop: i > 1 ? "none" : `5px solid ${s.accent}`, borderBottom: i > 1 ? `5px solid ${s.accent}` : "none"}} />)}
    <div style={{position: "absolute", right: "4%", top: "4%", color: s.accent, fontFamily: "monospace", fontSize: 16}}>LOCK {Math.round(lock * 100)}%</div>
    <Copy scene={s} light align="center" style={{position: "absolute", left: "7%", right: "7%", bottom: "4%", opacity: finish}} />
  </AbsoluteFill>;
};

const ColorCapture: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const capture = move(s.frame, [10, 220], [0, 1]);
  const finish = move(s.frame, [214, 282], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.68} style={{filter: `grayscale(${capture}) brightness(${.72 - capture * .25})`}} />
    <div style={{position: "absolute", inset: 0, background: s.accent, opacity: .24 * (1 - capture), mixBlendMode: "color"}} />
    <div style={{...hero(s), transform: "translate(-50%,-50%)"}}>
      <Product src={props.imageSrc} style={{filter: `grayscale(${1 - capture}) saturate(${.6 + capture * .75}) drop-shadow(0 34px 42px #0007)`}} />
    </div>
    <div style={{position: "absolute", left: "50%", top: "50%", width: `${20 + capture * 50}%`, height: `${16 + capture * 45}%`,
      transform: "translate(-50%,-50%)", borderRadius: "50%", boxShadow: `0 0 90px 20px ${s.accent}${capture > .5 ? "44" : "11"}`}} />
    <Copy scene={s} light align="center" style={{position: "absolute", left: "7%", right: "7%", bottom: "5%", opacity: finish}} />
  </AbsoluteFill>;
};

const MaterialTransfer: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const transfer = move(s.frame, [12, 218], [0, 1]);
  const finish = move(s.frame, [214, 282], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.26} style={{filter: "brightness(.38)"}} />
    <div style={{...hero(s), transform: "translate(-50%,-50%)"}}>
      <Product src={props.imageSrc} style={{opacity: transfer, filter: `brightness(${.65 + transfer * .35}) drop-shadow(0 34px 42px #0008)`}} />
      <div style={{position: "absolute", inset: 0, ...maskStyle(props.imageSrc), opacity: props.imageSrc ? 1 - transfer : 0, overflow: "hidden"}}>
        <Material src={props.polyHavenTexture?.localSrc} opacity={1} style={{filter: "brightness(.95) contrast(1.2)", transform: `scale(${1.35 - transfer * .25})`}} />
      </div>
    </div>
    <div style={{position: "absolute", left: "8%", right: "8%", top: `${18 + transfer * 64}%`, height: 2, background: s.accent, boxShadow: `0 0 18px ${s.accent}`}} />
    <Copy scene={s} light align="center" style={{position: "absolute", left: "7%", right: "7%", bottom: "5%", opacity: finish}} />
  </AbsoluteFill>;
};

const SilhouettePortal: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const depth = move(s.frame, [10, 190], [0, 1]);
  const close = move(s.frame, [190, 252], [0, 1]);
  const finish = move(s.frame, [236, 288], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.22} style={{filter: "brightness(.28) blur(5px)"}} />
    <div style={{...hero(s), transform: `translate(-50%,-50%) scale(${1.12 - depth * .12})`}}>
      <div style={{position: "absolute", inset: 0, ...maskStyle(props.imageSrc), opacity: props.imageSrc ? 1 - close : 0,
        background: `radial-gradient(circle at ${30 + depth * 45}% ${30 + depth * 30}%,${s.accent},transparent 34%),${s.template.surface}`,
        boxShadow: `inset 0 0 90px #0009`, filter: `drop-shadow(0 0 24px ${s.accent})`}}>
        <Material src={props.polyHavenTexture?.localSrc} opacity={.88} style={{transform: `scale(${1.6 - depth * .35}) translateX(${(1 - depth) * -8}%)`}} />
      </div>
      <Product src={props.imageSrc} style={{opacity: close}} />
    </div>
    <Copy scene={s} light align="center" style={{position: "absolute", left: "7%", right: "7%", bottom: "5%", opacity: finish}} />
  </AbsoluteFill>;
};

const ContactExposure: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const expose = move(s.frame, [12, 142], [0, 1]);
  const lift = move(s.frame, [142, 238], [0, 1]);
  const finish = move(s.frame, [228, 286], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.42} style={{filter: "grayscale(1) brightness(1.25)"}} />
    <div style={{...hero(s), transform: "translate(-50%,-50%)", ...maskStyle(props.imageSrc), opacity: props.imageSrc ? .18 + expose * .5 : 0,
      background: s.accent, filter: `blur(${(1 - expose) * 18}px)`, mixBlendMode: "multiply"}} />
    <div style={{position: "absolute", inset: 0, background: "#fff", opacity: Math.max(0, .7 - Math.abs(s.frame - 130) / 18)}} />
    <div style={{...hero(s), transform: `translate(-50%,-50%) translate(${lift * (s.vertical ? 0 : 120)}px,${-lift * 60}px) rotate(${lift * 2}deg)`,
      opacity: lift}}>
      <Product src={props.imageSrc} />
    </div>
    <Copy scene={s} align={s.vertical ? "center" : "left"} style={{position: "absolute", left: "6%", right: s.vertical ? "6%" : "55%", top: "6%", opacity: finish}} />
  </AbsoluteFill>;
};

const ProductSourcedEndFrame: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const assemble = move(s.frame, [12, 210], [0, 1]);
  const finish = move(s.frame, [208, 282], [0, 1]);
  const crops = [
    {x: -42, y: -34, scale: 2.1}, {x: 44, y: -28, scale: 1.8},
    {x: -38, y: 42, scale: 1.65}, {x: 42, y: 38, scale: 2.2},
  ];
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={0.25} style={{filter: "grayscale(1) brightness(.3)"}} />
    {crops.map((crop, i) => <div key={i} style={{
      position: "absolute", left: `${50 + crop.x * (1 - assemble)}%`, top: `${50 + crop.y * (1 - assemble)}%`,
      width: s.vertical ? "70%" : "46%", height: s.vertical ? "48%" : "66%",
      transform: `translate(-50%,-50%) scale(${crop.scale - (crop.scale - 1) * assemble})`,
      clipPath: `inset(${i < 2 ? 0 : 50}% ${i % 2 ? 0 : 50}% ${i < 2 ? 50 : 0}% ${i % 2 ? 50 : 0}%)`,
      opacity: 1 - finish,
    }}><Product src={props.imageSrc} /></div>)}
    <div style={{...hero(s), transform: `translate(-50%,-50%) scale(${.92 + finish * .08})`, opacity: finish}}>
      <Product src={props.imageSrc} />
    </div>
    <Copy scene={s} light align="center" style={{position: "absolute", left: "7%", right: "7%", bottom: "5%", opacity: finish}} />
  </AbsoluteFill>;
};

export const ProductTemplateBatch14: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "rack-focus-authority": return <RackFocusAuthority {...props} />;
    case "split-diopter-hero": return <SplitDiopterHero {...props} />;
    case "product-wake": return <ProductWake {...props} />;
    case "light-transfer": return <LightTransfer {...props} />;
    case "calibration-lock": return <CalibrationLock {...props} />;
    case "color-capture": return <ColorCapture {...props} />;
    case "material-transfer": return <MaterialTransfer {...props} />;
    case "silhouette-portal": return <SilhouettePortal {...props} />;
    case "contact-exposure": return <ContactExposure {...props} />;
    case "product-sourced-end-frame": return <ProductSourcedEndFrame {...props} />;
    default: return null;
  }
};

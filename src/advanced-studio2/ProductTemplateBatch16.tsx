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
    frame, width, height, template, vertical: height / width > 1.55, compact: height / width < 1.15,
    accent: props.accent || template.accent, eyebrow: props.eyebrow || template.eyebrow,
    headline: props.headline || template.headline, subheadline: props.subheadline || template.subheadline,
    cta: props.cta || template.cta,
  };
};
type Scene = ReturnType<typeof useScene>;

const Material: React.FC<{src?: string; opacity?: number; style?: React.CSSProperties}> = ({
  src, opacity = 0.6, style,
}) => src ? <Img src={staticFile(src.replace(/^\/+/, ""))} style={{
  position: "absolute", inset: "-5%", width: "110%", height: "110%", objectFit: "cover", opacity, ...style,
}} /> : null;

const Product: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) =>
  src ? <Img src={src} style={{
    width: "100%", height: "100%", objectFit: "contain",
    filter: "drop-shadow(0 36px 48px rgba(0,0,0,.42))", ...style,
  }} /> : <div style={{
    width: "100%", height: "100%", display: "grid", placeItems: "center",
    border: "2px dashed currentColor", opacity: .3, fontWeight: 900, letterSpacing: 3, ...style,
  }}>UPLOAD PRODUCT</div>;

const Copy: React.FC<{scene: Scene; align?: "left" | "center" | "right"; style?: React.CSSProperties}> = ({
  scene, align = "left", style,
}) => <div style={{color: scene.template.foreground, textAlign: align, ...style}}>
  <div style={{color: scene.accent, fontSize: 14, fontWeight: 900, letterSpacing: 4}}>{scene.eyebrow}</div>
  <div style={{
    marginTop: 14, fontSize: scene.vertical ? 76 : scene.compact ? 54 : 66,
    fontWeight: 900, lineHeight: .91, letterSpacing: -3,
  }}>{scene.headline}</div>
  <div style={{
    maxWidth: 580, margin: align === "center" ? "19px auto 0" : align === "right" ? "19px 0 0 auto" : "19px 0 0",
    color: scene.template.muted, fontSize: 17, lineHeight: 1.4,
  }}>{scene.subheadline}</div>
  <div style={{marginTop: 20, color: scene.accent, fontWeight: 800}}>{scene.cta} →</div>
</div>;

const hero = (s: Scene): React.CSSProperties => ({
  position: "absolute", left: "50%", top: s.vertical ? "44%" : "48%",
  width: s.vertical ? "72%" : "49%", height: s.vertical ? "47%" : "65%",
});
const finishStyle = (s: Scene): React.CSSProperties => {
  const finish = move(s.frame, [220, 278], [0, 1]);
  return {
    position: "absolute", left: "7%", right: "7%", bottom: "4%",
    opacity: finish,
  };
};

const VaporChamber: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const clear = move(s.frame, [14, 220], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.48} style={{filter: "grayscale(1) brightness(.32)"}} />
    {Array.from({length: 7}).map((_, i) => <div key={i} style={{
      position: "absolute", left: `${-22 + i * 19 + clear * (i % 2 ? 18 : -18)}%`,
      top: `${6 + i * 13}%`, width: "58%", height: "25%", borderRadius: "50%",
      background: `radial-gradient(ellipse,${i % 2 ? "#d8e9ff55" : "#6f89a344"},transparent 66%)`,
      filter: `blur(${34 + i * 4}px)`, opacity: (1 - clear) * .92,
      transform: `scale(${1.25 - clear * .3})`,
    }} />)}
    <div style={{...hero(s), transform: `translate(-50%,-50%) scale(${.78 + clear * .22})`, filter: `blur(${(1 - clear) * 13}px)`}}>
      <Product src={props.imageSrc} style={{opacity: .25 + clear * .75}} />
    </div>
    <div style={{position: "absolute", left: "12%", right: "12%", top: `${74 - clear * 19}%`, height: 2,
      background: `linear-gradient(90deg,transparent,${s.accent},transparent)`, opacity: clear}} />
    <Copy scene={s} align="center" style={finishStyle(s)} />
  </AbsoluteFill>;
};

const DaybreakContinuum: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const day = move(s.frame, [10, 224], [0, 1]);
  const sunX = 8 + day * 84;
  const sunY = 70 - Math.sin(day * Math.PI) * 54;
  return <AbsoluteFill style={{background: `linear-gradient(${120 + day * 40}deg,#07101f,${day < .5 ? "#434669" : "#d88454"})`, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.35} style={{filter: `brightness(${.28 + day * .52}) sepia(${day * .35})`}} />
    <div style={{position: "absolute", left: `${sunX}%`, top: `${sunY}%`, width: 190, height: 190, borderRadius: "50%",
      transform: "translate(-50%,-50%)", background: "#ffe1a4", filter: "blur(7px)", boxShadow: "0 0 90px #ffb95b99"}} />
    <div style={{...hero(s), transform: "translate(-50%,-50%)"}}>
      <Product src={props.imageSrc} style={{filter: `brightness(${.48 + day * .52}) drop-shadow(${(50 - sunX) * .8}px 38px 42px #0008)`}} />
    </div>
    <Copy scene={s} align="center" style={finishStyle(s)} />
  </AbsoluteFill>;
};

const ImpactField: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const pressure = move(s.frame, [12, 218], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.35} style={{filter: "grayscale(1) brightness(.27)"}} />
    {Array.from({length: 8}).map((_, i) => {
      const phase = Math.max(0, Math.min(1, pressure * 1.35 - i * .07));
      return <div key={i} style={{
        position: "absolute", left: "50%", top: "48%", width: `${105 - phase * (46 + i * 3)}%`,
        aspectRatio: "1", borderRadius: "50%", transform: "translate(-50%,-50%)",
        border: `2px solid ${s.accent}`, opacity: .1 + phase * .4,
        boxShadow: `0 0 ${8 + phase * 20}px ${s.accent}33`,
      }} />;
    })}
    <div style={{...hero(s), transform: `translate(-50%,-50%) scale(${.9 + pressure * .1})`}}><Product src={props.imageSrc} /></div>
    <div style={{position: "absolute", left: "50%", top: "48%", width: `${45 + pressure * 8}%`, height: `${32 + pressure * 12}%`,
      transform: "translate(-50%,-50%)", border: `2px solid ${s.accent}`, clipPath: "polygon(10% 0,90% 0,100% 50%,90% 100%,10% 100%,0 50%)"}} />
    <Copy scene={s} align="center" style={finishStyle(s)} />
  </AbsoluteFill>;
};

const CameraObscura: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const resolve = move(s.frame, [12, 218], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.52} style={{filter: "sepia(.35) brightness(.38)"}} />
    <div style={{position: "absolute", inset: "7%", border: `1px solid ${s.accent}55`, boxShadow: "inset 0 0 120px #000c"}} />
    <div style={{...hero(s), transform: `translate(-50%,-50%) rotate(${180 * (1 - resolve)}deg) scale(${1.28 - resolve * .28})`,
      opacity: .22 + resolve * .78, filter: `blur(${(1 - resolve) * 12}px) sepia(${1 - resolve})`}}>
      <Product src={props.imageSrc} />
    </div>
    <div style={{position: "absolute", left: `${10 + resolve * 80}%`, top: "7%", bottom: "7%", width: 2,
      background: `linear-gradient(transparent,${s.accent},transparent)`, opacity: 1 - move(s.frame, [215,260],[0,1])}} />
    <Copy scene={s} align={s.vertical ? "center" : "left"} style={{...finishStyle(s), right: s.vertical ? "7%" : "55%"}} />
  </AbsoluteFill>;
};

const Weatherproof: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const calm = move(s.frame, [150, 224], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.62} style={{filter: "brightness(.31) saturate(.55)"}} />
    {Array.from({length: 42}).map((_, i) => {
      const x = (i * 37 + s.frame * 2.1) % 118 - 9;
      const distance = Math.abs(x - 50);
      const bend = distance < 22 ? (22 - distance) * (i % 2 ? 1 : -1) : 0;
      return <div key={i} style={{position: "absolute", left: `${x + bend * .35}%`, top: `${(i * 19 + s.frame * 4.4) % 118 - 12}%`,
        width: 2, height: 70, background: `linear-gradient(transparent,${s.accent}cc)`,
        transform: `rotate(${10 + bend * .9}deg)`, opacity: (1 - calm) * .75}} />;
    })}
    <div style={{...hero(s), transform: "translate(-50%,-50%)"}}><Product src={props.imageSrc} /></div>
    <div style={{position: "absolute", left: "50%", top: "49%", width: s.vertical ? "76%" : "55%", height: s.vertical ? "47%" : "69%",
      transform: "translate(-50%,-50%)", borderRadius: "50%", boxShadow: `0 0 80px 28px ${s.accent}16`, opacity: 1 - calm}} />
    <Copy scene={s} align="center" style={finishStyle(s)} />
  </AbsoluteFill>;
};

const MagneticStillness: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const order = move(s.frame, [12, 220], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.42} style={{filter: "brightness(.32) saturate(.7)"}} />
    {Array.from({length: 56}).map((_, i) => {
      const angle = i * 2.399 + s.frame * .009 * (1 - order);
      const radius = (80 + (i % 9) * 42) * (1 - order * .38);
      return <div key={i} style={{position: "absolute", left: `calc(50% + ${Math.cos(angle) * radius}px)`,
        top: `calc(48% + ${Math.sin(angle) * radius * .72}px)`, width: 3 + (i % 3), height: 18 + (i % 5) * 5,
        borderRadius: 4, background: s.accent, opacity: .18 + order * .46,
        transform: `translate(-50%,-50%) rotate(${angle * 57.3 + 90}deg)`}} />;
    })}
    <div style={{...hero(s), transform: `translate(-50%,-50%) scale(${.8 + order * .2})`}}><Product src={props.imageSrc} /></div>
    <Copy scene={s} align="center" style={finishStyle(s)} />
  </AbsoluteFill>;
};

const ShadowDial: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const time = move(s.frame, [10, 224], [0, 1]);
  const angle = -72 + time * 144;
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.66} style={{filter: `brightness(${.42 + Math.sin(time * Math.PI) * .3}) sepia(.28)`}} />
    <div style={{position: "absolute", left: "50%", top: "50%", width: s.vertical ? "31%" : "22%", height: "62%",
      transformOrigin: "50% 0", transform: `rotate(${angle}deg)`, background: "linear-gradient(#000a,transparent)",
      filter: "blur(16px)", opacity: .7}} />
    <div style={{position: "absolute", left: `${12 + time * 76}%`, top: "10%", width: 150, height: 150, borderRadius: "50%",
      transform: "translateX(-50%)", background: "#ffe2a6", boxShadow: "0 0 75px #ffb05299"}} />
    <div style={{...hero(s), transform: "translate(-50%,-50%)"}}><Product src={props.imageSrc} /></div>
    <Copy scene={s} align={s.vertical ? "center" : "left"} style={{...finishStyle(s), right: s.vertical ? "7%" : "56%"}} />
  </AbsoluteFill>;
};

const SonicAperture: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const open = move(s.frame, [12, 222], [0, 1]);
  const pulse = .5 + Math.sin(s.frame * .16) * .5;
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.28} style={{filter: "brightness(.25)"}} />
    {Array.from({length: 10}).map((_, i) => <div key={i} style={{
      position: "absolute", left: "50%", top: "48%", width: `${10 + i * 8 + open * (i * 2.2)}%`,
      aspectRatio: "1", transform: `translate(-50%,-50%) rotate(${i * 9 + open * 20}deg)`,
      border: `${1 + (i % 3)}px solid ${s.accent}`, borderRadius: `${42 + i * 2}%`,
      opacity: .08 + pulse * .08 + open * .14,
    }} />)}
    <div style={{...hero(s), transform: `translate(-50%,-50%) scale(${.55 + open * .45})`, opacity: .2 + open * .8}}>
      <Product src={props.imageSrc} />
    </div>
    <Copy scene={s} align="center" style={finishStyle(s)} />
  </AbsoluteFill>;
};

const GlassMemory: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const trace = move(s.frame, [12, 222], [-18, 118]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.48} style={{filter: "brightness(.36) saturate(.45)"}} />
    <div style={{...hero(s), transform: "translate(-50%,-50%)"}}><Product src={props.imageSrc} /></div>
    <div style={{position: "absolute", inset: 0, backdropFilter: "blur(24px) saturate(.3)",
      clipPath: `polygon(${Math.max(0, trace - 22)}% 0,100% 0,100% 100%,${Math.max(0, trace - 32)}% 100%,${trace}% 50%)`,
      background: "linear-gradient(110deg,#bdeaff25,#fff2)", borderLeft: `2px solid ${s.accent}99`}} />
    <div style={{position: "absolute", left: `${trace}%`, top: "6%", bottom: "6%", width: 2,
      background: s.accent, boxShadow: `0 0 28px ${s.accent}`}} />
    <Copy scene={s} align={s.vertical ? "center" : "left"} style={{...finishStyle(s), right: s.vertical ? "7%" : "56%"}} />
  </AbsoluteFill>;
};

const HorizonFold: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const fold = move(s.frame, [12, 222], [0, 1]);
  return <AbsoluteFill style={{background: s.template.background, overflow: "hidden", perspective: 1000}}>
    <Material src={props.polyHavenTexture?.localSrc} opacity={.26} style={{filter: "brightness(.28)"}} />
    <div style={{position: "absolute", left: "-5%", right: "-5%", top: `${64 - fold * 28}%`, height: "72%",
      transformOrigin: "50% 0", transform: `rotateX(${68 - fold * 68}deg)`,
      background: s.template.surface, overflow: "hidden", borderTop: `2px solid ${s.accent}`}}>
      <Material src={props.polyHavenTexture?.localSrc} opacity={.88} style={{filter: `brightness(${.52 + fold * .2})`}} />
    </div>
    <div style={{position: "absolute", left: "8%", right: "8%", top: `${64 - fold * 28}%`, height: 2,
      background: `linear-gradient(90deg,transparent,${s.accent},transparent)`, boxShadow: `0 0 24px ${s.accent}`}} />
    <div style={{...hero(s), transform: `translate(-50%,-50%) translateY(${(1 - fold) * 75}px) scale(${.82 + fold * .18})`}}>
      <Product src={props.imageSrc} />
    </div>
    <Copy scene={s} align="center" style={finishStyle(s)} />
  </AbsoluteFill>;
};

export const ProductTemplateBatch16: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "vapor-chamber": return <VaporChamber {...props} />;
    case "daybreak-continuum": return <DaybreakContinuum {...props} />;
    case "impact-field": return <ImpactField {...props} />;
    case "camera-obscura": return <CameraObscura {...props} />;
    case "weatherproof": return <Weatherproof {...props} />;
    case "magnetic-stillness": return <MagneticStillness {...props} />;
    case "shadow-dial": return <ShadowDial {...props} />;
    case "sonic-aperture": return <SonicAperture {...props} />;
    case "glass-memory": return <GlassMemory {...props} />;
    case "horizon-fold": return <HorizonFold {...props} />;
    default: return null;
  }
};

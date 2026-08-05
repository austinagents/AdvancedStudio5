import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {ProductVideoProps} from "./ProductVideo";
import {getProductTemplate} from "./product-templates";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const range = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, clamp);

const ProductCutout: React.FC<{
  src: string;
  color: string;
  fit?: "contain" | "cover";
  position?: string;
  style?: React.CSSProperties;
}> = ({src, color, fit = "contain", position = "center", style}) =>
  src ? (
    <Img
      src={src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: fit,
        objectPosition: position,
        ...style,
      }}
    />
  ) : (
    <div
      style={{
        width: "72%",
        height: "68%",
        border: `2px dashed ${color}`,
        display: "grid",
        placeItems: "center",
        color,
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: 3,
        ...style,
      }}
    >
      UPLOAD PRODUCT
    </div>
  );

const useBatch3 = (props: ProductVideoProps) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const template = getProductTemplate(props.templateId);
  return {
    frame,
    ...config,
    template,
    accent: props.accent || template.accent,
    eyebrow: props.eyebrow || template.eyebrow,
    headline: props.headline || template.headline,
    subheadline: props.subheadline || template.subheadline,
    cta: props.cta || template.cta,
    productName: props.productName || "Your Product",
    vertical: config.height / config.width > 1.55,
    compact: config.height / config.width < 1.15,
  };
};

const PrismChamber: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const product = spring({
    fps: v.fps,
    frame: v.frame - 18,
    config: {damping: 20, stiffness: 75},
  });
  const resolve = range(v.frame, [170, 214], [0, 1]);
  const planes = [
    {color: "#694dff66", rotate: -24, x: -24, delay: 0},
    {color: `${v.accent}55`, rotate: 17, x: 18, delay: 12},
    {color: "#ff4fb955", rotate: 42, x: 4, delay: 24},
  ];
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 48%,${v.template.surface},transparent 55%)`}} />
      {planes.map((plane, index) => {
        const enter = spring({fps: v.fps, frame: v.frame - plane.delay, config: {damping: 18, stiffness: 70}});
        return (
          <div
            key={plane.color}
            style={{
              position: "absolute",
              left: `${32 + plane.x}%`,
              top: "-18%",
              width: "38%",
              height: "138%",
              background: `linear-gradient(110deg,transparent,${plane.color},transparent)`,
              clipPath: "polygon(45% 0,100% 35%,62% 100%,0 62%)",
              mixBlendMode: "screen",
              opacity: enter * (1 - resolve * 0.55),
              transform: `rotate(${plane.rotate + v.frame * (index % 2 ? -0.035 : 0.03)}deg) scale(${0.75 + enter * 0.25})`,
              filter: "blur(1px)",
            }}
          />
        );
      })}
      <div style={{
        position: "absolute", left: "50%", top: v.vertical ? "23%" : "12%",
        width: v.vertical ? "80%" : "58%", height: v.vertical ? "56%" : "74%",
        transform: `translateX(-50%) scale(${0.82 + product * 0.18 + resolve * 0.05})`,
        opacity: product,
        filter: `drop-shadow(0 0 55px ${v.accent}44)`,
      }}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", fontSize: 17, fontWeight: 800, letterSpacing: 4, color: v.accent}}>{v.eyebrow}</div>
      <div style={{
        position: "absolute", left: "6%", right: "6%", bottom: "5%",
        display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1.4fr 1fr",
        alignItems: "end", gap: 24, opacity: resolve,
      }}>
        <div style={{fontSize: v.vertical ? 78 : 68, lineHeight: .88, fontWeight: 800, letterSpacing: -3}}>{v.headline}</div>
        <div><div style={{fontSize: 20, lineHeight: 1.4, color: v.template.muted}}>{v.subheadline}</div><strong style={{display: "block", marginTop: 14, color: v.accent}}>{v.cta} →</strong></div>
      </div>
      <div style={{position: "absolute", inset: "3%", border: `1px solid ${v.accent}33`, clipPath: "polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)"}} />
    </AbsoluteFill>
  );
};

const MaterialStudy: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const finish = range(v.frame, [152, 202], [0, 1]);
  const crops = ["left", "center", "right", "center"];
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", left: "5%", right: "5%", top: "5%", display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${v.template.foreground}`, paddingBottom: 14, fontSize: 16, fontWeight: 800, letterSpacing: 3}}>
        <span>{v.eyebrow}</span><span>STUDY 03 / 10</span>
      </div>
      <div style={{
        position: "absolute", inset: v.vertical ? "13% 5% 19%" : "13% 5% 14%",
        display: "grid", gridTemplateColumns: v.vertical ? "repeat(2,1fr)" : "repeat(4,1fr)",
        gridTemplateRows: v.vertical ? "repeat(2,1fr)" : "1fr", gap: 10, opacity: 1 - finish,
      }}>
        {crops.map((position, index) => {
          const enter = spring({fps: v.fps, frame: v.frame - index * 11, config: {damping: 18, stiffness: 100}});
          return (
            <div key={`${position}-${index}`} style={{overflow: "hidden", background: index % 2 ? v.template.surface : v.accent, transform: `translateY(${(1 - enter) * (index % 2 ? -120 : 120)}px)`}}>
              <ProductCutout src={props.imageSrc} color={v.accent} fit="cover" position={position} style={{transform: `scale(${1.35 + index * .12})`}} />
              <span style={{position: "absolute", margin: 14, padding: "6px 9px", background: v.template.surface, fontWeight: 800, fontSize: 13}}>0{index + 1}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: "absolute", left: v.vertical ? "11%" : "18%", right: v.vertical ? "11%" : "18%", top: v.vertical ? "18%" : "11%", bottom: v.vertical ? "23%" : "12%", opacity: finish, transform: `scale(${.92 + finish * .08})`}}>
        <ProductCutout src={props.imageSrc} color={v.accent} style={{filter: "drop-shadow(0 38px 42px rgba(35,25,18,.22))"}} />
      </div>
      <div style={{position: "absolute", left: "5%", right: "5%", bottom: "5%", display: "flex", justifyContent: "space-between", alignItems: "end", gap: 30}}>
        <div><div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 62 : 52, lineHeight: .95}}>{v.headline}</div><div style={{fontSize: 18, color: v.template.muted, marginTop: 10}}>{v.subheadline}</div></div>
        <strong style={{color: v.accent, whiteSpace: "nowrap"}}>{v.cta} →</strong>
      </div>
    </AbsoluteFill>
  );
};

const PerformanceTunnel: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const speed = range(v.frame, [0, 155], [0, 1]);
  const product = spring({fps: v.fps, frame: v.frame - 36, config: {damping: 17, stiffness: 105}});
  const finish = range(v.frame, [170, 210], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden", perspective: 900}}>
      {Array.from({length: 12}).map((_, index) => {
        const phase = (index * 24 + v.frame * (1.5 + speed * 2.5)) % 290;
        const scale = .08 + phase / 70;
        return <div key={index} style={{position: "absolute", left: "50%", top: "50%", width: "24%", aspectRatio: 1, border: `2px solid ${v.accent}${index % 3 === 0 ? "aa" : "44"}`, transform: `translate(-50%,-50%) scale(${scale}) rotate(${index % 2 ? 45 : 0}deg)`, opacity: Math.min(1, phase / 55)}} />;
      })}
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(90deg,#030705 0,transparent 25%,transparent 75%,#030705 100%)"}} />
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "24%" : "12%", width: v.vertical ? "82%" : "58%", height: v.vertical ? "54%" : "74%", transform: `translateX(-50%) scale(${product})`, filter: `drop-shadow(0 0 38px ${v.accent}55)`}}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", color: v.accent, fontSize: 16, fontWeight: 900, letterSpacing: 3}}>{v.eyebrow}</div>
      <div style={{position: "absolute", right: "5%", top: "5%", textAlign: "right", fontFamily: "monospace", color: v.accent}}>
        <strong style={{fontSize: 34}}>{Math.round(speed * 100).toString().padStart(3, "0")}</strong><div>VELOCITY INDEX</div>
      </div>
      <div style={{position: "absolute", inset: 0, padding: "6%", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: `rgba(3,7,5,${finish * .88})`, opacity: finish}}>
        <div style={{fontSize: v.vertical ? 88 : 76, fontWeight: 950, lineHeight: .88, maxWidth: 800}}>{v.headline}</div>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, marginTop: 22}}>
          <span style={{fontSize: 21, color: v.template.muted}}>{v.subheadline}</span>
          <strong style={{padding: "15px 20px", background: v.accent, color: "#081008", whiteSpace: "nowrap"}}>{v.cta} →</strong>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LuxuryCatalogue: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const turn = range(v.frame, [62, 106], [0, 1]);
  const final = range(v.frame, [166, 212], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden", perspective: 1400}}>
      <div style={{position: "absolute", inset: "4%", background: v.template.surface, boxShadow: "0 24px 65px rgba(40,30,20,.14)"}} />
      <div style={{position: "absolute", inset: "4%", display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1fr 1fr", overflow: "hidden"}}>
        <div style={{padding: "7%", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: v.vertical ? "none" : `1px solid ${v.template.foreground}33`}}>
          <div><div style={{fontSize: 15, fontWeight: 800, letterSpacing: 4, color: v.accent}}>{v.eyebrow}</div><div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 74 : 66, lineHeight: .92, marginTop: 28}}>{v.headline}</div></div>
          <div><div style={{fontSize: 120, lineHeight: .75, color: `${v.accent}33`, fontFamily: "Georgia,serif"}}>21</div><div style={{fontSize: 18, color: v.template.muted, maxWidth: 420}}>{v.subheadline}</div></div>
        </div>
        <div style={{position: "relative", minHeight: 0, padding: v.vertical ? "20% 7% 7%" : "7%"}}>
          <ProductCutout src={props.imageSrc} color={v.accent} />
        </div>
      </div>
      <div style={{position: "absolute", inset: "4%", background: v.accent, transformOrigin: "right", transform: `rotateY(${-180 * turn}deg)`, backfaceVisibility: "hidden", display: "grid", placeItems: "center", color: "#fff", fontFamily: "Georgia,serif", fontSize: v.vertical ? 100 : 90}}>THE<br/>EDITION</div>
      <div style={{position: "absolute", inset: "4%", background: v.template.foreground, color: v.template.surface, transform: `translateY(${(1 - final) * 110}%)`, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1fr .8fr", padding: "7%", gap: 24}}>
        <div style={{minHeight: 0}}><ProductCutout src={props.imageSrc} color={v.accent} /></div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}><div style={{color: v.accent, fontWeight: 900, letterSpacing: 3}}>{v.productName}</div><div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 64 : 54, lineHeight: .95, marginTop: 16}}>{v.headline}</div><strong style={{marginTop: 28, color: v.accent}}>{v.cta} →</strong></div>
      </div>
    </AbsoluteFill>
  );
};

const ColorLaboratory: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const palette = [v.template.background, v.template.surface, v.accent, "#39e6ae"];
  const phase = Math.min(3, Math.floor(v.frame / 44));
  const finish = range(v.frame, [174, 214], [0, 1]);
  return (
    <AbsoluteFill style={{background: palette[phase], color: v.template.foreground, overflow: "hidden"}}>
      {palette.map((color, index) => {
        const reveal = range(v.frame, [index * 44 - 8, index * 44 + 24], [0, 1]);
        return <div key={color} style={{position: "absolute", left: `${index * 25 - 12}%`, top: `${index % 2 ? -18 : 48}%`, width: "65%", aspectRatio: 1, borderRadius: "50%", background: color, transform: `scale(${reveal})`, mixBlendMode: "multiply", opacity: .86}} />;
      })}
      <div style={{position: "absolute", inset: 0, opacity: .18, backgroundImage: "radial-gradient(#111 1px,transparent 1px)", backgroundSize: "24px 24px"}} />
      <div style={{position: "absolute", left: "5%", top: "5%", padding: "10px 14px", background: v.template.foreground, color: "#fff", fontWeight: 900, letterSpacing: 3}}>{v.eyebrow}</div>
      <div style={{position: "absolute", right: "5%", top: "5%", fontSize: 18, fontWeight: 900}}>FORMULA 0{phase + 1}</div>
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "21%" : "11%", width: v.vertical ? "84%" : "60%", height: v.vertical ? "57%" : "76%", transform: `translateX(-50%) rotate(${Math.sin(v.frame / 24) * 2}deg)`, filter: "drop-shadow(24px 30px 0 rgba(20,15,20,.18))"}}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", inset: 0, background: v.template.surface, color: "#fff", clipPath: `inset(${(1 - finish) * 100}% 0 0 0)`, padding: "7%", display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
        <div style={{position: "absolute", left: "50%", top: v.vertical ? "10%" : "7%", width: v.vertical ? "70%" : "46%", height: v.vertical ? "58%" : "68%", transform: "translateX(-50%)", filter: "drop-shadow(20px 24px 0 rgba(0,0,0,.16))"}}>
          <ProductCutout src={props.imageSrc} color={v.accent} />
        </div>
        <div style={{fontSize: v.vertical ? 94 : 82, fontWeight: 950, lineHeight: .84, maxWidth: 820}}>{v.headline}</div>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, marginTop: 24}}><span style={{fontSize: 20, maxWidth: 600}}>{v.subheadline}</span><strong style={{padding: "14px 20px", background: v.accent, color: "#111"}}>{v.cta} →</strong></div>
      </div>
    </AbsoluteFill>
  );
};

const UnboxingCeremony: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const open = range(v.frame, [22, 112], [0, 1]);
  const product = spring({fps: v.fps, frame: v.frame - 90, config: {damping: 20, stiffness: 82}});
  const copy = range(v.frame, [166, 210], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden", perspective: 1200}}>
      <div style={{position: "absolute", inset: "5%", border: `1px solid ${v.accent}66`, background: `radial-gradient(circle,${v.template.surface},${v.template.background} 68%)`}} />
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "24%" : "13%", width: v.vertical ? "76%" : "52%", height: v.vertical ? "52%" : "70%", transform: `translateX(-50%) scale(${product})`, filter: "drop-shadow(0 48px 50px rgba(0,0,0,.45))"}}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: 0, top: 0, width: "50.2%", height: "100%", background: v.template.surface, transformOrigin: "left", transform: `rotateY(${-105 * open}deg)`, borderRight: `1px solid ${v.accent}`}} />
      <div style={{position: "absolute", right: 0, top: 0, width: "50.2%", height: "100%", background: v.template.surface, transformOrigin: "right", transform: `rotateY(${105 * open}deg)`, borderLeft: `1px solid ${v.accent}`}} />
      <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", opacity: 1 - open}}>
        <div style={{width: 150, aspectRatio: 1, border: `1px solid ${v.accent}`, transform: "rotate(45deg)", display: "grid", placeItems: "center"}}><span style={{transform: "rotate(-45deg)", color: v.accent, fontSize: 44}}>FP</span></div>
      </div>
      <div style={{position: "absolute", top: "6%", left: "6%", color: v.accent, fontWeight: 900, letterSpacing: 4, opacity: open}}>{v.eyebrow}</div>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "6%", opacity: copy, display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24}}>
        <div><div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 72 : 62, lineHeight: .92}}>{v.headline}</div><div style={{fontSize: 19, color: v.template.muted, marginTop: 12}}>{v.subheadline}</div></div>
        <strong style={{color: v.accent, whiteSpace: "nowrap"}}>{v.cta} →</strong>
      </div>
    </AbsoluteFill>
  );
};

const FeatureOrbit: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const product = spring({fps: v.fps, frame: v.frame - 14, config: {damping: 21, stiffness: 80}});
  const finish = range(v.frame, [178, 215], [0, 1]);
  const labels = ["01 POWER", "02 CONTROL", "03 MATERIAL", "04 INTELLIGENCE"];
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", left: "50%", top: "50%", width: v.vertical ? "82%" : "62%", aspectRatio: 1, borderRadius: "50%", border: `1px solid ${v.accent}55`, transform: "translate(-50%,-50%)"}} />
      <div style={{position: "absolute", left: "50%", top: "50%", width: v.vertical ? "58%" : "43%", aspectRatio: 1, borderRadius: "50%", border: `1px dashed ${v.accent}55`, transform: `translate(-50%,-50%) rotate(${v.frame * .3}deg)`}} />
      {labels.map((label, index) => {
        const angle = index * Math.PI / 2 + v.frame * .008;
        const radiusX = v.vertical ? 35 : 39;
        const radiusY = v.vertical ? 28 : 34;
        const appear = spring({fps: v.fps, frame: v.frame - 35 - index * 12, config: {damping: 18, stiffness: 90}});
        return <div key={label} style={{position: "absolute", left: `${50 + Math.cos(angle) * radiusX}%`, top: `${50 + Math.sin(angle) * radiusY}%`, transform: `translate(-50%,-50%) scale(${appear})`, padding: "10px 14px", border: `1px solid ${v.accent}`, background: `${v.template.surface}ee`, color: v.accent, fontFamily: "monospace", fontWeight: 800, whiteSpace: "nowrap"}}>{label}</div>;
      })}
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "25%" : "15%", width: v.vertical ? "70%" : "48%", height: v.vertical ? "50%" : "70%", transform: `translateX(-50%) scale(${product})`, filter: `drop-shadow(0 0 45px ${v.accent}33)`}}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</div>
      <div style={{position: "absolute", inset: 0, padding: "7%", background: `rgba(7,16,31,${finish * .42})`, opacity: finish, display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
        <div style={{fontSize: v.vertical ? 86 : 72, fontWeight: 900, lineHeight: .88}}>{v.headline}</div>
        <div style={{display: "flex", justifyContent: "space-between", gap: 24, alignItems: "end", marginTop: 22}}><span style={{color: v.template.muted, fontSize: 20}}>{v.subheadline}</span><strong style={{color: v.accent}}>{v.cta} →</strong></div>
      </div>
    </AbsoluteFill>
  );
};

const CinematicScale: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const pullback = range(v.frame, [0, 158], [2.8, 1]);
  const final = range(v.frame, [172, 214], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 58%,${v.accent}22,transparent 48%)`}} />
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "23%" : "9%", width: v.vertical ? "88%" : "68%", height: v.vertical ? "59%" : "80%", transform: `translateX(-50%) scale(${pullback})`, transformOrigin: "54% 46%", filter: "drop-shadow(0 60px 75px rgba(0,0,0,.55))"}}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", fontWeight: 900, letterSpacing: 4, color: v.accent}}>{v.eyebrow}</div>
      <div style={{position: "absolute", right: "5%", top: "5%", fontFamily: "monospace", color: v.template.muted}}>SCALE / {pullback.toFixed(2)}X</div>
      <div style={{position: "absolute", inset: 0, opacity: final, background: "linear-gradient(transparent 35%,rgba(7,7,7,.96) 82%)", padding: "7%", display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
        <div style={{fontSize: v.vertical ? 104 : 94, fontWeight: 950, lineHeight: .8, letterSpacing: -5, maxWidth: 900}}>{v.headline}</div>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, marginTop: 24}}><span style={{fontSize: 21, color: v.template.muted}}>{v.subheadline}</span><strong style={{padding: "15px 21px", border: `1px solid ${v.accent}`, color: v.accent, whiteSpace: "nowrap"}}>{v.cta} →</strong></div>
      </div>
      <div style={{position: "absolute", left: "3%", right: "3%", top: "50%", height: 1, background: `${v.accent}33`}} />
    </AbsoluteFill>
  );
};

const RetailWindow: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const open = range(v.frame, [12, 78], [0, 1]);
  const rise = spring({fps: v.fps, frame: v.frame - 62, config: {damping: 21, stiffness: 76}});
  const close = range(v.frame, [170, 212], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden", perspective: 1200}}>
      <div style={{position: "absolute", inset: "5%", background: v.template.surface, border: `10px solid ${v.template.foreground}`, boxShadow: "inset 0 0 80px rgba(20,50,45,.13)"}} />
      <div style={{position: "absolute", left: "13%", right: "13%", bottom: v.vertical ? "17%" : "10%", height: "27%", background: v.accent, clipPath: "polygon(12% 0,88% 0,100% 100%,0 100%)", transform: `rotateX(${70 - open * 20}deg)`}} />
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "23%" : "11%", width: v.vertical ? "74%" : "52%", height: v.vertical ? "55%" : "72%", transform: `translate(-50%,${(1 - rise) * 120}px) scale(${.9 + rise * .1})`, opacity: rise, filter: "drop-shadow(0 45px 38px rgba(20,50,45,.22))"}}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: "5%", top: 0, width: "46%", height: "100%", background: `${v.template.foreground}ee`, transform: `translateX(${-102 * open}%)`}} />
      <div style={{position: "absolute", right: "5%", top: 0, width: "46%", height: "100%", background: `${v.template.foreground}ee`, transform: `translateX(${102 * open}%)`}} />
      <div style={{position: "absolute", left: "7%", top: "7%", fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</div>
      <div style={{position: "absolute", inset: 0, padding: "7%", background: `rgba(22,50,47,${close * .42})`, color: "#fff", opacity: close, display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
        <div style={{fontSize: v.vertical ? 100 : 88, fontWeight: 950, lineHeight: .82}}>{v.headline}</div>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, marginTop: 25}}><span style={{fontSize: 21, color: "#d6e7e1"}}>{v.subheadline}</span><strong style={{background: v.accent, padding: "15px 21px", whiteSpace: "nowrap"}}>{v.cta} →</strong></div>
      </div>
    </AbsoluteFill>
  );
};

const CampaignFinale: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch3(props);
  const beats = Math.min(5, Math.floor(v.frame / 30));
  const finish = range(v.frame, [165, 205], [0, 1]);
  const colors = [v.template.background, v.accent, v.template.surface, "#4257ff", "#f1c945", v.template.background];
  const positions = [
    {x: -16, y: 8, r: -8},
    {x: 18, y: -8, r: 6},
    {x: -8, y: -4, r: 2},
    {x: 12, y: 7, r: -3},
    {x: 0, y: 0, r: 0},
    {x: 0, y: 0, r: 0},
  ];
  return (
    <AbsoluteFill style={{background: colors[beats], color: beats === 2 ? "#111" : "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, fontSize: v.vertical ? 190 : 220, lineHeight: .72, fontWeight: 950, opacity: .2, transform: `translate(${positions[beats].x * -1}px,${positions[beats].y * -1}px)`}}>
        {beats % 2 ? "NOW\nNOW\nNOW" : "THE\nONE\nOBJECT"}
      </div>
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "22%" : "9%", width: v.vertical ? "86%" : "64%", height: v.vertical ? "58%" : "80%", transform: `translate(calc(-50% + ${positions[beats].x}px),${positions[beats].y}px) rotate(${positions[beats].r}deg) scale(${1 + (v.frame % 30) / 240})`, filter: "drop-shadow(20px 30px 0 rgba(0,0,0,.2))"}}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: "4%", top: "4%", padding: "9px 13px", background: "#fff", color: "#111", fontWeight: 950, letterSpacing: 3}}>{v.eyebrow}</div>
      <div style={{position: "absolute", inset: 0, background: v.template.background, opacity: finish, padding: "7%", display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1fr .75fr", alignItems: "center", gap: 30}}>
        <div style={{height: v.vertical ? "57%" : "76%", minHeight: 0}}><ProductCutout src={props.imageSrc} color={v.accent} style={{filter: `drop-shadow(0 35px 55px ${v.accent}22)`}} /></div>
        <div><div style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.productName}</div><div style={{fontSize: v.vertical ? 82 : 70, fontWeight: 950, lineHeight: .84, marginTop: 18}}>{v.headline}</div><div style={{fontSize: 20, lineHeight: 1.4, color: v.template.muted, marginTop: 20}}>{v.subheadline}</div><strong style={{display: "inline-block", marginTop: 24, background: v.accent, padding: "15px 20px"}}>{v.cta} →</strong></div>
      </div>
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch3: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "prism": return <PrismChamber {...props} />;
    case "material-study": return <MaterialStudy {...props} />;
    case "performance-tunnel": return <PerformanceTunnel {...props} />;
    case "luxury-catalogue": return <LuxuryCatalogue {...props} />;
    case "color-lab": return <ColorLaboratory {...props} />;
    case "unboxing": return <UnboxingCeremony {...props} />;
    case "feature-orbit": return <FeatureOrbit {...props} />;
    case "cinematic-scale": return <CinematicScale {...props} />;
    case "retail-window": return <RetailWindow {...props} />;
    case "campaign-finale": return <CampaignFinale {...props} />;
    default: return null;
  }
};

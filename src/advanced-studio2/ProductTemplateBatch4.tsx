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

const useBatch4 = (props: ProductVideoProps) => {
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
  };
};

const ShadowSignature: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const reveal = range(v.frame, [58, 148], [0, 1]);
  const resolve = range(v.frame, [174, 216], [0, 1]);
  const light = range(v.frame, [22, 148], [-30, 130]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, background: `linear-gradient(105deg,transparent ${light - 18}%,${v.accent}22 ${light}%,transparent ${light + 16}%)`}} />
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "20%" : "7%", width: v.vertical ? "92%" : "70%", height: v.vertical ? "64%" : "84%", transform: `translateX(-50%) scale(${1.45 - reveal * .45})`}}>
        <ProductCutout src={props.imageSrc} color={v.accent} style={{filter: `brightness(${reveal}) grayscale(${1 - reveal}) contrast(${1.8 - reveal * .8}) drop-shadow(0 50px 45px rgba(0,0,0,.55))`}} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", fontSize: 16, fontWeight: 900, letterSpacing: 5}}>{v.eyebrow}</div>
      <div style={{position: "absolute", inset: 0, padding: "7%", opacity: resolve, background: "linear-gradient(transparent 62%,rgba(5,5,5,.96) 90%)", display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
        <div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 82 : 72, lineHeight: .9, maxWidth: 850}}>{v.headline}</div>
        <div style={{marginTop: 22, display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24}}><span style={{fontSize: 20, color: v.template.muted}}>{v.subheadline}</span><strong style={{borderBottom: `2px solid ${v.accent}`, paddingBottom: 8, whiteSpace: "nowrap"}}>{v.cta} →</strong></div>
      </div>
    </AbsoluteFill>
  );
};

const ProductChorus: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const resolve = range(v.frame, [160, 205], [0, 1]);
  const count = v.vertical ? 12 : 15;
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, display: "grid", gridTemplateColumns: v.vertical ? "repeat(3,1fr)" : "repeat(5,1fr)", gridTemplateRows: v.vertical ? "repeat(4,1fr)" : "repeat(3,1fr)", gap: 8, padding: 8, opacity: 1 - resolve}}>
        {Array.from({length: count}).map((_, index) => {
          const enter = spring({fps: v.fps, frame: v.frame - index * 4, config: {damping: 14, stiffness: 145}});
          const phase = Math.sin(v.frame / 11 + index) * 10;
          return <div key={index} style={{background: index % 3 === 0 ? v.template.surface : index % 3 === 1 ? v.accent : "#f5efe4", overflow: "hidden", transform: `translateY(${phase}px) scale(${enter})`, display: "grid", placeItems: "center"}}><ProductCutout src={props.imageSrc} color={v.template.foreground} style={{width: "82%", height: "82%", transform: `rotate(${index % 2 ? 5 : -5}deg)`}} /></div>;
        })}
      </div>
      <div style={{position: "absolute", inset: 0, transform: `scale(${resolve})`, background: v.template.surface, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1fr .8fr", padding: "7%", gap: 30}}>
        <div style={{minHeight: 0}}><ProductCutout src={props.imageSrc} color={v.accent} style={{filter: "drop-shadow(25px 30px 0 rgba(0,0,0,.2))"}} /></div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", color: "#fff"}}><div style={{fontWeight: 900, letterSpacing: 4, color: v.accent}}>{v.eyebrow}</div><div style={{fontSize: v.vertical ? 86 : 72, fontWeight: 950, lineHeight: .84, marginTop: 18}}>{v.headline}</div><div style={{fontSize: 20, marginTop: 20}}>{v.subheadline}</div><strong style={{marginTop: 24, color: v.accent}}>{v.cta} →</strong></div>
      </div>
    </AbsoluteFill>
  );
};

const RunwayTrack: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const track = range(v.frame, [0, 165], [68, -32]);
  const final = range(v.frame, [172, 214], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", left: 0, right: 0, top: "51%", height: 2, background: v.template.foreground}} />
      <div style={{position: "absolute", left: `${track}%`, top: v.vertical ? "20%" : "8%", width: v.vertical ? "72%" : "47%", height: v.vertical ? "62%" : "82%", transform: "translateX(-50%)", filter: "drop-shadow(30px 34px 0 rgba(0,0,0,.14))"}}><ProductCutout src={props.imageSrc} color={v.accent} /></div>
      {["ARRIVAL", "FORM", "MOTION", "01"].map((word, index) => <div key={word} style={{position: "absolute", left: `${12 + index * 27}%`, top: index % 2 ? "57%" : "39%", fontSize: v.vertical ? 38 : 44, fontWeight: 950, color: index === 3 ? v.accent : v.template.foreground, transform: `translateX(${track * -2}px)`, whiteSpace: "nowrap"}}>{word}</div>)}
      <div style={{position: "absolute", left: "5%", top: "5%", fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</div>
      <div style={{position: "absolute", inset: 0, padding: "7%", background: v.template.surface, color: "#fff", clipPath: `inset(0 0 0 ${(1 - final) * 100}%)`, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : ".8fr 1fr", gap: 25}}>
        <div style={{minHeight: 0}}><ProductCutout src={props.imageSrc} color={v.accent} /></div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "5%"}}><div style={{color: v.accent, fontWeight: 900, letterSpacing: 3}}>{v.productName}</div><div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 76 : 64, lineHeight: .9, marginTop: 16}}>{v.headline}</div><div style={{fontSize: 20, color: "#bbb", marginTop: 18}}>{v.subheadline}</div><strong style={{marginTop: 22, color: v.accent}}>{v.cta} →</strong></div>
      </div>
    </AbsoluteFill>
  );
};

const BroadcastPerformance: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const replay = Math.floor(v.frame / 32) % 3;
  const score = range(v.frame, [0, 155], [0, 100]);
  const final = range(v.frame, [174, 214], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, opacity: .2, backgroundImage: `linear-gradient(${v.accent}55 1px,transparent 1px),linear-gradient(90deg,${v.accent}55 1px,transparent 1px)`, backgroundSize: `${v.width / 12}px ${v.width / 12}px`}} />
      <div style={{position: "absolute", left: "5%", right: "5%", top: "5%", display: "flex", justifyContent: "space-between", alignItems: "center"}}><strong style={{background: v.accent, color: "#071c32", padding: "10px 14px"}}>LIVE</strong><span style={{fontFamily: "monospace", fontWeight: 900}}>PERFORMANCE INDEX {Math.round(score).toString().padStart(3, "0")}</span></div>
      <div style={{position: "absolute", left: replay === 0 ? "48%" : replay === 1 ? "57%" : "42%", top: v.vertical ? "22%" : "9%", width: v.vertical ? "84%" : "62%", height: v.vertical ? "58%" : "80%", transform: `translateX(-50%) scale(${replay === 1 ? 1.18 : .95})`, clipPath: replay === 2 ? "inset(0 18% 0 18%)" : "none"}}><ProductCutout src={props.imageSrc} color={v.accent} /></div>
      <div style={{position: "absolute", left: "5%", bottom: "6%", right: "5%", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, opacity: 1 - final}}>{["POWER","CONTROL","ENDURANCE"].map((label,index) => <div key={label} style={{background: index === 0 ? v.accent : v.template.surface, color: index === 0 ? "#071c32" : "#fff", padding: "14px", fontWeight: 900}}>{label}<strong style={{float: "right"}}>{98 - index * 3}</strong></div>)}</div>
      <div style={{position: "absolute", inset: 0, padding: "7%", background: "linear-gradient(transparent 52%,rgba(6,28,50,.98) 82%)", opacity: final, display: "flex", flexDirection: "column", justifyContent: "flex-end"}}><div style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</div><div style={{fontSize: v.vertical ? 88 : 74, fontWeight: 950, lineHeight: .85, marginTop: 16}}>{v.headline}</div><div style={{display: "flex", justifyContent: "space-between", gap: 24, alignItems: "end", marginTop: 22}}><span style={{fontSize: 20, color: v.template.muted}}>{v.subheadline}</span><strong style={{background: v.accent, color: "#071c32", padding: "15px 20px", whiteSpace: "nowrap"}}>{v.cta} →</strong></div></div>
    </AbsoluteFill>
  );
};

const ObjectPassport: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const stamp = spring({fps: v.fps, frame: v.frame - 95, config: {damping: 11, stiffness: 170}});
  const final = range(v.frame, [172, 214], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: "4%", background: v.template.surface, border: `1px solid ${v.template.foreground}`, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1.1fr .9fr"}}>
        <div style={{padding: "7%", borderRight: `1px solid ${v.template.foreground}55`, minHeight: 0}}><div style={{fontSize: 15, fontWeight: 900, letterSpacing: 3}}>{v.eyebrow}</div><div style={{height: "72%", marginTop: "8%"}}><ProductCutout src={props.imageSrc} color={v.accent} /></div><strong>{v.productName} / NO. 0031</strong></div>
        <div style={{padding: "9% 7%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}><div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 58 : 48, lineHeight: .95}}>{v.headline}</div>{["ORIGIN / VERIFIED","MATERIAL / RECORDED","FORM / APPROVED","EDITION / CURRENT"].map((line,index)=><div key={line} style={{borderTop: `1px solid ${v.template.foreground}`, padding: "13px 0", fontFamily: "monospace", fontWeight: 800}}>{line}<span style={{float: "right", color: v.accent}}>0{index + 1}</span></div>)}</div>
      </div>
      <div style={{position: "absolute", right: "9%", bottom: "12%", width: 150, aspectRatio: 1, border: `6px double ${v.accent}`, borderRadius: "50%", color: v.accent, transform: `rotate(-13deg) scale(${stamp})`, display: "grid", placeItems: "center", textAlign: "center", fontWeight: 950}}>AUTHENTIC<br/>OBJECT</div>
      <div style={{position: "absolute", inset: "4%", background: v.template.foreground, color: v.template.surface, transform: `translateY(${(1 - final) * 110}%)`, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1fr .85fr", padding: "7%", gap: 24}}><div style={{minHeight: 0}}><ProductCutout src={props.imageSrc} color={v.accent} /></div><div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}><div style={{color: v.accent, fontFamily: "monospace", fontWeight: 900}}>RECORD / COMPLETE</div><div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 65 : 54, lineHeight: .92, marginTop: 18}}>{v.headline}</div><div style={{marginTop: 18, color: "#c8c0b2"}}>{v.subheadline}</div><strong style={{marginTop: 24, color: v.accent}}>{v.cta} →</strong></div></div>
    </AbsoluteFill>
  );
};

const ConveyorDrop: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const select = range(v.frame, [100, 160], [0, 1]);
  const final = range(v.frame, [174, 214], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", left: 0, right: 0, top: "57%", height: "16%", background: v.template.surface, display: "flex", alignItems: "center", gap: 26, transform: `translateX(${-((v.frame * 5) % 240)}px)`, width: "150%"}}>{Array.from({length: 10}).map((_,index)=><div key={index} style={{width: 120, height: 8, background: index % 2 ? v.accent : "#777", flex: "0 0 auto"}} />)}</div>
      {[-1,0,1,2].map((offset,index)=>{const x=50+offset*34-range(v.frame,[0,140],[0,48]); const chosen=index===2; return <div key={offset} style={{position: "absolute", left: `${x}%`, top: v.vertical ? "28%" : "17%", width: v.vertical ? "43%" : "27%", height: v.vertical ? "38%" : "50%", transform: `translateX(-50%) scale(${chosen ? 1 + select * .35 : 1 - select * .25}) translateY(${chosen ? -select * 105 : 0}px)`, opacity: chosen ? 1 : 1-select*.65, filter: chosen ? "drop-shadow(0 38px 38px rgba(0,0,0,.25))" : "grayscale(1)"}}><ProductCutout src={props.imageSrc} color={v.accent} /></div>})}
      <div style={{position: "absolute", left: "5%", top: "5%", fontFamily: "monospace", fontWeight: 900, letterSpacing: 3}}>{v.eyebrow}</div>
      <div style={{position: "absolute", right: "5%", top: "5%", padding: "10px 14px", background: v.accent, color: "#fff", fontWeight: 900}}>SELECTED / 01</div>
      <div style={{position: "absolute", inset: 0, padding: "7%", background: v.template.surface, color: "#fff", clipPath: `circle(${final * 80}% at 50% 50%)`, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1fr .85fr", gap: 28}}><div style={{minHeight: 0}}><ProductCutout src={props.imageSrc} color={v.accent} /></div><div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}><div style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.productName}</div><div style={{fontSize: v.vertical ? 84 : 70, fontWeight: 950, lineHeight: .84, marginTop: 18}}>{v.headline}</div><div style={{fontSize: 20, color: "#aaa", marginTop: 19}}>{v.subheadline}</div><strong style={{marginTop: 24, color: v.accent}}>{v.cta} →</strong></div></div>
    </AbsoluteFill>
  );
};

const BotanicalForm: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const grow = spring({fps: v.fps, frame: v.frame - 12, config: {damping: 18, stiffness: 58}});
  const copy = range(v.frame, [160, 208], [0, 1]);
  const leaves = [{l:"-8%",t:"8%",r:-38},{l:"68%",t:"-5%",r:42},{l:"-12%",t:"62%",r:-65},{l:"72%",t:"58%",r:74}];
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 48%,#fff8,transparent 50%)"}} />
      {leaves.map((leaf,index)=><div key={index} style={{position: "absolute", left: leaf.l, top: leaf.t, width: v.vertical ? "48%" : "38%", height: "43%", borderRadius: "100% 0 100% 0", background: index % 2 ? v.template.surface : v.accent, opacity: .72, transformOrigin: "bottom right", transform: `rotate(${leaf.r + Math.sin(v.frame/28+index)*5}deg) scale(${grow})`, filter: "drop-shadow(0 25px 25px rgba(23,49,40,.18))"}} />)}
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "22%" : "11%", width: v.vertical ? "78%" : "54%", height: v.vertical ? "57%" : "74%", transform: `translateX(-50%) translateY(${Math.sin(v.frame/20)*8}px)`, filter: "drop-shadow(0 42px 46px rgba(23,49,40,.24))"}}><ProductCutout src={props.imageSrc} color={v.accent} /></div>
      <div style={{position: "absolute", left: "6%", top: "5%", fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</div>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "5%", background: `${v.template.background}ee`, padding: "3%", opacity: copy, display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24}}><div><div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 70 : 59, lineHeight: .92}}>{v.headline}</div><div style={{fontSize: 19, color: v.template.muted, marginTop: 12}}>{v.subheadline}</div></div><strong style={{color: v.template.surface, whiteSpace: "nowrap"}}>{v.cta} →</strong></div>
    </AbsoluteFill>
  );
};

const TypeSculpture: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const wordX = range(v.frame, [0, 160], [35, -30]);
  const final = range(v.frame, [170, 212], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", left: `${wordX}%`, top: v.vertical ? "15%" : "2%", fontSize: v.vertical ? 300 : 360, lineHeight: .7, fontWeight: 950, letterSpacing: -25, whiteSpace: "nowrap", color: v.template.surface}}>OBJECT<br/>OBJECT</div>
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "20%" : "7%", width: v.vertical ? "86%" : "62%", height: v.vertical ? "64%" : "84%", transform: `translateX(-50%) rotate(${Math.sin(v.frame/35)*2}deg)`, filter: "drop-shadow(24px 30px 0 rgba(255,71,56,.8))"}}><ProductCutout src={props.imageSrc} color={v.accent} /></div>
      <div style={{position: "absolute", left: "5%", top: "5%", padding: "10px 14px", background: v.accent, color: "#fff", fontWeight: 900, letterSpacing: 3}}>{v.eyebrow}</div>
      <div style={{position: "absolute", inset: 0, background: v.accent, color: "#fff", clipPath: `inset(${(1-final)*50}% ${(1-final)*50}% ${(1-final)*50}% ${(1-final)*50}%)`, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : ".8fr 1fr", padding: "7%", gap: 30}}><div style={{minHeight: 0}}><ProductCutout src={props.imageSrc} color="#fff" style={{filter: "drop-shadow(18px 24px 0 rgba(0,0,0,.18))"}} /></div><div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}><div style={{fontSize: v.vertical ? 92 : 80, fontWeight: 950, lineHeight: .8}}>{v.headline}</div><div style={{fontSize: 20, marginTop: 22}}>{v.subheadline}</div><strong style={{marginTop: 24, color: v.template.surface}}>{v.cta} →</strong></div></div>
    </AbsoluteFill>
  );
};

const MirrorSequence: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const resolve = range(v.frame, [166, 210], [0, 1]);
  const reflections = [-2,-1,0,1,2];
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden", perspective: 1000}}>
      <div style={{position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 55%,${v.template.surface},transparent 58%)`}} />
      {reflections.map((offset,index)=><div key={offset} style={{position: "absolute", left: `${50+offset*(v.vertical?17:20)}%`, top: v.vertical ? "24%" : "12%", width: v.vertical ? "45%" : "31%", height: v.vertical ? "52%" : "70%", transform: `translateX(-50%) rotateY(${offset*-24}deg) translateY(${Math.abs(offset)*18}px) scale(${1-Math.abs(offset)*.1+resolve*(offset===0?.12:0)})`, opacity: offset===0?1:.42*(1-resolve), filter: offset===0?`drop-shadow(0 0 40px ${v.accent}44)`:"saturate(.55)"}}><ProductCutout src={props.imageSrc} color={v.accent} style={{transform: offset<0?"scaleX(-1)":"none"}} /></div>)}
      <div style={{position: "absolute", left: "5%", top: "5%", color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</div>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "6%", opacity: resolve, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1.2fr 1fr", alignItems: "end", gap: 24}}><div style={{fontSize: v.vertical ? 82 : 70, fontWeight: 800, lineHeight: .86}}>{v.headline}</div><div><div style={{fontSize: 20, color: v.template.muted}}>{v.subheadline}</div><strong style={{display: "block", marginTop: 16, color: v.accent}}>{v.cta} →</strong></div></div>
      <div style={{position: "absolute", left: "8%", right: "8%", top: "50%", height: 1, background: `${v.accent}33`}} />
    </AbsoluteFill>
  );
};

const OneTakeReveal: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch4(props);
  const zoom = range(v.frame, [0, 182], [3.6, .86]);
  const x = range(v.frame, [0, 70, 135, 182], [-28, 18, -8, 0]);
  const y = range(v.frame, [0, 85, 182], [22, -12, 0]);
  const final = range(v.frame, [182, 218], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, background: `radial-gradient(circle at ${50+x/2}% ${50+y/2}%,${v.accent}2e,transparent 45%)`}} />
      <div style={{position: "absolute", left: "50%", top: "50%", width: v.vertical ? "84%" : "62%", height: v.vertical ? "64%" : "86%", transform: `translate(calc(-50% + ${x}%),calc(-50% + ${y}%)) scale(${zoom})`, filter: "drop-shadow(0 48px 60px rgba(0,0,0,.5))"}}><ProductCutout src={props.imageSrc} color={v.accent} /></div>
      <div style={{position: "absolute", left: "4%", top: "4%", fontFamily: "monospace", color: v.accent}}>SHOT 01 / FRAME {v.frame.toString().padStart(3,"0")}</div>
      <div style={{position: "absolute", inset: "3%", border: `1px solid ${v.accent}33`}} />
      <div style={{position: "absolute", inset: 0, padding: "7%", opacity: final, background: "linear-gradient(transparent 62%,rgba(9,9,9,.97) 92%)", display: "flex", flexDirection: "column", justifyContent: "flex-end"}}><div style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</div><div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 90 : 78, lineHeight: .88, marginTop: 16}}>{v.headline}</div><div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, marginTop: 22}}><span style={{fontSize: 20, color: v.template.muted}}>{v.subheadline}</span><strong style={{border: `1px solid ${v.accent}`, color: v.accent, padding: "14px 20px", whiteSpace: "nowrap"}}>{v.cta} →</strong></div></div>
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch4: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "shadow-signature": return <ShadowSignature {...props} />;
    case "product-chorus": return <ProductChorus {...props} />;
    case "runway-track": return <RunwayTrack {...props} />;
    case "broadcast-performance": return <BroadcastPerformance {...props} />;
    case "object-passport": return <ObjectPassport {...props} />;
    case "conveyor-drop": return <ConveyorDrop {...props} />;
    case "botanical-form": return <BotanicalForm {...props} />;
    case "type-sculpture": return <TypeSculpture {...props} />;
    case "mirror-sequence": return <MirrorSequence {...props} />;
    case "one-take": return <OneTakeReveal {...props} />;
    default: return null;
  }
};

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

const range = (
  frame: number,
  input: number[],
  output: number[],
) => interpolate(frame, input, output, clamp);

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

const useBatch2 = (props: ProductVideoProps) => {
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

const EclipseLuxury: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const reveal = range(v.frame, [12, 68], [0, 1]);
  const lightX = range(v.frame, [0, 130], [-45, 145]);
  const copy = range(v.frame, [88, 116], [0, 1]);
  const close = range(v.frame, [180, 214], [0, 1]);
  return (
    <AbsoluteFill style={{background: "#020202", color: v.template.foreground, overflow: "hidden"}}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at ${lightX}% 48%, ${v.accent}45 0, transparent 28%)`,
      }} />
      <div style={{
        position: "absolute", left: "50%", top: v.vertical ? "30%" : "19%",
        width: v.vertical ? "82%" : "62%", height: v.vertical ? "48%" : "70%",
        transform: `translateX(-50%) scale(${0.86 + reveal * 0.14})`,
        opacity: reveal,
        filter: `drop-shadow(0 50px 80px ${v.accent}22)`,
      }}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{
        position: "absolute", top: "7%", left: "7%", right: "7%",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: v.accent, fontSize: 18, letterSpacing: 4, fontWeight: 700,
        opacity: copy,
      }}>
        <span>{v.eyebrow}</span><span>01 / 01</span>
      </div>
      <div style={{
        position: "absolute", left: "7%", right: "7%", bottom: "7%",
        opacity: close, transform: `translateY(${(1 - close) * 35}px)`,
      }}>
        <div style={{fontSize: v.vertical ? 82 : 68, fontWeight: 500, letterSpacing: -3, lineHeight: .95}}>
          {v.headline}
        </div>
        <div style={{display: "flex", justifyContent: "space-between", gap: 30, marginTop: 24, color: v.template.muted}}>
          <span style={{fontSize: 22, maxWidth: 620}}>{v.subheadline}</span>
          <strong style={{color: v.accent, fontSize: 20}}>{v.cta} →</strong>
        </div>
      </div>
      <div style={{position: "absolute", inset: "3%", border: `1px solid ${v.accent}44`}} />
    </AbsoluteFill>
  );
};

const SwissSpecification: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const build = range(v.frame, [8, 54], [0, 1]);
  const product = spring({fps: v.fps, frame: v.frame - 36, config: {damping: 22, stiffness: 110}});
  const details = range(v.frame, [92, 125], [0, 1]);
  const columns = v.vertical ? "1fr" : "1.15fr .85fr";
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, opacity: .18, backgroundImage: "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg,#111 1px,transparent 1px)", backgroundSize: `${v.width / 12}px ${v.width / 12}px`}} />
      <div style={{position: "absolute", inset: "5%", display: "grid", gridTemplateColumns: columns, gap: v.vertical ? 24 : 46}}>
        <div style={{position: "relative", borderTop: `8px solid ${v.accent}`, borderBottom: "1px solid #111"}}>
          <div style={{paddingTop: 24, fontSize: 16, fontWeight: 800, letterSpacing: 3}}>{v.eyebrow}</div>
          <div style={{position: "absolute", inset: v.vertical ? "16% 0 30%" : "12% 0 12%", transform: `translateX(${(1 - product) * -60}px)`, opacity: product}}>
            <ProductCutout src={props.imageSrc} color={v.accent} />
          </div>
          <div style={{position: "absolute", bottom: 18, left: 0, fontSize: 18, fontWeight: 800}}>{v.productName}</div>
        </div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "space-between", padding: v.vertical ? "0" : "20px 0"}}>
          <div style={{transform: `scaleX(${build})`, transformOrigin: "left"}}>
            <div style={{fontSize: v.vertical ? 70 : 60, lineHeight: .92, fontWeight: 900, letterSpacing: -3}}>{v.headline}</div>
            <p style={{fontSize: 21, lineHeight: 1.4, color: v.template.muted}}>{v.subheadline}</p>
          </div>
          <div style={{opacity: details}}>
            {["01  MATERIAL", "02  GEOMETRY", "03  PERFORMANCE"].map((label, index) => (
              <div key={label} style={{padding: "15px 0", borderTop: "1px solid #111", display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 750}}>
                <span>{label}</span><span style={{color: v.accent}}>{98 - index * 3}%</span>
              </div>
            ))}
            <div style={{marginTop: 20, padding: "15px 18px", background: "#111", color: "#fff", display: "inline-block", fontWeight: 800}}>{v.cta} →</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TypeImpact: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const hit = spring({fps: v.fps, frame: v.frame - 24, config: {damping: 12, stiffness: 170}});
  const swap = Math.floor(v.frame / 26) % 3;
  const words = ["LOUD", "NEW", "YOURS"];
  const final = range(v.frame, [170, 205], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        fontSize: v.vertical ? 230 : 260, fontWeight: 950, lineHeight: .7,
        letterSpacing: -18, color: swap === 1 ? v.accent : v.template.foreground,
        transform: `translateX(${swap === 2 ? -8 : 8}%) rotate(${swap === 1 ? -4 : 2}deg)`,
      }}>{words[swap]}</div>
      <div style={{
        position: "absolute", left: "50%", top: v.vertical ? "24%" : "13%",
        width: v.vertical ? "88%" : "62%", height: v.vertical ? "55%" : "76%",
        transform: `translateX(-50%) scale(${hit}) rotate(${(1 - hit) * 12}deg)`,
        filter: "drop-shadow(18px 24px 0 rgba(0,0,0,.25))",
      }}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", padding: "12px 16px", background: v.accent, color: "#111", fontWeight: 900, letterSpacing: 2}}>{v.eyebrow}</div>
      <div style={{
        position: "absolute", inset: 0, padding: "7%", display: "flex", flexDirection: "column",
        justifyContent: "flex-end", background: `rgba(16,16,16,${final * .94})`, opacity: final,
      }}>
        <div style={{fontSize: v.vertical ? 100 : 86, fontWeight: 950, lineHeight: .9, maxWidth: 820}}>{v.headline}</div>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: 30, marginTop: 30}}>
          <span style={{fontSize: 22, color: "#ddd"}}>{v.subheadline}</span>
          <strong style={{padding: "16px 22px", background: v.accent, color: "#111", fontSize: 20}}>{v.cta} →</strong>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EditorialTriptych: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const panels = [0, 1, 2].map((index) => spring({fps: v.fps, frame: v.frame - index * 12, config: {damping: 18, stiffness: 95}}));
  const resolve = range(v.frame, [148, 198], [0, 1]);
  const positions = ["left", "center", "right"];
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", top: "5%", left: "5%", right: "5%", display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 850, letterSpacing: 3}}>
        <span>{v.eyebrow}</span><span>ISSUE 01</span>
      </div>
      <div style={{
        position: "absolute", left: "5%", right: "5%", top: v.vertical ? "15%" : "12%",
        height: v.vertical ? "57%" : "65%", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12,
        opacity: 1 - resolve,
      }}>
        {panels.map((progress, index) => (
          <div key={positions[index]} style={{overflow: "hidden", background: index === 1 ? v.template.surface : v.accent, transform: `translateY(${(1 - progress) * (index % 2 ? -120 : 120)}px)`}}>
            <ProductCutout src={props.imageSrc} color={v.accent} fit="cover" position={positions[index]} style={{transform: `scale(${1.15 + index * .15})`}} />
          </div>
        ))}
      </div>
      <div style={{
        position: "absolute", left: "50%", top: v.vertical ? "16%" : "9%",
        width: v.vertical ? "82%" : "58%", height: v.vertical ? "56%" : "70%",
        transform: `translateX(-50%) scale(${.9 + resolve * .1})`, opacity: resolve,
      }}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: "5%", right: "5%", bottom: "5%", borderTop: `2px solid ${v.template.foreground}`, paddingTop: 18, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1.4fr 1fr", gap: 20}}>
        <div style={{fontSize: v.vertical ? 58 : 48, fontWeight: 750, lineHeight: .95, letterSpacing: -2}}>{v.headline}</div>
        <div><div style={{fontSize: 18, lineHeight: 1.4, color: v.template.muted}}>{v.subheadline}</div><strong style={{display: "block", marginTop: 12, color: v.accent}}>{v.cta} →</strong></div>
      </div>
    </AbsoluteFill>
  );
};

const LiquidBloom: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const float = Math.sin(v.frame / 18) * 12;
  const reveal = spring({fps: v.fps, frame: v.frame - 22, config: {damping: 20, stiffness: 75}});
  const copy = range(v.frame, [105, 145], [0, 1]);
  const blobs = [
    {left: "-15%", top: "34%", color: v.template.surface, delay: 0},
    {left: "55%", top: "-10%", color: v.accent, delay: 18},
    {left: "58%", top: "62%", color: "#ffd6a8", delay: 35},
  ];
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      {blobs.map((blob) => {
        const grow = spring({fps: v.fps, frame: v.frame - blob.delay, config: {damping: 18, stiffness: 55}});
        return <div key={blob.left + blob.top} style={{position: "absolute", left: blob.left, top: blob.top, width: "62%", aspectRatio: 1, borderRadius: "42% 58% 64% 36% / 52% 38% 62% 48%", background: blob.color, opacity: .65, filter: `blur(${v.width * .025}px)`, transform: `scale(${grow}) rotate(${v.frame / 4}deg)`}} />;
      })}
      <div style={{position: "absolute", top: "6%", left: "7%", fontSize: 18, letterSpacing: 4, fontWeight: 800}}>{v.eyebrow}</div>
      <div style={{
        position: "absolute", left: "50%", top: v.vertical ? "24%" : "15%",
        width: v.vertical ? "82%" : "58%", height: v.vertical ? "52%" : "68%",
        transform: `translate(-50%, ${float}px) scale(${reveal})`,
        filter: "drop-shadow(0 45px 70px rgba(60,20,48,.2))",
      }}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", left: "7%", right: "7%", bottom: "7%", textAlign: "center", opacity: copy, transform: `translateY(${(1 - copy) * 28}px)`}}>
        <div style={{fontSize: v.vertical ? 70 : 60, fontWeight: 800, letterSpacing: -3}}>{v.headline}</div>
        <div style={{fontSize: 21, color: v.template.muted, margin: "14px auto 20px", maxWidth: 680}}>{v.subheadline}</div>
        <strong style={{display: "inline-block", padding: "14px 24px", borderRadius: 999, background: v.template.foreground, color: v.template.background}}>{v.cta} →</strong>
      </div>
    </AbsoluteFill>
  );
};

const BlueprintBreakdown: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const product = spring({fps: v.fps, frame: v.frame - 16, config: {damping: 20, stiffness: 90}});
  const callouts = range(v.frame, [65, 105], [0, 1]) * (1 - range(v.frame, [175, 210], [0, 1]));
  const finale = range(v.frame, [185, 220], [0, 1]);
  const labels = [
    {top: "27%", left: "5%", text: "01 / MATERIAL"},
    {top: "48%", right: "5%", text: "02 / CONTROL"},
    {top: "68%", left: "8%", text: "03 / OUTPUT"},
  ];
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, opacity: .22, backgroundImage: `linear-gradient(${v.accent}55 1px,transparent 1px),linear-gradient(90deg,${v.accent}55 1px,transparent 1px)`, backgroundSize: `${v.width / 18}px ${v.width / 18}px`}} />
      <div style={{position: "absolute", top: "5%", left: "5%", right: "5%", display: "flex", justifyContent: "space-between", color: v.accent, fontWeight: 800, letterSpacing: 3}}><span>{v.eyebrow}</span><span>REV / 02</span></div>
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "24%" : "14%", width: v.vertical ? "74%" : "52%", height: v.vertical ? "52%" : "72%", transform: `translateX(-50%) scale(${product + finale * .08})`}}>
        <ProductCutout src={props.imageSrc} color={v.accent} style={{filter: `drop-shadow(0 0 24px ${v.accent}33)`}} />
      </div>
      {labels.map((label, index) => (
        <div key={label.text} style={{position: "absolute", ...label, opacity: callouts, width: v.vertical ? "35%" : "28%", color: v.accent, fontSize: 15, fontWeight: 800}}>
          <div style={{height: 1, background: v.accent, transform: `scaleX(${callouts})`, transformOrigin: index === 1 ? "right" : "left", marginBottom: 10}} />
          {label.text}<div style={{color: v.template.foreground, marginTop: 5, fontWeight: 500}}>CALIBRATED / VERIFIED</div>
        </div>
      ))}
      <div style={{position: "absolute", left: "5%", right: "5%", bottom: "5%", opacity: finale, display: "flex", alignItems: "end", justifyContent: "space-between", gap: 20}}>
        <div><div style={{fontSize: v.vertical ? 58 : 48, fontWeight: 850}}>{v.headline}</div><div style={{color: v.template.muted, fontSize: 19, marginTop: 8}}>{v.subheadline}</div></div>
        <strong style={{color: v.accent, whiteSpace: "nowrap"}}>{v.cta} →</strong>
      </div>
    </AbsoluteFill>
  );
};

const PopTileMotion: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const colors = [v.template.background, v.template.surface, v.accent, "#ff7ac8", "#f8f4ea", "#111111"];
  const hero = range(v.frame, [150, 196], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, display: "grid", gridTemplateColumns: v.vertical ? "repeat(2,1fr)" : "repeat(3,1fr)", gridTemplateRows: v.vertical ? "repeat(3,1fr)" : "repeat(2,1fr)", opacity: 1 - hero}}>
        {colors.map((color, index) => {
          const snap = spring({fps: v.fps, frame: v.frame - index * 7, config: {damping: 13, stiffness: 160}});
          return (
            <div key={color + index} style={{background: color, overflow: "hidden", display: "grid", placeItems: "center", transform: `scale(${snap}) rotate(${index % 2 ? 2 : -2}deg)`}}>
              {index % 2 === 0 ? (
                <ProductCutout src={props.imageSrc} color={v.template.foreground} style={{width: "82%", height: "82%", transform: `rotate(${index * 8 - 12}deg)`}} />
              ) : (
                <strong style={{fontSize: v.vertical ? 52 : 46, lineHeight: .85, textAlign: "center", padding: 20}}>{index === 1 ? "NEW" : index === 3 ? "NOW" : v.productName}</strong>
              )}
            </div>
          );
        })}
      </div>
      <div style={{position: "absolute", inset: 0, background: v.template.surface, transform: `scale(${hero})`, display: "grid", placeItems: "center", overflow: "hidden"}}>
        <div style={{position: "absolute", inset: 0, fontSize: v.vertical ? 180 : 210, fontWeight: 950, lineHeight: .72, color: v.template.background, opacity: .8}}>GET<br/>IT<br/>NOW</div>
        <div style={{width: v.vertical ? "82%" : "58%", height: v.vertical ? "58%" : "76%", zIndex: 1}}>
          <ProductCutout src={props.imageSrc} color={v.accent} style={{filter: "drop-shadow(20px 25px 0 rgba(0,0,0,.18))"}} />
        </div>
        <div style={{position: "absolute", left: "6%", right: "6%", bottom: "5%", display: "flex", justifyContent: "space-between", alignItems: "end", zIndex: 2}}>
          <div><div style={{fontSize: 18, fontWeight: 900, letterSpacing: 3}}>{v.eyebrow}</div><div style={{fontSize: 36, fontWeight: 950, marginTop: 6}}>{v.productName}</div></div>
          <strong style={{padding: "15px 20px", background: v.accent, color: "#fff"}}>{v.cta} →</strong>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GalleryPedestal: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const room = range(v.frame, [0, 55], [0, 1]);
  const rise = spring({fps: v.fps, frame: v.frame - 42, config: {damping: 24, stiffness: 70}});
  const copy = range(v.frame, [125, 170], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden", perspective: 1200}}>
      <div style={{position: "absolute", inset: "5%", background: v.template.surface, transform: `scale(${.88 + room * .12})`, boxShadow: "inset 0 0 90px rgba(0,0,0,.08)"}} />
      <div style={{position: "absolute", left: "18%", right: "18%", bottom: v.vertical ? "19%" : "12%", height: v.vertical ? "23%" : "28%", background: "#c4b9a9", clipPath: "polygon(16% 0,84% 0,100% 100%,0 100%)", transform: `rotateX(${62 - room * 12}deg)`}} />
      <div style={{position: "absolute", left: "33%", right: "33%", bottom: v.vertical ? "20%" : "14%", height: v.vertical ? "23%" : "27%", background: "#ece7df", clipPath: "polygon(10% 0,90% 0,100% 100%,0 100%)"}} />
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "23%" : "12%", width: v.vertical ? "70%" : "48%", height: v.vertical ? "53%" : "70%", transform: `translate(-50%, ${(1 - rise) * 140}px) scale(${.9 + rise * .1})`, opacity: rise, filter: "drop-shadow(0 55px 45px rgba(39,31,24,.2))"}}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", top: "7%", left: "7%", fontSize: 16, letterSpacing: 4, fontWeight: 800}}>{v.eyebrow}</div>
      <div style={{position: "absolute", left: "7%", right: "7%", bottom: "6%", opacity: copy, display: "flex", justifyContent: "space-between", alignItems: "end", gap: 30}}>
        <div><div style={{fontFamily: "Georgia, serif", fontSize: v.vertical ? 66 : 56, lineHeight: .95}}>{v.headline}</div><div style={{color: v.template.muted, fontSize: 19, marginTop: 12}}>{v.subheadline}</div></div>
        <div style={{borderLeft: `2px solid ${v.accent}`, paddingLeft: 18}}><strong>{v.productName}</strong><div style={{marginTop: 8, color: v.accent}}>{v.cta} →</div></div>
      </div>
    </AbsoluteFill>
  );
};

const LaunchCountdown: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const count = v.frame < 32 ? "03" : v.frame < 64 ? "02" : v.frame < 96 ? "01" : "00";
  const launch = spring({fps: v.fps, frame: v.frame - 88, config: {damping: 14, stiffness: 125}});
  const close = range(v.frame, [165, 205], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, background: `repeating-linear-gradient(90deg,transparent 0,transparent ${v.width / 12 - 1}px,${v.accent}22 ${v.width / 12}px)`}} />
      <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: v.vertical ? 420 : 360, fontWeight: 950, letterSpacing: -30, color: v.accent, opacity: .16, transform: `scale(${1 + (v.frame % 32) / 180})`}}>{count}</div>
      <div style={{position: "absolute", top: "5%", left: "5%", right: "5%", display: "flex", justifyContent: "space-between", fontWeight: 800, letterSpacing: 3}}><span>{v.eyebrow}</span><span style={{color: v.accent}}>SIGNAL / LIVE</span></div>
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "23%" : "12%", width: v.vertical ? "82%" : "58%", height: v.vertical ? "56%" : "75%", transform: `translateX(-50%) scale(${launch})`, filter: `drop-shadow(0 0 50px ${v.accent}55)`}}>
        <ProductCutout src={props.imageSrc} color={v.accent} />
      </div>
      <div style={{position: "absolute", inset: 0, background: `rgba(8,11,18,${close * .9})`, opacity: close, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "7%"}}>
        <div style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.productName} / AVAILABLE NOW</div>
        <div style={{fontSize: v.vertical ? 92 : 78, fontWeight: 950, lineHeight: .9, marginTop: 18}}>{v.headline}</div>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginTop: 24}}>
          <span style={{fontSize: 21, color: v.template.muted}}>{v.subheadline}</span>
          <strong style={{background: v.accent, padding: "16px 22px", whiteSpace: "nowrap"}}>{v.cta} →</strong>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LifestyleScrapbook: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch2(props);
  const cards = [
    {left: "7%", top: "18%", rotate: -8, color: "#d6e7d6", delay: 0},
    {right: "7%", top: "12%", rotate: 7, color: "#f5c3aa", delay: 14},
    {left: "20%", bottom: "10%", rotate: 3, color: v.template.surface, delay: 28},
  ];
  const finish = range(v.frame, [168, 212], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, opacity: .35, backgroundImage: "radial-gradient(#735 0.7px,transparent 0.7px)", backgroundSize: "12px 12px"}} />
      {cards.map((card, index) => {
        const {rotate, delay, color, ...position} = card;
        const enter = spring({fps: v.fps, frame: v.frame - delay, config: {damping: 16, stiffness: 100}});
        return (
          <div key={index} style={{position: "absolute", ...position, width: v.vertical ? "66%" : "43%", height: v.vertical ? "34%" : "48%", padding: 16, background: color, boxShadow: "0 18px 35px rgba(60,45,30,.15)", transform: `scale(${enter}) rotate(${rotate}deg)`, opacity: 1 - finish}}>
            {index < 2 ? <ProductCutout src={props.imageSrc} color={v.accent} position={index ? "right" : "left"} /> : <div style={{fontSize: v.vertical ? 58 : 50, fontFamily: "Georgia, serif", lineHeight: 1}}>{v.headline}</div>}
            <div style={{position: "absolute", width: 70, height: 22, top: -9, left: "42%", background: "#f4df9b", opacity: .8, transform: "rotate(-3deg)"}} />
          </div>
        );
      })}
      <div style={{position: "absolute", left: "5%", top: "5%", padding: "10px 14px", border: `2px solid ${v.template.foreground}`, borderRadius: 999, fontWeight: 850, letterSpacing: 2}}>{v.eyebrow}</div>
      <div style={{position: "absolute", inset: "5%", background: v.template.surface, transform: `translateY(${(1 - finish) * 110}%) rotate(${(1 - finish) * -3}deg)`, boxShadow: "0 30px 70px rgba(60,45,30,.2)", display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1fr .8fr", padding: "7%", gap: 30}}>
        <div style={{minHeight: 0}}><ProductCutout src={props.imageSrc} color={v.accent} /></div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <div style={{color: v.accent, fontWeight: 900, letterSpacing: 3}}>{v.productName}</div>
          <div style={{fontFamily: "Georgia, serif", fontSize: v.vertical ? 68 : 58, lineHeight: .95, marginTop: 16}}>{v.headline}</div>
          <div style={{fontSize: 20, lineHeight: 1.4, color: v.template.muted, marginTop: 18}}>{v.subheadline}</div>
          <strong style={{marginTop: 22, color: v.accent}}>{v.cta} →</strong>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch2: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "eclipse": return <EclipseLuxury {...props} />;
    case "swiss": return <SwissSpecification {...props} />;
    case "type-impact": return <TypeImpact {...props} />;
    case "triptych": return <EditorialTriptych {...props} />;
    case "liquid": return <LiquidBloom {...props} />;
    case "blueprint": return <BlueprintBreakdown {...props} />;
    case "pop-tile": return <PopTileMotion {...props} />;
    case "pedestal": return <GalleryPedestal {...props} />;
    case "countdown": return <LaunchCountdown {...props} />;
    case "scrapbook": return <LifestyleScrapbook {...props} />;
    default: return null;
  }
};

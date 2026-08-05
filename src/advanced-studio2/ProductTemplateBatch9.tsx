import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {getProductTemplate} from "./product-templates";
import type {ProductVideoProps} from "./ProductVideo";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const progress = (
  frame: number,
  input: [number, number] | [number, number, number, number],
  output: [number, number] | [number, number, number, number],
) => interpolate(frame, input, output, clamp);

const useScene = (props: ProductVideoProps) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const template = getProductTemplate(props.templateId);
  return {
    frame,
    fps,
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
  light?: boolean;
  align?: "left" | "center";
  style?: React.CSSProperties;
}> = ({scene, light = false, align = "left", style}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align,
      color: light ? "#fff" : scene.template.foreground,
      ...style,
    }}
  >
    <span
      style={{
        color: scene.accent,
        fontSize: 15,
        fontWeight: 900,
        letterSpacing: 4,
      }}
    >
      {scene.eyebrow}
    </span>
    <strong
      style={{
        maxWidth: 760,
        marginTop: 20,
        fontSize: scene.vertical ? 82 : scene.compact ? 60 : 70,
        lineHeight: 0.88,
        letterSpacing: -3,
      }}
    >
      {scene.headline}
    </strong>
    <span
      style={{
        maxWidth: 580,
        marginTop: 22,
        color: light ? "#d8d8d2" : scene.template.muted,
        fontSize: 17,
        lineHeight: 1.4,
      }}
    >
      {scene.subheadline}
    </span>
    <b style={{marginTop: 24, color: scene.accent, fontSize: 15}}>
      {scene.cta} →
    </b>
  </div>
);

const CurtainCall: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const open = progress(s.frame, [32, 128], [0, 1]);
  const finish = progress(s.frame, [205, 250], [0, 1]);
  const productEnter = spring({
    fps: s.fps,
    frame: s.frame - 85,
    config: {damping: 18, stiffness: 88},
  });
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 44%, ${s.accent}55, transparent 48%)`,
          opacity: progress(s.frame, [65, 135], [0, 1]),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "20%",
          right: "20%",
          top: "16%",
          bottom: "18%",
          transform: `translateY(${(1 - productEnter) * 80}px) scale(${0.82 + productEnter * 0.18})`,
          opacity: productEnter,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      {["left", "right"].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [side]: 0,
            width: "51%",
            background: `linear-gradient(${side === "left" ? 100 : 260}deg, #090909, ${s.template.surface})`,
            transform: `translateX(${(side === "left" ? -1 : 1) * open * 94}%)`,
            boxShadow: "0 0 70px #000",
          }}
        />
      ))}
      <div style={{position: "absolute", left: "6%", top: "6%", color: s.accent, fontWeight: 900, letterSpacing: 5}}>
        CURTAIN / 01
      </div>
      <div
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          bottom: "6%",
          opacity: finish,
          transform: `translateY(${(1 - finish) * 30}px)`,
        }}
      >
        <Copy scene={s} light />
      </div>
    </AbsoluteFill>
  );
};

const StageFlats: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const act = Math.min(2, Math.floor(s.frame / 82));
  const local = s.frame - act * 82;
  const enter = spring({fps: s.fps, frame: local, config: {damping: 20, stiffness: 110}});
  const palettes = [
    [s.template.background, s.accent, s.template.surface],
    ["#173f48", "#e8dfd0", "#ff684f"],
    ["#ff684f", "#171918", "#f4d586"],
  ];
  const p = palettes[act];
  return (
    <AbsoluteFill style={{background: p[0], color: s.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, transform: `translateX(${(1 - enter) * -22}%)`}}>
        <div style={{position: "absolute", left: "-4%", top: "9%", width: "48%", height: "82%", background: p[1], transform: "skewY(-7deg)"}} />
        <div style={{position: "absolute", right: "-8%", top: "18%", width: "46%", height: "70%", background: p[2], transform: "skewY(9deg)"}} />
        <div style={{position: "absolute", left: "22%", right: "22%", bottom: "5%", height: "18%", background: "#0002", transform: "perspective(500px) rotateX(66deg)"}} />
      </div>
      <div style={{position: "absolute", inset: s.vertical ? "18% 12% 28%" : "13% 25% 18%", transform: `translateY(${(1 - enter) * 50}px)`}}>
        <Product src={props.imageSrc} style={{filter: "drop-shadow(0 28px 22px #0005)"}} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", fontWeight: 900, letterSpacing: 4}}>ACT 0{act + 1}</div>
      <Copy
        scene={s}
        style={{
          position: "absolute",
          left: "5%",
          bottom: "4%",
          width: s.vertical ? "90%" : "58%",
          padding: "3%",
          background: "#e8dfd0ee",
          zIndex: 3,
        }}
      />
    </AbsoluteFill>
  );
};

const FrameStep: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const stepped = Math.floor(s.frame / 7);
  const pose = stepped % 6;
  const x = [-25, 18, -8, 28, 4, 0][pose];
  const y = [10, -16, 20, -8, 4, 0][pose];
  const rotation = [-5, 3, -2, 5, -1, 0][pose];
  const final = progress(s.frame, [218, 248], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: s.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 20, border: `3px solid ${s.template.foreground}`}} />
      {Array.from({length: 6}).map((_, i) => (
        <div key={i} style={{position: "absolute", left: `${8 + i * 16}%`, top: `${12 + (i % 2) * 8}%`, width: 48, height: 48, background: i % 2 ? s.accent : s.template.surface}} />
      ))}
      <div
        style={{
          position: "absolute",
          inset: s.vertical ? "18% 10% 26%" : "15% 24% 17%",
          transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${0.93 + pose * 0.012})`,
        }}
      >
        <Product src={props.imageSrc} style={{filter: "drop-shadow(14px 18px 0 #0002)"}} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 950, letterSpacing: 4}}>
        FRAME / {String(stepped).padStart(3, "0")}
      </div>
      <div style={{position: "absolute", inset: 0, background: s.template.surface, opacity: final, padding: "7%", display: "grid", gridTemplateColumns: s.vertical ? "1fr" : "1fr 1fr", alignItems: "center", gap: 30}}>
        <div style={{height: s.vertical ? "55%" : "78%"}}><Product src={props.imageSrc} /></div>
        <Copy scene={s} light />
      </div>
    </AbsoluteFill>
  );
};

const ProjectionRoom: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const sweep = progress(s.frame, [0, 220], [-25, 105]);
  const finish = progress(s.frame, [220, 258], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, background: `radial-gradient(circle at ${sweep}% 45%, ${s.accent}88 0, ${s.accent}22 18%, transparent 43%)`}} />
      <div style={{position: "absolute", left: `${sweep - 18}%`, top: "-20%", width: "35%", height: "140%", background: `linear-gradient(90deg, transparent, ${s.accent}35, transparent)`, transform: "rotate(12deg)", filter: "blur(18px)"}} />
      <div style={{position: "absolute", inset: s.vertical ? "18% 12% 22%" : "12% 23% 12%"}}>
        <Product src={props.imageSrc} style={{filter: `drop-shadow(0 0 32px ${s.accent}66)`}} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", fontWeight: 900, letterSpacing: 5}}>PROJECTION / LIVE</div>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "6%", opacity: finish}}>
        <Copy scene={s} light />
      </div>
    </AbsoluteFill>
  );
};

const SilhouetteTrace: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const reveal = progress(s.frame, [70, 195], [0, 1]);
  const line = progress(s.frame, [0, 150], [0, 100]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 900, letterSpacing: 4}}>EDGE LIGHT / {Math.round(line)}%</div>
      <div style={{position: "absolute", inset: s.vertical ? "14% 8% 28%" : "10% 35% 10% 8%"}}>
        <Product
          src={props.imageSrc}
          style={{
            filter: `brightness(${reveal}) saturate(${reveal}) drop-shadow(0 0 ${8 + line * 0.35}px ${s.accent})`,
            opacity: 0.28 + reveal * 0.72,
          }}
        />
      </div>
      <div style={{position: "absolute", left: s.vertical ? "7%" : "58%", right: "7%", bottom: s.vertical ? "6%" : "14%"}}>
        <Copy scene={s} light />
      </div>
    </AbsoluteFill>
  );
};

const ObjectChoreography: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const lock = progress(s.frame, [150, 220], [0, 1]);
  const finish = progress(s.frame, [225, 262], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: s.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: "9%", border: `1px solid ${s.accent}`}}>
        {[0, 1, 2].map((i) => {
          const offset = (i - 1) * (1 - lock) * (s.vertical ? 190 : 250);
          return (
            <div key={i} style={{position: "absolute", left: "25%", top: "10%", width: "50%", height: "70%", transform: `translateX(${offset}px) scale(${0.84 + i * 0.08})`, opacity: i === 1 ? 1 : (1 - finish) * (0.45 + i * 0.22)}}>
              <Product src={props.imageSrc} />
            </div>
          );
        })}
        <div style={{position: "absolute", left: 20, top: 16, color: s.accent, fontWeight: 900, letterSpacing: 4}}>ALIGNMENT / {Math.round(lock * 100)}</div>
      </div>
      <div style={{position: "absolute", left: "7%", right: "7%", bottom: "5%", opacity: finish}}>
        <Copy scene={s} />
      </div>
    </AbsoluteFill>
  );
};

const FiveBeatFilm: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const beat = Math.min(4, Math.floor(s.frame / 60));
  const labels = ["IDENTITY", "TENSION", "REVEAL", "PROOF", "PACKSHOT"];
  const colors = ["#111111", "#2644ff", "#ffd500", "#f0eee8", "#111111"];
  const local = s.frame - beat * 60;
  const enter = spring({fps: s.fps, frame: local, config: {damping: 18, stiffness: 120}});
  return (
    <AbsoluteFill style={{background: colors[beat], color: beat === 2 || beat === 3 ? "#111" : "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", left: "5%", top: "5%", fontWeight: 950, letterSpacing: 5}}>0{beat + 1} / {labels[beat]}</div>
      <div style={{position: "absolute", inset: s.vertical ? "14% 9% 28%" : "11% 22% 13%", transform: `scale(${0.75 + enter * 0.25}) rotate(${(1 - enter) * (beat % 2 ? -8 : 8)}deg)`}}>
        <Product src={props.imageSrc} style={{filter: beat === 1 ? "grayscale(1) contrast(1.25)" : "none"}} />
      </div>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "5%"}}>
        {beat === 4 ? <Copy scene={s} light /> : <strong style={{fontSize: s.vertical ? 90 : 72, lineHeight: 0.85}}>{labels[beat]}</strong>}
      </div>
      <div style={{position: "absolute", left: "5%", right: "5%", bottom: 16, height: 5, background: "#ffffff33"}}>
        <div style={{width: `${((beat * 60 + local) / 300) * 100}%`, height: "100%", background: s.accent}} />
      </div>
    </AbsoluteFill>
  );
};

const WorldsAroundObject: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const world = Math.min(2, Math.floor(s.frame / 88));
  const palettes = [
    ["#dfece7", "#ff563e", "CIVIC"],
    ["#231b46", "#adff65", "NIGHT"],
    ["#f3c866", "#0c6370", "HORIZON"],
  ] as const;
  const [background, accent, label] = palettes[world];
  const travel = progress(s.frame % 88, [0, 87], [-12, 12]);
  const finish = progress(s.frame, [240, 272], [0, 1]);
  return (
    <AbsoluteFill style={{background, color: world === 1 ? "#fff" : "#111", overflow: "hidden"}}>
      <div style={{position: "absolute", left: `${-20 + travel}%`, top: "12%", width: "64%", height: "76%", borderRadius: world === 0 ? "50%" : 0, background: accent, transform: world === 2 ? "skewX(-18deg)" : "none"}} />
      <div style={{position: "absolute", right: `${-25 - travel}%`, top: "24%", width: "62%", height: "42%", border: `28px solid ${world === 1 ? "#fff" : "#111"}22`, transform: "rotate(-12deg)"}} />
      <div style={{position: "absolute", inset: s.vertical ? "16% 13% 26%" : "12% 28% 14%", zIndex: 2}}>
        <Product src={props.imageSrc} style={{filter: "drop-shadow(0 28px 24px #0005)"}} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", fontWeight: 950, letterSpacing: 5}}>WORLD 0{world + 1} / {label}</div>
      <div style={{position: "absolute", inset: 0, background: s.template.background, opacity: finish, padding: "7%", display: "grid", gridTemplateColumns: s.vertical ? "1fr" : "1fr 1fr", alignItems: "center", gap: 35, zIndex: 4}}>
        <div style={{height: s.vertical ? "55%" : "75%"}}><Product src={props.imageSrc} /></div>
        <Copy scene={s} />
      </div>
    </AbsoluteFill>
  );
};

const LivingStill: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const breathe = Math.sin((s.frame / 300) * Math.PI * 2);
  const copy = progress(s.frame, [30, 75], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, background: `radial-gradient(circle at ${52 + breathe * 3}% ${42 + breathe * 2}%, ${s.accent}28, transparent 42%)`}} />
      <div style={{position: "absolute", left: s.vertical ? "10%" : "48%", right: "7%", top: "10%", bottom: s.vertical ? "38%" : "10%", transform: `translateY(${breathe * 3}px)`}}>
        <Product src={props.imageSrc} style={{filter: `drop-shadow(${breathe * 6}px 30px 26px #0008)`}} />
      </div>
      <div style={{position: "absolute", left: "7%", right: s.vertical ? "7%" : "55%", bottom: s.vertical ? "7%" : "13%", opacity: copy}}>
        <Copy scene={s} light />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 900, letterSpacing: 5}}>LIVING STILL / 10 SEC</div>
    </AbsoluteFill>
  );
};

const TensionRelease: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const tension = progress(s.frame, [0, 205], [0, 1]);
  const release = progress(s.frame, [205, 238], [0, 1]);
  const crop = 7 + tension * 25 - release * 25;
  return (
    <AbsoluteFill style={{background: s.template.surface, color: "#fff", overflow: "hidden"}}>
      {Array.from({length: 5}).map((_, i) => (
        <div key={i} style={{position: "absolute", inset: `${crop + i * 3}%`, border: `2px solid ${i === 0 ? s.accent : "#ffffff33"}`, transform: `rotate(${(i - 2) * tension * 2}deg)`}} />
      ))}
      <div style={{position: "absolute", inset: s.vertical ? `${11 + crop * 0.4}% 10% 31%` : `${9 + crop * 0.3}% 27% 15%`, transform: `scale(${1 + tension * 0.5 - release * 0.5})`}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 900, letterSpacing: 5}}>PRESSURE / {Math.round(tension * 100)}</div>
      <div style={{position: "absolute", inset: 0, background: s.template.background, color: s.template.foreground, opacity: release, padding: "7%", display: "grid", gridTemplateColumns: s.vertical ? "1fr" : ".9fr 1.1fr", alignItems: "center", gap: 35}}>
        <div style={{height: s.vertical ? "55%" : "76%"}}><Product src={props.imageSrc} /></div>
        <Copy scene={s} />
      </div>
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch9: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "curtain-call":
      return <CurtainCall {...props} />;
    case "stage-flats":
      return <StageFlats {...props} />;
    case "frame-step":
      return <FrameStep {...props} />;
    case "projection-room":
      return <ProjectionRoom {...props} />;
    case "silhouette-trace":
      return <SilhouetteTrace {...props} />;
    case "object-choreography":
      return <ObjectChoreography {...props} />;
    case "five-beat-film":
      return <FiveBeatFilm {...props} />;
    case "worlds-around-object":
      return <WorldsAroundObject {...props} />;
    case "living-still":
      return <LivingStill {...props} />;
    case "tension-release":
      return <TensionRelease {...props} />;
    default:
      return null;
  }
};

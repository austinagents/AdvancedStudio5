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

const range = (
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

const Product: React.FC<{src: string; style?: React.CSSProperties}> = ({
  src,
  style,
}) =>
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
  centered?: boolean;
  style?: React.CSSProperties;
}> = ({scene, light = false, centered = false, style}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: centered ? "center" : "flex-start",
      textAlign: centered ? "center" : "left",
      color: light ? "#fff" : scene.template.foreground,
      ...style,
    }}
  >
    <span
      style={{
        color: scene.accent,
        fontSize: 15,
        fontWeight: 950,
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
        lineHeight: 0.87,
        letterSpacing: -3,
      }}
    >
      {scene.headline}
    </strong>
    <span
      style={{
        maxWidth: 590,
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

const EndFrame: React.FC<{
  scene: Scene;
  src: string;
  opacity: number;
  reverse?: boolean;
}> = ({scene, src, opacity, reverse = false}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "grid",
      gridTemplateColumns: scene.vertical ? "1fr" : reverse ? "1.1fr .9fr" : ".9fr 1.1fr",
      alignItems: "center",
      gap: 36,
      padding: "7%",
      background: scene.template.background,
      color: scene.template.foreground,
      opacity,
      zIndex: 8,
    }}
  >
    <div
      style={{
        height: scene.vertical ? "56%" : "76%",
        gridColumn: !scene.vertical && reverse ? 2 : undefined,
        gridRow: !scene.vertical && reverse ? 1 : undefined,
      }}
    >
      <Product src={src} />
    </div>
    <Copy scene={scene} />
  </div>
);

const ReverseReveal: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const opening = range(s.frame, [0, 38, 48, 58], [1, 1, 0, 0]);
  const returnFrame = range(s.frame, [225, 270], [0, 1]);
  const reverse = range(s.frame, [45, 210], [1, 0]);
  return (
    <AbsoluteFill style={{background: s.template.surface, color: "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", inset: `${10 + reverse * 20}%`, border: `2px solid ${s.accent}`, transform: `rotate(${reverse * 9}deg)`}} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: "absolute", inset: s.vertical ? "18% 12% 28%" : "13% 28% 13%", transform: `translate(${(i - 1) * reverse * 150}px, ${(i - 1) * reverse * -60}px) scale(${1 - i * reverse * 0.08})`, opacity: 1 - i * 0.22}}>
          <Product src={props.imageSrc} />
        </div>
      ))}
      <div style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 950, letterSpacing: 5}}>REWIND / {Math.round(reverse * 100)}</div>
      <EndFrame scene={s} src={props.imageSrc} opacity={Math.max(opening, returnFrame)} />
    </AbsoluteFill>
  );
};

const FalseEnding: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const fakeEnd = range(s.frame, [75, 105, 135, 145], [0, 1, 1, 0]);
  const blackout = range(s.frame, [140, 150, 165, 178], [0, 1, 1, 0]);
  const returnIn = spring({fps: s.fps, frame: s.frame - 168, config: {damping: 16, stiffness: 90}});
  const finalCopy = range(s.frame, [215, 252], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", inset: s.vertical ? "13% 10% 24%" : "9% 25% 10%", transform: `scale(${0.78 + returnIn * 0.22})`, opacity: s.frame < 75 ? 1 : returnIn}}>
        <Product src={props.imageSrc} style={{filter: `drop-shadow(0 0 40px ${s.accent}55)`}} />
      </div>
      <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", background: s.template.surface, opacity: fakeEnd}}>
        <div style={{textAlign: "center"}}>
          <b style={{color: s.accent, letterSpacing: 5}}>END / 01</b>
          <div style={{fontSize: s.vertical ? 82 : 68, fontWeight: 950, marginTop: 18}}>That was the reveal.</div>
        </div>
      </div>
      <div style={{position: "absolute", inset: 0, background: "#000", opacity: blackout, zIndex: 5}} />
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "6%", opacity: finalCopy}}>
        <Copy scene={s} light />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 950, letterSpacing: 5}}>ENDING / 02</div>
    </AbsoluteFill>
  );
};

const DualTimeline: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const merge = range(s.frame, [190, 245], [0, 1]);
  const calmShift = Math.sin(s.frame / 38) * 5;
  const energyShift = Math.sin(s.frame / 5) * 18;
  return (
    <AbsoluteFill style={{background: s.template.background, color: s.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${50 + merge * 50}%`, background: s.template.background, overflow: "hidden", zIndex: 2}}>
        <div style={{position: "absolute", inset: s.vertical ? "15% 5% 31%" : "12% 16% 14%", transform: `translateY(${calmShift}px)`}}>
          <Product src={props.imageSrc} />
        </div>
        <span style={{position: "absolute", left: "7%", top: "6%", color: s.accent, fontWeight: 950, letterSpacing: 5}}>CALM / 01</span>
      </div>
      <div style={{position: "absolute", right: 0, top: 0, bottom: 0, width: `${50 - merge * 50}%`, background: s.template.surface, overflow: "hidden"}}>
        <div style={{position: "absolute", inset: s.vertical ? "15% 5% 31%" : "12% 16% 14%", transform: `translate(${energyShift}px, ${-energyShift * 0.4}px) rotate(${energyShift * 0.12}deg)`}}>
          <Product src={props.imageSrc} style={{filter: "contrast(1.1) saturate(1.15)"}} />
        </div>
        <span style={{position: "absolute", right: "7%", top: "6%", color: "#fff", fontWeight: 950, letterSpacing: 5}}>ENERGY / 02</span>
      </div>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "5%", zIndex: 4, opacity: merge}}>
        <Copy scene={s} />
      </div>
    </AbsoluteFill>
  );
};

const FlashbulbEditorial: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const shot = Math.min(4, Math.floor(s.frame / 55));
  const local = s.frame - shot * 55;
  const flash = range(local, [0, 3, 10, 18], [0, 1, 0.15, 0]);
  const poses = [
    ["12%", "18%", "52%", "62%", "-4deg"],
    ["42%", "11%", "46%", "72%", "3deg"],
    ["18%", "7%", "64%", "82%", "0deg"],
    ["7%", "22%", "48%", "60%", "-2deg"],
    ["26%", "13%", "50%", "68%", "0deg"],
  ] as const;
  const pose = poses[shot];
  const final = range(s.frame, [230, 270], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: s.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", left: pose[0], top: pose[1], width: pose[2], height: pose[3], transform: `rotate(${pose[4]})`, border: "18px solid #f7f3eb", boxShadow: "0 25px 45px #0003"}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", left: "5%", top: "5%", fontWeight: 950, letterSpacing: 5}}>CAMPAIGN / 0{shot + 1}</div>
      <div style={{position: "absolute", inset: 0, background: "#fff", opacity: flash, zIndex: 4}} />
      <EndFrame scene={s} src={props.imageSrc} opacity={final} reverse />
    </AbsoluteFill>
  );
};

const InvisibleCut: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const scene = Math.min(2, Math.floor(s.frame / 86));
  const local = s.frame - scene * 86;
  const wipe = range(local, [50, 85], [-25, 125]);
  const layouts = [
    {left: "9%", top: "16%", width: "45%", height: "65%"},
    {left: "47%", top: "9%", width: "46%", height: "78%"},
    {left: "24%", top: "11%", width: "52%", height: "72%"},
  ];
  const layout = layouts[scene];
  const finish = range(s.frame, [240, 275], [0, 1]);
  return (
    <AbsoluteFill style={{background: scene === 1 ? s.template.surface : s.template.background, color: "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", ...layout}}>
        <Product src={props.imageSrc} style={{filter: "drop-shadow(0 26px 24px #0008)"}} />
      </div>
      <div style={{position: "absolute", left: `${wipe}%`, top: "-15%", width: "30%", height: "135%", background: scene === 0 ? s.accent : scene === 1 ? "#f1ede3" : s.template.surface, transform: "skewX(-12deg)", zIndex: 5}} />
      <span style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 950, letterSpacing: 5}}>CONTINUOUS / 0{scene + 1}</span>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "5%", opacity: finish}}>
        <Copy scene={s} light />
      </div>
    </AbsoluteFill>
  );
};

const SpeedRamp: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const x = interpolate(
    s.frame,
    [0, 75, 84, 150, 159, 225, 234, 299],
    [-24, -24, 22, 22, -8, -8, 0, 0],
    clamp,
  );
  const rotate = interpolate(
    s.frame,
    [0, 75, 84, 150, 159, 225, 234, 299],
    [-3, -3, 4, 4, -2, -2, 0, 0],
    clamp,
  );
  const moving =
    (s.frame >= 75 && s.frame <= 84) ||
    (s.frame >= 150 && s.frame <= 159) ||
    (s.frame >= 225 && s.frame <= 234);
  const finish = range(s.frame, [235, 270], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: s.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 24, border: `2px solid ${s.template.foreground}`}} />
      <div style={{position: "absolute", inset: s.vertical ? "15% 8% 29%" : "11% 26% 12%", transform: `translateX(${x}%) rotate(${rotate}deg)`}}>
        <Product src={props.imageSrc} style={{filter: moving ? "blur(5px)" : "none"}} />
      </div>
      <span style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 950, letterSpacing: 5}}>{moving ? "MOVE / 12F" : "HOLD / PRECISE"}</span>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "5%", opacity: finish}}>
        <Copy scene={s} />
      </div>
    </AbsoluteFill>
  );
};

const CallResponse: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const exchange = Math.min(2, Math.floor(s.frame / 82));
  const local = s.frame - exchange * 82;
  const answer = range(local, [20, 55], [0, 1]);
  const calls = ["CAN IT STAND APART?", "CAN IT HOLD ATTENTION?", "CAN IT DEFINE THE FRAME?"];
  const responses = ["CLEARLY.", "COMPLETELY.", "WITHOUT QUESTION."];
  const finish = range(s.frame, [240, 274], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", left: "6%", right: "6%", top: "8%", fontSize: s.vertical ? 60 : 48, fontWeight: 950, lineHeight: 0.9}}>
        <span style={{color: s.template.muted}}>{calls[exchange]}</span>
        <div style={{marginTop: 18, color: s.accent, opacity: answer, transform: `translateX(${(1 - answer) * 45}px)`}}>{responses[exchange]}</div>
      </div>
      <div style={{position: "absolute", inset: s.vertical ? "28% 10% 16%" : "21% 28% 9%", transform: `translateX(${(1 - answer) * (exchange % 2 ? -18 : 18)}%) scale(${0.86 + answer * 0.14})`}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", inset: 0, background: s.template.surface, opacity: finish, padding: "7%", display: "grid", gridTemplateColumns: s.vertical ? "1fr" : "1fr 1fr", alignItems: "center", gap: 36}}>
        <div style={{height: s.vertical ? "55%" : "76%"}}><Product src={props.imageSrc} /></div>
        <Copy scene={s} light />
      </div>
    </AbsoluteFill>
  );
};

const TheInterruption: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const interrupt = range(s.frame, [95, 135], [0, 1]);
  const takeover = range(s.frame, [135, 195], [0, 1]);
  const finish = range(s.frame, [220, 260], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: s.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: s.vertical ? "15% 12% 26%" : "12% 28% 12%"}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", left: `${-125 + interrupt * 125}%`, top: "34%", width: "120%", height: "28%", background: s.template.surface, color: "#fff", display: "grid", placeItems: "center", transform: "rotate(-7deg)", zIndex: 3}}>
        <strong style={{fontSize: s.vertical ? 84 : 70, letterSpacing: -3}}>WE INTERRUPT THIS AD.</strong>
      </div>
      <div style={{position: "absolute", inset: 0, background: s.template.surface, opacity: takeover, zIndex: 2}} />
      <div style={{position: "absolute", inset: s.vertical ? "13% 10% 28%" : "10% 27% 12%", zIndex: 4, transform: `scale(${0.65 + takeover * 0.35})`}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "5%", zIndex: 5, opacity: finish}}>
        <Copy scene={s} light />
      </div>
    </AbsoluteFill>
  );
};

const Palindrome: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const mirroredFrame = s.frame <= 150 ? s.frame : 300 - s.frame;
  const motion = range(mirroredFrame, [0, 150], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: "absolute", left: `${50 + Math.cos(i * Math.PI / 2) * motion * 36}%`, top: `${48 + Math.sin(i * Math.PI / 2) * motion * 30}%`, width: 90 + i * 16, height: 90 + i * 16, border: `2px solid ${i % 2 ? s.accent : "#ffffff55"}`, transform: `translate(-50%, -50%) rotate(${motion * (i % 2 ? 90 : -90)}deg)`}} />
      ))}
      <div style={{position: "absolute", inset: s.vertical ? "17% 13% 25%" : "13% 31% 13%", transform: `scale(${0.78 + motion * 0.22})`}}>
        <Product src={props.imageSrc} style={{filter: `drop-shadow(0 0 ${motion * 38}px ${s.accent}88)`}} />
      </div>
      <span style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 950, letterSpacing: 5}}>{s.frame <= 150 ? "FORWARD / 01" : "REVERSE / 02"}</span>
      <div style={{position: "absolute", left: "6%", right: "6%", bottom: "5%", opacity: range(mirroredFrame, [95, 140], [0, 1])}}>
        <Copy scene={s} light centered />
      </div>
    </AbsoluteFill>
  );
};

const TheCallback: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const develop = range(s.frame, [35, 210], [0, 1]);
  const resolve = range(s.frame, [210, 260], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: s.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", left: `${8 + develop * 35}%`, top: `${10 + develop * 28}%`, width: `${90 - develop * 52}%`, height: `${8 + develop * 54}%`, border: `18px solid ${s.accent}`, borderRadius: `${develop * 50}%`, transform: `rotate(${develop * 180}deg)`, opacity: 1 - resolve}} />
      <span style={{position: "absolute", left: "5%", top: "5%", color: s.accent, fontWeight: 950, letterSpacing: 5}}>MOTIF / RETURN</span>
      <div style={{position: "absolute", inset: s.vertical ? "16% 11% 26%" : "12% 28% 12%", transform: `scale(${0.82 + develop * 0.18})`}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", inset: `${45 - resolve * 38}%`, border: `5px solid ${s.accent}`, borderRadius: `${(1 - resolve) * 50}%`, opacity: resolve}} />
      <div style={{position: "absolute", left: "8%", right: "8%", bottom: "10%", opacity: resolve}}>
        <Copy scene={s} />
      </div>
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch10: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "reverse-reveal":
      return <ReverseReveal {...props} />;
    case "false-ending":
      return <FalseEnding {...props} />;
    case "dual-timeline":
      return <DualTimeline {...props} />;
    case "flashbulb-editorial":
      return <FlashbulbEditorial {...props} />;
    case "invisible-cut":
      return <InvisibleCut {...props} />;
    case "speed-ramp":
      return <SpeedRamp {...props} />;
    case "call-response":
      return <CallResponse {...props} />;
    case "the-interruption":
      return <TheInterruption {...props} />;
    case "palindrome":
      return <Palindrome {...props} />;
    case "the-callback":
      return <TheCallback {...props} />;
    default:
      return null;
  }
};

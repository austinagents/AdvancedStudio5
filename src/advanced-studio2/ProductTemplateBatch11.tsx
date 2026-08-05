import React from "react";
import {
  AbsoluteFill,
  Easing,
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

const ease = (frame: number, input: [number, number], output: [number, number]) =>
  interpolate(frame, input, output, {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const linear = (
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
      style={{width: "100%", height: "100%", objectFit: "contain", ...style}}
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
  compact?: boolean;
}> = ({scene, align = "left", light = false, style, compact = false}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems:
        align === "center"
          ? "center"
          : align === "right"
            ? "flex-end"
            : "flex-start",
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
        marginTop: compact ? 12 : 20,
        fontSize: compact
          ? scene.vertical
            ? 56
            : 48
          : scene.vertical
            ? 82
            : scene.compact
              ? 60
              : 70,
        lineHeight: 0.88,
        letterSpacing: -3,
      }}
    >
      {scene.headline}
    </strong>
    {!compact ? (
      <>
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
      </>
    ) : null}
  </div>
);

const FrameMagnet: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const x = interpolate(
    s.frame,
    [0, 72, 106, 178, 214, 270],
    [-18, -18, 27, 27, 0, 0],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const y = interpolate(
    s.frame,
    [0, 72, 106, 178, 214, 270],
    [15, 15, -10, -10, 0, 0],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const settle = spring({
    fps: s.fps,
    frame: s.frame - 208,
    config: {damping: 24, stiffness: 105, mass: 0.9},
  });
  const copyX = x * -0.42;
  return (
    <AbsoluteFill
      style={{
        background: s.template.background,
        color: s.template.foreground,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${50 + copyX}%`,
          top: s.vertical ? "9%" : "8%",
          transform: "translateX(-50%)",
          width: "88%",
        }}
      >
        <Copy scene={s} compact align="center" />
      </div>
      <div
        style={{
          position: "absolute",
          left: `${50 + x}%`,
          top: `${48 + y}%`,
          width: s.vertical ? "78%" : "55%",
          height: s.vertical ? "53%" : "64%",
          transform: `translate(-50%, -50%) scale(${0.9 + settle * 0.1})`,
          filter: "drop-shadow(0 30px 26px #0003)",
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <div
        style={{
          position: "absolute",
          right: "5%",
          bottom: "5%",
          color: s.accent,
          fontWeight: 900,
          letterSpacing: 4,
          transform: `translateX(${(1 - settle) * 50}px)`,
          opacity: settle,
        }}
      >
        {s.cta} →
      </div>
    </AbsoluteFill>
  );
};

const NegativeSpace: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const anticipation = ease(s.frame, [25, 175], [0, 1]);
  const arrival = spring({
    fps: s.fps,
    frame: s.frame - 174,
    config: {damping: 26, stiffness: 92, mass: 1.05},
  });
  const reservedX = s.vertical ? 50 : 67;
  return (
    <AbsoluteFill
      style={{
        background: s.template.background,
        color: s.template.foreground,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "7%",
          top: s.vertical ? "9%" : "12%",
          width: s.vertical ? "86%" : "42%",
          transform: `translateY(${-anticipation * 18}px)`,
        }}
      >
        <Copy scene={s} light />
      </div>
      <div
        style={{
          position: "absolute",
          left: `${reservedX}%`,
          top: s.vertical ? "60%" : "50%",
          width: s.vertical ? "74%" : "48%",
          height: s.vertical ? "47%" : "66%",
          transform: `translate(${(1 - arrival) * 115 - 50}%, -50%) scale(${0.92 + arrival * 0.08})`,
          opacity: arrival,
          filter: `drop-shadow(${(1 - arrival) * 55}px 30px 28px #0008)`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <div
        style={{
          position: "absolute",
          left: `${reservedX}%`,
          bottom: "6%",
          transform: `translateX(-50%) scaleX(${anticipation})`,
          width: s.vertical ? "72%" : "45%",
          height: 3,
          background: s.accent,
          transformOrigin: "center",
        }}
      />
    </AbsoluteFill>
  );
};

const ScaleRelay: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const first = ease(s.frame, [0, 86], [0, 1]);
  const second = ease(s.frame, [86, 176], [0, 1]);
  const third = ease(s.frame, [176, 258], [0, 1]);
  const scale = first < 1 ? 2.3 - first * 0.75 : second < 1 ? 1.55 - second * 0.9 : 0.65 + third * 0.35;
  const x = first < 1 ? -22 + first * 22 : second < 1 ? second * 25 : 25 - third * 25;
  const copyReveal = ease(s.frame, [218, 268], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        background: s.template.background,
        color: s.template.foreground,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${50 + x}%`,
          top: s.vertical ? "54%" : "50%",
          width: s.vertical ? "75%" : "52%",
          height: s.vertical ? "53%" : "66%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: second < 1 ? "65% 42%" : "50% 50%",
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <span
        style={{
          position: "absolute",
          left: "5%",
          top: "5%",
          color: s.accent,
          fontWeight: 900,
          letterSpacing: 5,
        }}
      >
        {s.frame < 86 ? "DETAIL / 01" : s.frame < 176 ? "FORM / 02" : "PRESENCE / 03"}
      </span>
      <Copy
        scene={s}
        compact
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          bottom: "6%",
          opacity: copyReveal,
          transform: `translateY(${(1 - copyReveal) * 26}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Blindside: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const passOne = ease(s.frame, [12, 88], [-78, 178]);
  const passTwo = ease(s.frame, [96, 178], [168, -88]);
  const hero = spring({
    fps: s.fps,
    frame: s.frame - 150,
    config: {damping: 25, stiffness: 88},
  });
  const copy = ease(s.frame, [205, 258], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          inset: s.vertical ? "18% 12% 25%" : "12% 28% 11%",
          transform: `scale(${0.82 + hero * 0.18})`,
          opacity: hero,
          filter: `drop-shadow(0 0 ${hero * 34}px ${s.accent}55)`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      {[{x: passOne, scale: 2.8, top: "42%"}, {x: passTwo, scale: 3.4, top: "58%"}].map((item, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${item.x}%`,
            top: item.top,
            width: "48%",
            height: "62%",
            transform: `translate(-50%, -50%) scale(${item.scale})`,
            filter: "brightness(.72) blur(1px)",
            zIndex: 3,
          }}
        >
          <Product src={props.imageSrc} />
        </div>
      ))}
      <Copy
        scene={s}
        light
        compact
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          bottom: "6%",
          opacity: copy,
          transform: `translateY(${(1 - copy) * 34}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Counterweight: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const motion = ease(s.frame, [18, 205], [0, 1]);
  const settle = spring({
    fps: s.fps,
    frame: s.frame - 202,
    config: {damping: 30, stiffness: 110},
  });
  const productX = -20 + motion * 40;
  const copyX = 23 - motion * 45;
  const productY = Math.sin(motion * Math.PI) * -8;
  return (
    <AbsoluteFill
      style={{
        background: s.template.background,
        color: s.template.foreground,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${50 + productX}%`,
          top: `${52 + productY}%`,
          width: s.vertical ? "72%" : "48%",
          height: s.vertical ? "50%" : "66%",
          transform: "translate(-50%, -50%)",
          filter: "drop-shadow(0 30px 28px #0004)",
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        align={s.vertical ? "center" : "left"}
        style={{
          position: "absolute",
          left: `${50 + copyX}%`,
          top: s.vertical ? "10%" : "50%",
          width: s.vertical ? "82%" : "43%",
          transform: s.vertical ? "translate(-50%, 0)" : "translate(-50%, -50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          bottom: "5%",
          height: 3,
          background: `linear-gradient(90deg, ${s.accent} ${50 + productX * 0.4}%, ${s.template.foreground} ${50 + productX * 0.4}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const EchoExit: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const travel = ease(s.frame, [20, 185], [0, 1]);
  const resolve = ease(s.frame, [188, 258], [0, 1]);
  const positions = [-30, -15, 0, 15, 30];
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      {positions.map((offset, index) => {
        const distance = Math.abs(index - 2);
        const peel = resolve * offset * 3.8;
        return (
          <div
            key={offset}
            style={{
              position: "absolute",
              left: `${50 + offset * travel + peel}%`,
              top: `${50 + Math.sin((travel + index * 0.12) * Math.PI) * (index - 2) * 3}%`,
              width: s.vertical ? "62%" : "40%",
              height: s.vertical ? "48%" : "62%",
              transform: `translate(-50%, -50%) scale(${
                0.88 + index * 0.03 + (index === 2 ? resolve * 0.62 : 0)
              })`,
              opacity: index === 2 ? 1 : (1 - distance * 0.16) * (1 - resolve),
              filter: index === 2 ? "drop-shadow(0 26px 24px #0007)" : `saturate(.7) brightness(${0.7 + index * 0.08})`,
            }}
          >
            <Product src={props.imageSrc} />
          </div>
        );
      })}
      <Copy
        scene={s}
        light
        compact
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "6%",
          opacity: resolve,
          transform: `translateY(${(1 - resolve) * 30}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const WordmarkPassage: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const passage = ease(s.frame, [18, 218], [0, 1]);
  const resolve = ease(s.frame, [218, 272], [0, 1]);
  const wordX = 118 - passage * 176 + resolve * 8;
  const productScale = 0.84 + passage * 0.16;
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: `${wordX}%`,
          top: "43%",
          whiteSpace: "nowrap",
          transform: "translate(-50%, -50%)",
          fontSize: s.vertical ? 178 : 145,
          fontWeight: 950,
          letterSpacing: -10,
          color: s.template.muted,
          opacity: 0.42,
        }}
      >
        {s.headline.toUpperCase()}
      </div>
      <div
        style={{
          position: "absolute",
          inset: s.vertical ? "18% 12% 25%" : "12% 28% 11%",
          transform: `scale(${productScale})`,
          filter: "drop-shadow(0 32px 28px #0008)",
          zIndex: 2,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <div
        style={{
          position: "absolute",
          left: `${wordX + 8}%`,
          top: "58%",
          whiteSpace: "nowrap",
          transform: "translate(-50%, -50%)",
          fontSize: s.vertical ? 110 : 86,
          fontWeight: 950,
          letterSpacing: -5,
          color: s.accent,
          mixBlendMode: "screen",
          zIndex: 1,
        }}
      >
        {s.eyebrow}
      </div>
      <div
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          bottom: "5%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          opacity: resolve,
        }}
      >
        <span style={{maxWidth: "62%", color: s.template.muted}}>{s.subheadline}</span>
        <b style={{color: s.accent}}>{s.cta} →</b>
      </div>
    </AbsoluteFill>
  );
};

const StillPoint: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const orbit = ease(s.frame, [0, 238], [0, 1]);
  const resolve = ease(s.frame, [228, 278], [0, 1]);
  const cropX = Math.sin(orbit * Math.PI * 2) * 42;
  const cropY = Math.cos(orbit * Math.PI * 2) * 25;
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: `${50 + cropX}%`,
          top: `${50 + cropY}%`,
          width: "50%",
          height: "65%",
          transform: "translate(-50%, -50%) scale(2.65)",
          opacity: 0.2 * (1 - resolve),
          filter: "blur(2px)",
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: s.vertical ? "18% 12% 25%" : "12% 29% 12%",
          filter: "drop-shadow(0 28px 25px #0007)",
          zIndex: 2,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <div
        style={{
          position: "absolute",
          left: `${8 + orbit * 48 - resolve * 48}%`,
          top: `${8 + Math.sin(orbit * Math.PI) * 28}%`,
          width: s.vertical ? "84%" : "52%",
          zIndex: 3,
        }}
      >
        <Copy scene={s} light compact />
      </div>
      <b
        style={{
          position: "absolute",
          right: "6%",
          bottom: "6%",
          color: s.accent,
          opacity: resolve,
          letterSpacing: 3,
          zIndex: 4,
        }}
      >
        {s.cta} →
      </b>
    </AbsoluteFill>
  );
};

const ContourCut: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const shot = Math.min(3, Math.floor(s.frame / 68));
  const local = s.frame - shot * 68;
  const settle = ease(local, [0, 54], [0, 1]);
  const layouts = [
    {x: 24, y: 48, scale: 2.2},
    {x: 70, y: 35, scale: 1.65},
    {x: 38, y: 64, scale: 1.28},
    {x: 50, y: 50, scale: 1},
  ];
  const layout = layouts[shot];
  const finish = ease(s.frame, [230, 278], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        background: shot % 2 ? s.template.surface : s.template.background,
        color: shot % 2 ? "#fff" : s.template.foreground,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${layout.x}%`,
          top: `${layout.y}%`,
          width: s.vertical ? "74%" : "52%",
          height: s.vertical ? "54%" : "68%",
          transform: `translate(-50%, -50%) scale(${layout.scale + (1 - settle) * 0.08})`,
          transformOrigin: `${100 - layout.x}% ${100 - layout.y}%`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <span
        style={{
          position: "absolute",
          left: "5%",
          top: "5%",
          color: s.accent,
          fontWeight: 900,
          letterSpacing: 5,
        }}
      >
        CONTOUR / 0{shot + 1}
      </span>
      <Copy
        scene={s}
        compact
        light={shot % 2 === 1}
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          bottom: "6%",
          opacity: finish,
          transform: `translateX(${(1 - finish) * -45}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const LastOneStanding: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const stage = Math.min(3, Math.floor(s.frame / 72));
  const counts = [7, 5, 3, 1];
  const count = counts[stage];
  const local = s.frame - stage * 72;
  const settle = spring({
    fps: s.fps,
    frame: local,
    config: {damping: 28, stiffness: 120},
  });
  const finish = ease(s.frame, [220, 276], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, color: "#fff", overflow: "hidden"}}>
      {Array.from({length: count}).map((_, index) => {
        const centered = index - (count - 1) / 2;
        const columns = s.vertical ? Math.min(count, 3) : count;
        const row = Math.floor(index / columns);
        const column = index % columns;
        const centeredColumn = column - (Math.min(count, columns) - 1) / 2;
        return (
          <div
            key={`${stage}-${index}`}
            style={{
              position: "absolute",
              left: `${50 + centeredColumn * (s.vertical ? 25 : 13) * settle}%`,
              top: `${49 + (s.vertical ? row * 21 - (count > 3 ? 10 : 0) : Math.abs(centered) * 2)}%`,
              width: s.vertical ? "27%" : "17%",
              height: s.vertical ? "27%" : "48%",
              transform: `translate(-50%, -50%) scale(${count === 1 ? 3.2 : 0.78 + settle * 0.22})`,
              opacity: count === 1 ? 1 : 0.62 + (1 - Math.abs(centered) / count) * 0.38,
              filter: index === Math.floor(count / 2) ? "none" : "saturate(.65) brightness(.8)",
            }}
          >
            <Product src={props.imageSrc} />
          </div>
        );
      })}
      <span
        style={{
          position: "absolute",
          left: "5%",
          top: "5%",
          color: s.accent,
          fontWeight: 900,
          letterSpacing: 5,
        }}
      >
        {String(count).padStart(2, "0")} / REMAIN
      </span>
      <Copy
        scene={s}
        light
        compact
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "6%",
          opacity: finish,
          transform: `translateY(${(1 - finish) * 28}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch11: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "frame-magnet":
      return <FrameMagnet {...props} />;
    case "negative-space":
      return <NegativeSpace {...props} />;
    case "scale-relay":
      return <ScaleRelay {...props} />;
    case "blindside":
      return <Blindside {...props} />;
    case "counterweight":
      return <Counterweight {...props} />;
    case "echo-exit":
      return <EchoExit {...props} />;
    case "wordmark-passage":
      return <WordmarkPassage {...props} />;
    case "still-point":
      return <StillPoint {...props} />;
    case "contour-cut":
      return <ContourCut {...props} />;
    case "last-one-standing":
      return <LastOneStanding {...props} />;
    default:
      return null;
  }
};

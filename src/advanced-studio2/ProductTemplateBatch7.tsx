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
const move = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, clamp);

const useAd = (props: ProductVideoProps) => {
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
    vertical: config.height / config.width > 1.55,
    compact: config.height / config.width < 1.15,
  };
};

type Ad = ReturnType<typeof useAd>;

const Product: React.FC<{
  src: string;
  accent: string;
  style?: React.CSSProperties;
}> = ({src, accent, style}) =>
  src ? (
    <Img
      src={src}
      style={{width: "100%", height: "100%", objectFit: "contain", ...style}}
    />
  ) : (
    <div
      style={{
        width: "72%",
        height: "68%",
        display: "grid",
        placeItems: "center",
        border: `2px dashed ${accent}`,
        color: accent,
        fontWeight: 850,
        letterSpacing: 3,
        ...style,
      }}
    >
      UPLOAD PRODUCT
    </div>
  );

const EndCopy: React.FC<{
  v: Ad;
  dark?: boolean;
  align?: "left" | "center";
}> = ({v, dark = false, align = "left"}) => {
  const opacity = move(v.frame, [224, 258], [0, 1]);
  const y = move(v.frame, [224, 270], [34, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: "6%",
        right: "6%",
        bottom: "5%",
        opacity,
        transform: `translateY(${y}px)`,
        color: dark ? "#171513" : v.template.foreground,
        textAlign: align,
        display: v.vertical || align === "center" ? "block" : "grid",
        gridTemplateColumns: "1.35fr .82fr",
        gap: 34,
        alignItems: "end",
      }}
    >
      <div
        style={{
          fontSize: v.vertical ? 80 : v.compact ? 58 : 68,
          lineHeight: 0.88,
          letterSpacing: -3,
          fontWeight: 850,
        }}
      >
        {v.headline}
      </div>
      <div
        style={{
          marginTop: v.vertical || align === "center" ? 22 : 0,
          maxWidth: align === "center" ? 620 : undefined,
          marginLeft: align === "center" ? "auto" : undefined,
          marginRight: align === "center" ? "auto" : undefined,
        }}
      >
        <div
          style={{
            color: dark ? "#6c655d" : v.template.muted,
            fontSize: v.vertical ? 24 : 19,
            lineHeight: 1.35,
          }}
        >
          {v.subheadline}
        </div>
        <div style={{marginTop: 16, color: v.accent, fontWeight: 850}}>
          {v.cta} →
        </div>
      </div>
    </div>
  );
};

const Eyebrow: React.FC<{v: Ad; dark?: boolean; text?: string}> = ({
  v,
  dark = false,
  text,
}) => (
  <div
    style={{
      position: "absolute",
      left: "5%",
      top: "5%",
      color: dark ? v.template.foreground : v.accent,
      fontSize: 16,
      fontWeight: 900,
      letterSpacing: 4,
    }}
  >
    {text || v.eyebrow}
  </div>
);

const LuxuryObject: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const light = move(v.frame, [0, 185], [-25, 115]);
  const scale = move(v.frame, [0, 185, 225], [1.6, 0.92, 0.82]);
  const settle = spring({
    fps: v.fps,
    frame: v.frame - 24,
    config: {damping: 24, stiffness: 62},
  });
  return (
    <AbsoluteFill style={{background: "#050505", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(108deg,transparent ${light - 14}%,#f6e6bd55 ${light}%,transparent ${light + 13}%)`,
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: v.vertical ? "39%" : "46%",
          width: v.vertical ? "78%" : "59%",
          height: v.vertical ? "58%" : "82%",
          transform: `translate(-50%,-50%) scale(${scale * (0.92 + settle * 0.08)})`,
          filter: "drop-shadow(0 55px 70px #000)",
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <div style={{position: "absolute", left: "16%", right: "16%", bottom: "4%", height: "17%", background: "radial-gradient(ellipse,#c9a35d22,transparent 65%)"}} />
      <Eyebrow v={v} />
      <div style={{position: "absolute", inset: 0, opacity: move(v.frame, [212, 248], [0, 1]), background: "linear-gradient(transparent 56%,#050505fa 89%)"}} />
      <EndCopy v={v} />
    </AbsoluteFill>
  );
};

const BeautyRitual: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const drift = move(v.frame, [0, 220], [-8, 6]);
  const bloom = move(v.frame, [0, 170], [0.72, 1.12]);
  return (
    <AbsoluteFill style={{background: "linear-gradient(145deg,#fff7f3,#edc7ce)", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: "-12%",
          top: "-20%",
          width: "72%",
          aspectRatio: 1,
          borderRadius: "50%",
          background: "#fff8",
          filter: "blur(14px)",
          transform: `scale(${bloom})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-18%",
          bottom: "-20%",
          width: "74%",
          aspectRatio: 1,
          borderRadius: "50%",
          border: "90px solid #d65d8620",
          transform: `translateY(${drift}%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: v.vertical ? "50%" : "66%",
          top: v.vertical ? "39%" : "47%",
          width: v.vertical ? "74%" : "52%",
          height: v.vertical ? "57%" : "78%",
          transform: `translate(-50%,-50%) translateY(${drift}px) scale(${move(v.frame, [0, 220], [0.88, 1])})`,
          filter: "drop-shadow(34px 50px 42px #7d445144)",
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "7%",
          top: v.vertical ? "8%" : "22%",
          width: v.vertical ? "80%" : "34%",
          color: v.template.foreground,
          opacity: move(v.frame, [40, 84, 190, 216], [0, 1, 1, 0]),
        }}
      >
        <div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 72 : 64, lineHeight: 0.95}}>
          A quiet moment,<br />made luminous.
        </div>
      </div>
      <Eyebrow v={v} dark />
      <div style={{position: "absolute", inset: 0, opacity: move(v.frame, [214, 248], [0, 1]), background: "linear-gradient(transparent 55%,#fff7f3fa 90%)"}} />
      <EndCopy v={v} dark />
    </AbsoluteFill>
  );
};

const PerformanceEngine: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const charge = move(v.frame, [0, 68], [0, 1]);
  const launch = move(v.frame, [68, 112], [-72, 18]);
  const lock = spring({
    fps: v.fps,
    frame: v.frame - 108,
    config: {damping: 18, stiffness: 105},
  });
  const speed = move(v.frame, [45, 120, 160], [0, 1, 0]);
  return (
    <AbsoluteFill style={{background: v.template.background, overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.24,
          backgroundImage: `linear-gradient(${v.accent}22 1px,transparent 1px),linear-gradient(90deg,${v.accent}22 1px,transparent 1px)`,
          backgroundSize: "68px 68px",
          transform: `skewX(-8deg) translateX(${speed * -30}px)`,
        }}
      />
      {Array.from({length: 8}).map((_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${-10 + index * 16}%`,
            top: `${18 + index * 8}%`,
            width: `${25 + speed * 25}%`,
            height: 3,
            background: v.accent,
            opacity: speed * (0.16 + (index % 3) * 0.12),
            transform: "rotate(-12deg)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: v.vertical ? "41%" : "47%",
          width: v.vertical ? "80%" : "62%",
          height: v.vertical ? "62%" : "84%",
          transform: `translate(calc(-50% + ${launch * speed}%),-50%) scale(${0.78 + charge * 0.13 + lock * 0.08}) rotate(${(1 - lock) * -3}deg)`,
          filter: `drop-shadow(${speed * -40}px 45px 46px #000)`,
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <Eyebrow v={v} />
      <div style={{position: "absolute", right: "5%", top: "5%", color: v.accent, fontFamily: "monospace"}}>
        OUTPUT {Math.round(move(v.frame, [0, 150], [0, 100]))}%
      </div>
      <div style={{position: "absolute", inset: 0, opacity: move(v.frame, [218, 252], [0, 1]), background: "linear-gradient(transparent 55%,#080b09fa 90%)"}} />
      <EndCopy v={v} />
    </AbsoluteFill>
  );
};

const TechnologyKeynote: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const open = move(v.frame, [0, 120], [0, 1]);
  const push = move(v.frame, [0, 220], [0.76, 1.03]);
  return (
    <AbsoluteFill style={{background: "linear-gradient(180deg,#05060b,#0e1324)", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "-22%",
          width: v.vertical ? "130%" : "92%",
          aspectRatio: 1,
          borderRadius: "50%",
          border: `2px solid ${v.accent}44`,
          transform: "translateX(-50%) rotateX(68deg)",
          boxShadow: `inset 0 0 90px ${v.accent}18`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: `${28 + open * 42}%`,
          height: "73%",
          background: `linear-gradient(180deg,${v.accent}25,transparent)`,
          clipPath: "polygon(43% 0,57% 0,100% 100%,0 100%)",
          transform: "translateX(-50%)",
          filter: "blur(8px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: v.vertical ? "39%" : "45%",
          width: v.vertical ? "76%" : "56%",
          height: v.vertical ? "58%" : "78%",
          transform: `translate(-50%,-50%) scale(${push})`,
          filter: `drop-shadow(0 0 ${32 + open * 30}px ${v.accent}55)`,
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <Eyebrow v={v} />
      <div style={{position: "absolute", inset: 0, opacity: move(v.frame, [212, 248], [0, 1]), background: "linear-gradient(transparent 54%,#070910fa 89%)"}} />
      <EndCopy v={v} align="center" />
    </AbsoluteFill>
  );
};

const TabletopAppetite: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const land = spring({
    fps: v.fps,
    frame: v.frame - 22,
    config: {damping: 15, stiffness: 92, mass: 1.1},
  });
  const pan = move(v.frame, [70, 205], [-7, 5]);
  return (
    <AbsoluteFill style={{background: "linear-gradient(150deg,#f5d79f,#d89a5a)", overflow: "hidden"}}>
      <div style={{position: "absolute", left: "-15%", right: "-15%", bottom: "-18%", height: "50%", background: "#9d4d2f", transform: "rotate(-4deg)", boxShadow: "0 -40px 80px #6c2f1f33"}} />
      <div style={{position: "absolute", left: "8%", top: "17%", width: "24%", aspectRatio: 1, borderRadius: "50%", background: "#f7e4b5", boxShadow: "inset -20px -18px 28px #c7844d55"}} />
      <div
        style={{
          position: "absolute",
          left: v.vertical ? "50%" : "65%",
          top: v.vertical ? "42%" : "49%",
          width: v.vertical ? "76%" : "55%",
          height: v.vertical ? "58%" : "80%",
          transform: `translate(-50%,calc(-50% + ${(1 - land) * -180}px)) translateX(${pan}%) rotate(${(1 - land) * -6}deg) scale(${0.88 + land * 0.12})`,
          filter: "drop-shadow(45px 55px 38px #5e2c1f66)",
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "6%",
          top: v.vertical ? "9%" : "34%",
          width: v.vertical ? "80%" : "35%",
          color: v.template.foreground,
          opacity: move(v.frame, [52, 88, 190, 215], [0, 1, 1, 0]),
          fontFamily: "Georgia,serif",
          fontSize: v.vertical ? 70 : 62,
          lineHeight: 0.95,
        }}
      >
        Made to become<br />a favorite.
      </div>
      <Eyebrow v={v} dark />
      <div style={{position: "absolute", inset: 0, opacity: move(v.frame, [215, 248], [0, 1]), background: "linear-gradient(transparent 55%,#f5d79ffa 90%)"}} />
      <EndCopy v={v} dark />
    </AbsoluteFill>
  );
};

const FashionCampaign: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const cut = Math.min(2, Math.floor(v.frame / 72));
  const final = move(v.frame, [216, 252], [0, 1]);
  const scales = [2.15, 1.46, 0.94];
  const positions = [-18, 18, 0];
  return (
    <AbsoluteFill style={{background: v.template.background, overflow: "hidden"}}>
      <div style={{position: "absolute", right: "-8%", top: "-6%", width: "46%", height: "112%", background: v.accent, transform: "skewX(-8deg)"}} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "47%",
          width: v.vertical ? "82%" : "62%",
          height: v.vertical ? "66%" : "88%",
          transform: `translate(calc(-50% + ${positions[cut]}%),-50%) scale(${scales[cut]})`,
          filter: "drop-shadow(38px 48px 35px #4c403455)",
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "4%",
          top: "11%",
          fontFamily: "Georgia,serif",
          fontStyle: "italic",
          fontSize: v.vertical ? 150 : 120,
          color: "#171410",
          opacity: cut === 1 ? 0.9 : 0.12,
          transform: "rotate(-7deg)",
        }}
      >
        EDIT
      </div>
      <Eyebrow v={v} dark text={`THE SEASON / FRAME 0${cut + 1}`} />
      <div style={{position: "absolute", inset: 0, opacity: final, background: "linear-gradient(transparent 55%,#ded7cafa 90%)"}} />
      <EndCopy v={v} dark />
    </AbsoluteFill>
  );
};

const HomeEditorial: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const sun = move(v.frame, [0, 220], [-14, 22]);
  const drift = move(v.frame, [0, 220], [-5, 3]);
  return (
    <AbsoluteFill style={{background: "linear-gradient(180deg,#eee9e1,#d3c8b8)", overflow: "hidden"}}>
      <div style={{position: "absolute", left: "7%", right: "7%", top: "9%", bottom: "10%", background: "#f6f2eb", boxShadow: "0 28px 70px #675b4c33"}} />
      <div
        style={{
          position: "absolute",
          left: `${18 + sun}%`,
          top: "9%",
          width: "32%",
          height: "81%",
          background: "#c8ad8655",
          transform: "skewX(-20deg)",
          filter: "blur(2px)",
        }}
      />
      <div style={{position: "absolute", left: "7%", right: "7%", bottom: "10%", height: 4, background: "#8c7c6855"}} />
      <div
        style={{
          position: "absolute",
          left: v.vertical ? "50%" : "65%",
          top: v.vertical ? "41%" : "47%",
          width: v.vertical ? "72%" : "52%",
          height: v.vertical ? "57%" : "78%",
          transform: `translate(-50%,-50%) translateX(${drift}%)`,
          filter: "drop-shadow(40px 52px 38px #5c4d3f55)",
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "11%",
          top: v.vertical ? "10%" : "26%",
          width: v.vertical ? "74%" : "30%",
          color: v.template.foreground,
          opacity: move(v.frame, [35, 76, 190, 215], [0, 1, 1, 0]),
        }}
      >
        <div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 70 : 60, lineHeight: 1}}>
          Designed to live<br />beautifully.
        </div>
      </div>
      <Eyebrow v={v} dark />
      <div style={{position: "absolute", inset: 0, opacity: move(v.frame, [214, 248], [0, 1]), background: "linear-gradient(transparent 54%,#f0ebe3fa 90%)"}} />
      <EndCopy v={v} dark />
    </AbsoluteFill>
  );
};

const OutdoorProven: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const pull = move(v.frame, [0, 220], [1.34, 0.94]);
  return (
    <AbsoluteFill style={{background: "linear-gradient(180deg,#283936,#84917b 54%,#323a2e 55%)", overflow: "hidden"}}>
      {[0, 1, 2].map((layer) => (
        <div
          key={layer}
          style={{
            position: "absolute",
            left: `${-15 + layer * 24}%`,
            right: `${45 - layer * 16}%`,
            bottom: `${23 - layer * 7}%`,
            height: `${31 + layer * 7}%`,
            background: ["#51604c", "#3f4b3c", "#252e26"][layer],
            clipPath: "polygon(0 100%,28% 18%,51% 66%,73% 9%,100% 100%)",
            transform: `translateX(${move(v.frame, [0, 220], [0, -3 * (layer + 1)])}%)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: v.vertical ? "40%" : "46%",
          width: v.vertical ? "86%" : "66%",
          height: v.vertical ? "66%" : "90%",
          transform: `translate(-50%,-50%) scale(${pull})`,
          transformOrigin: "50% 78%",
          filter: "drop-shadow(56px 52px 40px #15201888)",
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <Eyebrow v={v} />
      <div style={{position: "absolute", inset: 0, opacity: move(v.frame, [214, 250], [0, 1]), background: "linear-gradient(transparent 54%,#1b2421fa 90%)"}} />
      <EndCopy v={v} />
    </AbsoluteFill>
  );
};

const RetailImpact: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const snap = spring({
    fps: v.fps,
    frame: v.frame - 10,
    config: {damping: 13, stiffness: 125, mass: 0.8},
  });
  const sweep = move(v.frame, [85, 150], [-110, 115]);
  return (
    <AbsoluteFill style={{background: v.template.background, overflow: "hidden"}}>
      <div style={{position: "absolute", left: "-8%", top: "-12%", width: "47%", height: "125%", background: v.accent, transform: "rotate(9deg)"}} />
      <div style={{position: "absolute", right: "-10%", bottom: "-15%", width: "52%", height: "70%", borderRadius: "50%", background: "#fff"}} />
      <div
        style={{
          position: "absolute",
          left: `${sweep}%`,
          top: 0,
          width: "30%",
          height: "100%",
          background: "#fff8",
          transform: "skewX(-16deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: v.vertical ? "50%" : "62%",
          top: v.vertical ? "41%" : "47%",
          width: v.vertical ? "82%" : "61%",
          height: v.vertical ? "63%" : "86%",
          transform: `translate(-50%,-50%) scale(${0.72 + snap * 0.3}) rotate(${(1 - snap) * 7}deg)`,
          filter: "drop-shadow(34px 52px 36px #7c501e55)",
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <Eyebrow v={v} dark />
      <div style={{position: "absolute", inset: 0, opacity: move(v.frame, [214, 246], [0, 1]), background: "linear-gradient(transparent 53%,#ffe43bfa 89%)"}} />
      <EndCopy v={v} dark />
    </AbsoluteFill>
  );
};

const FutureEssential: React.FC<ProductVideoProps> = (props) => {
  const v = useAd(props);
  const reveal = move(v.frame, [0, 155], [0, 1]);
  const orbit = move(v.frame, [0, 220], [-35, 215]);
  return (
    <AbsoluteFill style={{background: "radial-gradient(circle at 50% 45%,#24203e,#090816 62%)", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          width: v.vertical ? "94%" : "70%",
          aspectRatio: 1,
          borderRadius: "50%",
          border: `1px solid ${v.accent}55`,
          transform: `translate(-50%,-50%) rotate(${orbit}deg) scale(${0.82 + reveal * 0.12})`,
          boxShadow: `inset 0 0 80px ${v.accent}20,0 0 70px ${v.accent}18`,
        }}
      >
        <div style={{position: "absolute", left: "50%", top: -8, width: 16, height: 16, borderRadius: "50%", background: v.accent, boxShadow: `0 0 28px ${v.accent}`}} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: v.vertical ? "39%" : "45%",
          width: v.vertical ? "76%" : "55%",
          height: v.vertical ? "58%" : "79%",
          transform: `translate(-50%,-50%) scale(${0.74 + reveal * 0.25})`,
          filter: `brightness(${0.3 + reveal * 0.7}) drop-shadow(0 0 55px ${v.accent}55)`,
        }}
      >
        <Product src={props.imageSrc} accent={v.accent} />
      </div>
      <Eyebrow v={v} />
      <div style={{position: "absolute", inset: 0, opacity: move(v.frame, [212, 248], [0, 1]), background: "linear-gradient(transparent 54%,#090816fa 90%)"}} />
      <EndCopy v={v} align="center" />
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch7: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "luxury-object":
      return <LuxuryObject {...props} />;
    case "beauty-ritual":
      return <BeautyRitual {...props} />;
    case "performance-engine":
      return <PerformanceEngine {...props} />;
    case "technology-keynote":
      return <TechnologyKeynote {...props} />;
    case "tabletop-appetite":
      return <TabletopAppetite {...props} />;
    case "fashion-campaign":
      return <FashionCampaign {...props} />;
    case "home-editorial":
      return <HomeEditorial {...props} />;
    case "outdoor-proven":
      return <OutdoorProven {...props} />;
    case "retail-impact":
      return <RetailImpact {...props} />;
    case "future-essential":
      return <FutureEssential {...props} />;
    default:
      return null;
  }
};

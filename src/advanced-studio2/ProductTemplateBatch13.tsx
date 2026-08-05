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
  style?: React.CSSProperties;
}> = ({src, opacity = 0.8, style}) =>
  src ? (
    <Img
      src={staticFile(src.replace(/^\/+/, ""))}
      style={{
        position: "absolute",
        inset: "-5%",
        width: "110%",
        height: "110%",
        objectFit: "cover",
        opacity,
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
        filter: "drop-shadow(0 34px 42px rgba(0,0,0,.34))",
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
      color: light ? "#fff" : scene.template.foreground,
      textAlign: align,
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
        marginTop: 15,
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
        maxWidth: 570,
        margin:
          align === "center"
            ? "20px auto 0"
            : align === "right"
              ? "20px 0 0 auto"
              : "20px 0 0",
        color: light ? "#e9e5dc" : scene.template.muted,
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

const heroBox = (scene: Scene): React.CSSProperties => ({
  position: "absolute",
  left: "50%",
  top: scene.vertical ? "48%" : "51%",
  width: scene.vertical ? "70%" : "45%",
  height: scene.vertical ? "48%" : "66%",
});

const AnamorphicReflection: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const resolve = move(s.frame, [22, 202], [0, 1]);
  const copy = move(s.frame, [202, 276], [0, 1]);
  const skew = -54 * (1 - resolve);
  const stretch = 0.24 + resolve * 0.76;
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.7}
        style={{
          filter: "grayscale(.75) brightness(.35) contrast(1.3)",
          transform: `scale(1.12) translateX(${(1 - resolve) * -8}%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "4%",
          right: "4%",
          top: "34%",
          height: "34%",
          overflow: "hidden",
          borderTop: `1px solid ${s.accent}66`,
          borderBottom: `1px solid ${s.accent}66`,
          transform: `perspective(900px) rotateY(${(1 - resolve) * 20}deg)`,
        }}
      >
        <Material
          src={props.polyHavenTexture?.localSrc}
          opacity={0.94}
          style={{filter: "brightness(.7) contrast(1.25)"}}
        />
        <div
          style={{
            ...heroBox(s),
            top: "50%",
            transform: `translate(-50%,-50%) skewX(${skew}deg) scaleX(${stretch})`,
            filter: `blur(${(1 - resolve) * 12}px)`,
          }}
        >
          <Product
            src={props.imageSrc}
            style={{opacity: 0.28 + resolve * 0.72}}
          />
        </div>
      </div>
      <div
        style={{
          ...heroBox(s),
          transform: `translate(-50%,-50%) translateX(${
            (1 - resolve) * 150
          }px) perspective(900px) rotateY(${(1 - resolve) * -34}deg) scaleX(${
            0.72 + resolve * 0.28
          })`,
          opacity: move(s.frame, [150, 220], [0, 1]),
          filter: `blur(${(1 - resolve) * 7}px)`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        light
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "5%",
          opacity: copy,
          transform: `translateY(${(1 - copy) * 20}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const VacuumReveal: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const conform = move(s.frame, [10, 112], [0, 1]);
  const peel = move(s.frame, [112, 232], [0, 1]);
  const copy = move(s.frame, [220, 284], [0, 1]);
  const boundary = 108 - peel * 118;
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.48}
        style={{filter: "brightness(.42) saturate(1.25)"}}
      />
      <div style={{...heroBox(s), transform: "translate(-50%,-50%)"}}>
        <Product
          src={props.imageSrc}
          style={{
            clipPath: `polygon(0 ${Math.max(
              0,
              boundary - 12,
            )}%,100% ${boundary}%,100% 100%,0 100%)`,
            transform: `translateY(${(1 - peel) * 28}px) rotate(${
              (1 - peel) * -2
            }deg)`,
            filter: `drop-shadow(0 ${28 + peel * 18}px ${
              34 + peel * 14
            }px rgba(0,0,0,.42))`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: "-8%",
          clipPath: `polygon(0 0,100% 0,100% ${boundary}%,0 ${Math.max(
            -8,
            boundary - 18,
          )}%)`,
          filter: `drop-shadow(0 24px 24px #0009)`,
        }}
      >
        <Material
          src={props.polyHavenTexture?.localSrc}
          opacity={1}
          style={{
            filter: `brightness(${0.56 + conform * 0.18}) saturate(1.35)`,
            transform: `scale(${1.05 - conform * 0.03})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "23%",
            right: "23%",
            top: "24%",
            bottom: "20%",
            borderRadius: "48%",
            boxShadow: `inset 0 ${18 + conform * 30}px ${
              38 + conform * 28
            }px #0009, inset 0 -12px 28px ${s.accent}55`,
            opacity: conform * (1 - peel),
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: "-10%",
          right: "-10%",
          top: `${Math.max(-4, boundary - 6)}%`,
          height: 30,
          background: `linear-gradient(180deg,transparent,${s.accent}99,transparent)`,
          filter: "blur(12px)",
          transform: "rotate(-3deg)",
        }}
      />
      <Copy
        scene={s}
        light
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "5%",
          opacity: copy,
        }}
      />
    </AbsoluteFill>
  );
};

const PressureMemory: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const press = move(s.frame, [10, 118], [0, 1]);
  const lift = move(s.frame, [118, 224], [0, 1]);
  const copy = move(s.frame, [218, 282], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.9}
        style={{filter: "sepia(.25) brightness(.75) contrast(1.15)"}}
      />
      {[0, 1, 2, 3].map((ring) => (
        <div
          key={ring}
          style={{
            position: "absolute",
            left: "50%",
            top: s.vertical ? "48%" : "52%",
            width: `${38 + ring * 10}%`,
            height: `${26 + ring * 8}%`,
            borderRadius: "50%",
            transform: `translate(-50%,-50%) scale(${
              1.08 - press * 0.08
            })`,
            boxShadow: `inset 0 ${10 + ring * 4}px ${
              20 + ring * 8
            }px rgba(35,20,10,${0.18 + press * 0.16})`,
            border: `1px solid rgba(255,225,175,${
              0.05 + press * 0.12
            })`,
          }}
        />
      ))}
      <div
        style={{
          ...heroBox(s),
          transform: `translate(-50%,-50%) translateY(${
            66 - lift * 66
          }px) scaleX(${1.06 - lift * 0.06}) scaleY(${
            0.68 + lift * 0.32
          })`,
          opacity: 0.34 + lift * 0.66,
          transformOrigin: "50% 100%",
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        light
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "5%",
          opacity: copy,
        }}
      />
    </AbsoluteFill>
  );
};

const PrecisionEtch: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const etch = move(s.frame, [12, 194], [0, 1]);
  const reveal = move(s.frame, [104, 226], [0, 1]);
  const copy = move(s.frame, [218, 282], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.76}
        style={{filter: "grayscale(1) brightness(.46) contrast(1.25)"}}
      />
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{position: "absolute", inset: "5%", width: "90%", height: "90%"}}
      >
        <path
          d="M80 180 H620 C760 180 820 250 820 360 V610 C820 740 740 810 600 810 H170 C100 810 80 770 80 700 V180"
          fill="none"
          stroke={s.accent}
          strokeWidth="4"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - etch}
          style={{filter: `drop-shadow(0 0 8px ${s.accent})`}}
        />
        <path
          d="M115 215 H590 C705 215 770 270 770 380 V580 C770 685 700 760 580 760 H115"
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.24}
          strokeWidth="2"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - etch}
        />
      </svg>
      <div
        style={{
          ...heroBox(s),
          left: s.vertical ? "50%" : "64%",
          transform: "translate(-50%,-50%)",
        }}
      >
        <Product
          src={props.imageSrc}
          style={{
            clipPath: `polygon(0 0,${reveal * 100}% 0,${
              reveal * 86
            }% 100%,0 100%)`,
            transform: `translateX(${(1 - reveal) * -42}px)`,
            filter: `drop-shadow(0 28px 38px rgba(0,0,0,.34)) drop-shadow(0 0 ${
              reveal * 18
            }px ${s.accent}55)`,
          }}
        />
      </div>
      <Copy
        scene={s}
        light
        align={s.vertical ? "center" : "left"}
        style={{
          position: "absolute",
          left: "7%",
          right: s.vertical ? "7%" : "56%",
          top: s.vertical ? "6%" : "18%",
          opacity: copy,
        }}
      />
    </AbsoluteFill>
  );
};

const PolishPass: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const polish = move(s.frame, [12, 214], [0, 1]);
  const copy = move(s.frame, [214, 282], [0, 1]);
  const edge = polish * 112 - 6;
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.94}
        style={{filter: "grayscale(1) brightness(.42) contrast(1.35)"}}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${100 - polish * 100}% 0 0)`,
        }}
      >
        <Material
          src={props.polyHavenTexture?.localSrc}
          opacity={0.92}
          style={{filter: "brightness(1.05) contrast(1.08) saturate(.7)"}}
        />
        <div
          style={{
            ...heroBox(s),
            transform: "translate(-50%,-50%) scaleY(-.72)",
            top: s.vertical ? "64%" : "70%",
            opacity: 0.3,
            filter: "blur(5px)",
          }}
        >
          <Product src={props.imageSrc} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: `${edge}%`,
          top: "-8%",
          width: "4%",
          height: "116%",
          background: `linear-gradient(90deg,transparent,${s.accent},#fff,transparent)`,
          filter: "blur(10px)",
        }}
      />
      <div
        style={{
          ...heroBox(s),
          transform: "translate(-50%,-50%)",
        }}
      >
        <Product
          src={props.imageSrc}
          style={{
            clipPath: `inset(0 ${100 - polish * 100}% 0 0)`,
            filter: `brightness(${0.62 + polish * 0.38}) drop-shadow(0 34px 42px rgba(0,0,0,.34))`,
          }}
        />
      </div>
      <Copy
        scene={s}
        light
        align={s.vertical ? "center" : "left"}
        style={{
          position: "absolute",
          left: "6%",
          right: s.vertical ? "6%" : "56%",
          top: "6%",
          opacity: copy,
        }}
      />
    </AbsoluteFill>
  );
};

const WovenTension: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const tension = move(s.frame, [10, 194], [0, 1]);
  const reveal = move(s.frame, [118, 224], [0, 1]);
  const copy = move(s.frame, [220, 284], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      {Array.from({length: 12}).map((_, index) => {
        const offset = (index - 5.5) * 8.5;
        const loose = (index % 2 ? 1 : -1) * (28 + (index % 3) * 9);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "-8%",
              top: `${50 + offset}%`,
              width: "116%",
              height: "9%",
              overflow: "hidden",
              transform: `translateY(${(1 - tension) * loose}px) rotate(${
                (1 - tension) * (index % 2 ? 7 : -7)
              }deg)`,
              transformOrigin: index % 2 ? "left center" : "right center",
              borderTop: "1px solid #fff1",
            }}
          >
            <Material
              src={props.polyHavenTexture?.localSrc}
              opacity={0.92}
              style={{
                top: `${-index * 70}%`,
                height: "1200%",
                filter: `brightness(${0.42 + (index % 3) * 0.08}) saturate(1.4)`,
              }}
            />
          </div>
        );
      })}
      <div
        style={{
          ...heroBox(s),
          transform: "translate(-50%,-50%)",
        }}
      >
        <Product
          src={props.imageSrc}
          style={{
            clipPath: `inset(${50 - reveal * 50}% 0 ${
              50 - reveal * 50
            }% 0)`,
            transform: `scaleX(${0.72 + reveal * 0.28}) rotate(${
              (1 - reveal) * 4
            }deg)`,
            transformOrigin: "50% 50%",
          }}
        />
      </div>
      <Copy
        scene={s}
        light
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "5%",
          opacity: copy,
        }}
      />
    </AbsoluteFill>
  );
};

const inkPaths = [
  "M20 820 C190 730 140 610 330 560 S520 350 700 300 S850 180 980 120",
  "M70 930 C170 770 300 820 380 650 S600 570 690 420 S840 360 940 250",
  "M0 630 C160 610 210 480 350 450 S520 260 640 230",
  "M300 1000 C330 850 490 850 520 700 S700 650 760 520 S900 470 1000 430",
];

const CapillaryCampaign: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const flow = move(s.frame, [8, 204], [0, 1]);
  const reveal = move(s.frame, [122, 230], [0, 1]);
  const copy = move(s.frame, [220, 284], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.5}
        style={{filter: "grayscale(.75) brightness(1.22)"}}
      />
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{position: "absolute", inset: 0, width: "100%", height: "100%"}}
      >
        {inkPaths.map((path, index) => (
          <path
            key={path}
            d={path}
            fill="none"
            stroke={index % 2 ? s.accent : s.template.foreground}
            strokeWidth={10 - index}
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - flow}
            opacity={0.78}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: s.vertical ? "50%" : "52%",
          width: s.vertical ? "78%" : "55%",
          height: s.vertical ? "48%" : "68%",
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          background: s.template.surface,
          boxShadow: `0 0 ${80 + reveal * 80}px ${
            30 + reveal * 30
          }px ${s.template.surface}`,
          opacity: reveal,
        }}
      />
      <div
        style={{
          ...heroBox(s),
          transform: "translate(-50%,-50%)",
          clipPath: `circle(${reveal * 72}% at 50% 50%)`,
        }}
      >
        <Product
          src={props.imageSrc}
          style={{
            transform: `translateX(${(1 - flow) * 32}px)`,
            filter: `sepia(${1 - reveal}) saturate(${
              0.55 + reveal * 0.45
            }) drop-shadow(0 34px 42px rgba(0,0,0,.34))`,
          }}
        />
      </div>
      <Copy
        scene={s}
        align={s.vertical ? "center" : "left"}
        style={{
          position: "absolute",
          left: "6%",
          right: s.vertical ? "6%" : "54%",
          top: "6%",
          opacity: copy,
        }}
      />
    </AbsoluteFill>
  );
};

const ResonanceSurface: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const organize = move(s.frame, [12, 208], [0, 1]);
  const reveal = move(s.frame, [108, 220], [0, 1]);
  const copy = move(s.frame, [220, 284], [0, 1]);
  const particles = Array.from({length: 48});
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.38}
        style={{filter: "grayscale(1) brightness(.36) contrast(1.4)"}}
      />
      {particles.map((_, index) => {
        const angle = (index / particles.length) * Math.PI * 6;
        const ring = 130 + (index % 4) * 66;
        const randomX = ((index * 197) % 1000) - 500;
        const randomY = ((index * 431) % 1000) - 500;
        const targetX = Math.cos(angle) * ring;
        const targetY = Math.sin(angle) * ring * (s.vertical ? 1.35 : 0.72);
        const x = randomX * (1 - organize) + targetX * organize;
        const y = randomY * (1 - organize) + targetY * organize;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 7 + (index % 4) * 3,
              height: 7 + (index % 4) * 3,
              borderRadius: "50%",
              background: index % 5 === 0 ? s.accent : "#d9e9ef",
              transform: `translate(${x}px,${y}px)`,
              boxShadow: `0 0 14px ${s.accent}66`,
              opacity: 0.4 + organize * 0.6,
            }}
          />
        );
      })}
      <div
        style={{
          ...heroBox(s),
          transform: `translate(-50%,-50%) scale(${
            0.72 + reveal * 0.28
          }) rotate(${Math.sin(s.frame * 0.19) * (1 - organize) * 3}deg)`,
          opacity: reveal,
          filter: `blur(${(1 - organize) * 9}px)`,
        }}
      >
        <Product
          src={props.imageSrc}
          style={{
            filter: `drop-shadow(0 34px 42px rgba(0,0,0,.34)) drop-shadow(0 0 ${
              reveal * 30
            }px ${s.accent}66)`,
          }}
        />
      </div>
      <Copy
        scene={s}
        light
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "5%",
          opacity: copy,
        }}
      />
    </AbsoluteFill>
  );
};

const PatinaClock: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const age = move(s.frame, [8, 218], [0, 1]);
  const reveal = move(s.frame, [104, 224], [0, 1]);
  const copy = move(s.frame, [220, 284], [0, 1]);
  const radius = 4 + age * 106;
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.92}
        style={{filter: "grayscale(.85) brightness(.54) contrast(1.2)"}}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `circle(${radius}% at 18% 24%)`,
        }}
      >
        <Material
          src={props.polyHavenTexture?.localSrc}
          opacity={0.94}
          style={{
            filter:
              "sepia(.75) hue-rotate(105deg) saturate(1.45) brightness(.7) contrast(1.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 24%,#9dd9b822,transparent 55%),repeating-radial-gradient(circle at 18% 24%,transparent 0 58px,#84c8a51d 61px 66px)",
          }}
        />
      </div>
      <div
        style={{
          ...heroBox(s),
          transform: "translate(-50%,-50%)",
          clipPath: `circle(${reveal * 68}% at 50% 50%)`,
          filter: `drop-shadow(0 0 40px rgba(230,255,242,${
            0.1 + reveal * 0.18
          }))`,
        }}
      >
        <Product
          src={props.imageSrc}
          style={{
            filter: `sepia(${(1 - age) * 0.7}) hue-rotate(${
              (1 - age) * 65
            }deg) drop-shadow(0 34px 42px rgba(0,0,0,.34))`,
          }}
        />
      </div>
      <Copy
        scene={s}
        light
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "5%",
          opacity: copy,
        }}
      />
    </AbsoluteFill>
  );
};

const ContinuousSurface: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const bend = move(s.frame, [8, 214], [0, 1]);
  const reveal = move(s.frame, [92, 222], [0, 1]);
  const copy = move(s.frame, [220, 284], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        background: s.template.background,
        overflow: "hidden",
        perspective: 1000,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-18%",
          top: "-18%",
          width: "136%",
          height: "136%",
          overflow: "hidden",
          borderRadius: `${bend * 46}% ${bend * 46}% 0 0`,
          transformOrigin: "50% 100%",
          transform: `translateY(${(1 - bend) * -12}%) rotateX(${
            (1 - bend) * 44
          }deg) scale(${1.16 - bend * 0.16})`,
          boxShadow: `inset 0 ${-90 * bend}px 120px #1b0d05aa`,
        }}
      >
        <Material
          src={props.polyHavenTexture?.localSrc}
          opacity={0.94}
          style={{
            filter: "sepia(.28) saturate(.9) brightness(.74)",
            transform: `scale(${1.24 - bend * 0.18})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg,transparent 36%,rgba(23,12,6,${
              0.1 + bend * 0.42
            }) 82%)`,
          }}
        />
      </div>
      <div
        style={{
          ...heroBox(s),
          transform: `translate(-50%,-50%) translateY(${
            (1 - bend) * 170
          }px) perspective(900px) rotateX(${
            (1 - bend) * 24
          }deg) scale(${0.82 + reveal * 0.18})`,
          opacity: reveal,
          transformOrigin: "50% 100%",
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        light
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "5%",
          opacity: copy,
        }}
      />
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch13: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "anamorphic-reflection":
      return <AnamorphicReflection {...props} />;
    case "vacuum-reveal":
      return <VacuumReveal {...props} />;
    case "pressure-memory":
      return <PressureMemory {...props} />;
    case "precision-etch":
      return <PrecisionEtch {...props} />;
    case "polish-pass":
      return <PolishPass {...props} />;
    case "woven-tension":
      return <WovenTension {...props} />;
    case "capillary-campaign":
      return <CapillaryCampaign {...props} />;
    case "resonance-surface":
      return <ResonanceSurface {...props} />;
    case "patina-clock":
      return <PatinaClock {...props} />;
    case "continuous-surface":
      return <ContinuousSurface {...props} />;
    default:
      return null;
  }
};

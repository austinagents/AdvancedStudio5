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
) => interpolate(frame, input, output, {...clamp, easing: Easing.inOut(Easing.cubic)});

const reveal = (frame: number) => move(frame, [218, 276], [0, 1]);

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
}> = ({src, opacity = 0.65, style}) =>
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
        filter: "drop-shadow(0 36px 46px rgba(0,0,0,.4))",
        ...style,
      }}
    />
  ) : (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        border: "2px dashed currentColor",
        opacity: 0.3,
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
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({scene, align = "left", dark = false, style}) => (
  <div
    style={{
      color: dark ? "#19130f" : scene.template.foreground,
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
        marginTop: 14,
        fontSize: scene.vertical ? 76 : scene.compact ? 54 : 66,
        fontWeight: 900,
        lineHeight: 0.91,
        letterSpacing: -3,
      }}
    >
      {scene.headline}
    </div>
    <div
      style={{
        maxWidth: 580,
        margin:
          align === "center"
            ? "19px auto 0"
            : align === "right"
              ? "19px 0 0 auto"
              : "19px 0 0",
        color: dark ? "#66584e" : scene.template.muted,
        fontSize: 17,
        lineHeight: 1.4,
      }}
    >
      {scene.subheadline}
    </div>
    <div style={{marginTop: 20, color: scene.accent, fontWeight: 800}}>
      {scene.cta} →
    </div>
  </div>
);

const hero = (scene: Scene): React.CSSProperties => ({
  position: "absolute",
  left: "50%",
  top: scene.vertical ? "45%" : "49%",
  width: scene.vertical ? "72%" : "48%",
  height: scene.vertical ? "47%" : "64%",
});

const ExpandingWorld: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const open = move(s.frame, [18, 205], [0, 1]);
  const finish = reveal(s.frame);
  const wall = 24 - open * 18;
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.58}
        style={{filter: "brightness(.48) saturate(.65)"}}
      />
      <div style={{position: "absolute", inset: 0, perspective: 900}}>
        <div
          style={{
            position: "absolute",
            left: `${wall}%`,
            right: `${wall}%`,
            top: `${15 - open * 9}%`,
            bottom: `${15 - open * 9}%`,
            background: `radial-gradient(circle at 50% 55%, ${s.accent}55, transparent 50%), ${s.template.surface}aa`,
            border: `2px solid ${s.accent}66`,
            boxShadow: `inset 0 0 ${80 + open * 100}px #0008`,
          }}
        />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i % 2 ? `${50 + open * (36 + i * 2)}%` : `${50 - open * (38 + i * 2)}%`,
              top: `${18 + i * 18}%`,
              width: 2,
              height: "52%",
              background: s.accent,
              opacity: 0.12 + open * 0.28,
              transform: `rotate(${i % 2 ? -8 : 8}deg)`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          ...hero(s),
          transform: `translate(-50%,-50%) scale(${0.72 + open * 0.28})`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "4%",
          opacity: finish,
          transform: `translateY(${(1 - finish) * 32}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const ObjectOfDesire: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const approach = move(s.frame, [15, 215], [0, 1]);
  const finish = reveal(s.frame);
  const echoes = [
    {x: 17, y: 25, scale: 0.44, blur: 8},
    {x: 80, y: 35, scale: 0.62, blur: 5},
    {x: 22, y: 76, scale: 0.78, blur: 3},
  ];
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.34}
        style={{filter: "grayscale(1) brightness(.22)"}}
      />
      {echoes.map((echo, index) => (
        <div
          key={index}
          style={{
            ...hero(s),
            left: `${echo.x + (50 - echo.x) * approach}%`,
            top: `${echo.y + (49 - echo.y) * approach}%`,
            transform: `translate(-50%,-50%) scale(${echo.scale + (1 - echo.scale) * approach})`,
            opacity: (1 - approach) * (0.25 + index * 0.1),
            filter: `blur(${echo.blur * (1 - approach)}px)`,
          }}
        >
          <Product src={props.imageSrc} style={{filter: "brightness(.3)"}} />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: `${12 + approach * 38}%`,
          top: "7%",
          bottom: "7%",
          width: 2,
          background: `linear-gradient(transparent,${s.accent},transparent)`,
          opacity: 0.7 * (1 - finish),
        }}
      />
      <div
        style={{
          ...hero(s),
          transform: `translate(-50%,-50%) scale(${0.85 + approach * 0.15})`,
          opacity: 0.45 + approach * 0.55,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        align={s.vertical ? "center" : "left"}
        style={{
          position: "absolute",
          left: "6%",
          right: s.vertical ? "6%" : "57%",
          bottom: "5%",
          opacity: finish,
        }}
      />
    </AbsoluteFill>
  );
};

const InnerWorkings: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const camera = move(s.frame, [18, 212], [0, 1]);
  const finish = reveal(s.frame);
  const mechanismOpacity = 1 - move(s.frame, [190, 228], [0, 1]);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.42}
        style={{filter: "grayscale(1) brightness(.28)"}}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          width: `${110 - camera * 55}%`,
          height: `${92 - camera * 35}%`,
          transform: "translate(-50%,-50%)",
          border: `2px solid ${s.accent}88`,
          borderRadius: 40,
          overflow: "hidden",
          opacity: mechanismOpacity,
          boxShadow: `inset 0 0 80px ${s.accent}22`,
        }}
      >
        {Array.from({length: 7}).map((_, i) => {
          const travel = ((s.frame * (0.55 + i * 0.08) + i * 67) % 380) - 70;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${8 + i * 13}%`,
                top: `${travel / 3}%`,
                width: 34 + i * 3,
                height: 34 + i * 3,
                borderRadius: i % 2 ? "50%" : 7,
                border: `2px solid ${s.accent}`,
                transform: `rotate(${s.frame * (i % 2 ? -0.7 : 0.7)}deg)`,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: "50%",
            height: 3,
            background: s.accent,
            boxShadow: `0 0 20px ${s.accent}`,
          }}
        />
      </div>
      <div
        style={{
          ...hero(s),
          transform: `translate(-50%,-50%) scale(${0.44 + camera * 0.56})`,
          opacity: 0.15 + camera * 0.85,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "4%",
          opacity: finish,
        }}
      />
    </AbsoluteFill>
  );
};

const WorldBuilder: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const build = move(s.frame, [12, 205], [0, 1]);
  const pullBack = move(s.frame, [155, 230], [0, 1]);
  const finish = reveal(s.frame);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.52}
        style={{
          filter: "brightness(.5) saturate(.75)",
          transform: `scale(${1.3 - pullBack * 0.25})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${1.18 - pullBack * 0.18})`,
        }}
      >
        {Array.from({length: 6}).map((_, i) => {
          const arrive = move(build, [i / 9, Math.min(1, i / 9 + 0.3)], [0, 1]);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "-8%",
                right: "-8%",
                top: `${16 + i * 11}%`,
                height: `${34 + i * 4}%`,
                background: `linear-gradient(${118 + i * 7}deg,${s.template.surface},${i === 2 ? s.accent : s.template.background})`,
                clipPath: `polygon(0 ${22 + (i % 3) * 9}%, ${18 + i * 8}% ${i % 2 ? 4 : 18}%, ${44 + i * 5}% ${34 - i * 3}%, ${67 + i * 3}% ${i % 2 ? 12 : 2}%, 100% ${25 + i * 4}%, 100% 100%, 0 100%)`,
                transform: `translateY(${(1 - arrive) * (210 + i * 22)}px) scale(${0.92 + arrive * 0.08})`,
                opacity: arrive * (0.38 + i * 0.09),
                filter: `brightness(${0.52 + i * 0.07})`,
                overflow: "hidden",
              }}
            >
              <Material
                src={props.polyHavenTexture?.localSrc}
                opacity={0.48 + i * 0.06}
                style={{
                  transform: `scale(${1.45 - pullBack * 0.2}) translateX(${(i - 3) * 2}%)`,
                  filter: `hue-rotate(${i * 7}deg) contrast(1.12)`,
                }}
              />
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: `${38 + pullBack * 10}%`,
            height: 2,
            background: `linear-gradient(90deg,transparent,${s.accent},transparent)`,
            boxShadow: `0 0 30px ${s.accent}`,
            opacity: build,
          }}
        />
      </div>
      <div
        style={{
          ...hero(s),
          top: s.vertical ? "47%" : "52%",
          transform: `translate(-50%,-50%) scale(${0.78 + pullBack * 0.22})`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "4%",
          opacity: finish,
        }}
      />
    </AbsoluteFill>
  );
};

const FutureRipple: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const branch = move(s.frame, [18, 160], [0, 1]);
  const returnHome = move(s.frame, [168, 225], [0, 1]);
  const finish = reveal(s.frame);
  const paths = [
    {x: 18, y: 20, color: "#ff725e"},
    {x: 79, y: 24, color: "#58b8ff"},
    {x: 50, y: 78, color: "#d7ff4d"},
  ];
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.28}
        style={{filter: "grayscale(1) brightness(.25)"}}
      />
      {paths.map((path, i) => {
        const x = 50 + (path.x - 50) * branch * (1 - returnHome);
        const y = 49 + (path.y - 49) * branch * (1 - returnHome);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "49%",
                width: `${Math.abs(x - 50)}%`,
                height: 2,
                background: path.color,
                transformOrigin: x < 50 ? "right" : "left",
                transform: `rotate(${i === 2 ? 90 : i === 0 ? 28 : -28}deg)`,
                opacity: branch * (1 - returnHome),
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: s.vertical ? "30%" : "20%",
                height: s.vertical ? "18%" : "28%",
                transform: "translate(-50%,-50%)",
                border: `2px solid ${path.color}`,
                borderRadius: 22,
                overflow: "hidden",
                opacity: branch * (1 - returnHome),
              }}
            >
              <Product
                src={props.imageSrc}
                style={{transform: `scale(${1.55 + i * 0.28}) translateY(${i * -3}%)`}}
              />
            </div>
          </React.Fragment>
        );
      })}
      <div
        style={{
          ...hero(s),
          transform: `translate(-50%,-50%) scale(${0.84 + returnHome * 0.16})`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "4%",
          opacity: finish,
        }}
      />
    </AbsoluteFill>
  );
};

const ProductPerspective: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const reframe = move(s.frame, [20, 218], [0, 1]);
  const finish = reveal(s.frame);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.72}
        style={{
          filter: "sepia(.2) brightness(.62)",
          transform: `scale(${1.22 - reframe * 0.14}) translateX(${(1 - reframe) * -6}%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${28 + reframe * 22}% 52%, transparent 0 22%, #000b 60%)`,
        }}
      />
      <div
        style={{
          ...hero(s),
          left: `${122 - reframe * 72}%`,
          transform: `translate(-50%,-50%) scale(${1.8 - reframe * 0.8})`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "5%",
          top: "8%",
          color: s.accent,
          fontSize: 15,
          fontWeight: 900,
          letterSpacing: 4,
          opacity: 1 - finish,
        }}
      >
        YOU WERE SEEING ITS WORLD
      </div>
      <Copy
        scene={s}
        align={s.vertical ? "center" : "left"}
        style={{
          position: "absolute",
          left: "6%",
          right: s.vertical ? "6%" : "56%",
          bottom: "5%",
          opacity: finish,
        }}
      />
    </AbsoluteFill>
  );
};

const ImpossibleControl: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const stress = move(s.frame, [16, 220], [0, 1]);
  const finish = reveal(s.frame);
  const gap = 8 + stress * 32;
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.46}
        style={{filter: "grayscale(1) brightness(.34)"}}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: `${50 + gap / 2}%`,
          top: "18%",
          bottom: "18%",
          background: s.template.surface,
          borderRight: `3px solid ${s.accent}`,
          transform: `skewY(${-stress * 4}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${50 + gap / 2}%`,
          right: 0,
          top: "18%",
          bottom: "18%",
          background: s.template.surface,
          borderLeft: `3px solid ${s.accent}`,
          transform: `skewY(${stress * 4}deg)`,
        }}
      />
      {Array.from({length: 6}).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${50 + (i % 2 ? 1 : -1) * (12 + stress * (22 + i * 3))}%`,
            top: `${22 + i * 10}%`,
            width: 32,
            height: 2,
            background: s.accent,
            opacity: 0.45,
          }}
        />
      ))}
      <div style={{...hero(s), transform: "translate(-50%,-50%)"}}>
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "4%",
          opacity: finish,
        }}
      />
    </AbsoluteFill>
  );
};

const Rendezvous: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const meet = move(s.frame, [16, 218], [0, 1]);
  const finish = reveal(s.frame);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.42}
        style={{filter: "brightness(.38) saturate(.65)"}}
      />
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: i ? `${92 - meet * 42}%` : `${8 + meet * 42}%`,
            top: `${18 + meet * 31}%`,
            width: s.vertical ? "58%" : "42%",
            height: s.vertical ? "40%" : "60%",
            transform: `translate(-50%,-50%) rotate(${i ? -1 : 1}deg)`,
            border: `2px solid ${s.accent}${i ? "99" : "55"}`,
            borderRadius: "50% 50% 10px 10px",
            opacity: 0.72 * (1 - finish),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: `${8 + meet * 42}%`,
          right: `${8 + meet * 42}%`,
          top: "49%",
          height: 2,
          background: s.accent,
          boxShadow: `0 0 25px ${s.accent}`,
        }}
      />
      <div
        style={{
          ...hero(s),
          transform: `translate(-50%,-50%) scale(${0.68 + meet * 0.32})`,
          opacity: 0.35 + meet * 0.65,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "4%",
          opacity: finish,
        }}
      />
    </AbsoluteFill>
  );
};

const DetailLandscape: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const pullBack = move(s.frame, [16, 222], [0, 1]);
  const finish = reveal(s.frame);
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <Material
        src={props.polyHavenTexture?.localSrc}
        opacity={0.22}
        style={{filter: "brightness(.3)"}}
      />
      <div
        style={{
          ...hero(s),
          width: s.vertical ? "80%" : "58%",
          height: s.vertical ? "52%" : "74%",
          transform: `translate(-50%,-50%) scale(${5.2 - pullBack * 4.2}) translate(${(1 - pullBack) * -8}%,${(1 - pullBack) * 10}%)`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          top: `${72 - pullBack * 24}%`,
          height: 2,
          background: s.accent,
          boxShadow: `0 0 26px ${s.accent}`,
          opacity: 1 - finish,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "5%",
          top: "5%",
          color: s.accent,
          fontFamily: "monospace",
          letterSpacing: 3,
          opacity: 1 - finish,
        }}
      >
        SCALE {Math.round((5.2 - pullBack * 4.2) * 100)}%
      </div>
      <Copy
        scene={s}
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "4%",
          opacity: finish,
        }}
      />
    </AbsoluteFill>
  );
};

const ConstantJourney: React.FC<ProductVideoProps> = (props) => {
  const s = useScene(props);
  const travel = move(s.frame, [10, 224], [0, 3]);
  const finish = reveal(s.frame);
  const worlds = [
    ["#0a1724", "#315b73"],
    ["#362014", "#a56836"],
    ["#15241f", "#3e7a62"],
    ["#17131f", "#765781"],
  ];
  return (
    <AbsoluteFill style={{background: s.template.background, overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: `${-travel * 100}%`,
          top: 0,
          width: "400%",
          height: "100%",
          display: "flex",
        }}
      >
        {worlds.map(([dark, light], i) => (
          <div
            key={i}
            style={{
              position: "relative",
              width: "25%",
              height: "100%",
              overflow: "hidden",
              background: `radial-gradient(circle at ${i % 2 ? 70 : 30}% 45%,${light},${dark} 62%)`,
            }}
          >
            <Material
              src={props.polyHavenTexture?.localSrc}
              opacity={0.32}
              style={{filter: `brightness(${0.45 + i * 0.08}) hue-rotate(${i * 42}deg)`}}
            />
            <div
              style={{
                position: "absolute",
                left: "8%",
                bottom: "12%",
                color: "#fff9",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 5,
              }}
            >
              HORIZON 0{i + 1}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "8%",
          bottom: "8%",
          width: 2,
          background: `linear-gradient(transparent,${s.accent},transparent)`,
          opacity: 0.35,
        }}
      />
      <div style={{...hero(s), transform: "translate(-50%,-50%)"}}>
        <Product src={props.imageSrc} />
      </div>
      <Copy
        scene={s}
        align="center"
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "4%",
          opacity: finish,
        }}
      />
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch15: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "expanding-world":
      return <ExpandingWorld {...props} />;
    case "object-of-desire":
      return <ObjectOfDesire {...props} />;
    case "inner-workings":
      return <InnerWorkings {...props} />;
    case "world-builder":
      return <WorldBuilder {...props} />;
    case "future-ripple":
      return <FutureRipple {...props} />;
    case "product-perspective":
      return <ProductPerspective {...props} />;
    case "impossible-control":
      return <ImpossibleControl {...props} />;
    case "rendezvous":
      return <Rendezvous {...props} />;
    case "detail-landscape":
      return <DetailLandscape {...props} />;
    case "constant-journey":
      return <ConstantJourney {...props} />;
    default:
      return null;
  }
};

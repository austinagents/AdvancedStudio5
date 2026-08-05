import React from "react";
import {
  AbsoluteFill,
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

const range = (
  frame: number,
  input: [number, number] | [number, number, number] | [number, number, number, number],
  output: [number, number] | [number, number, number] | [number, number, number, number],
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

const Material: React.FC<{src?: string; style?: React.CSSProperties}> = ({src, style}) =>
  src ? (
    <Img
      src={staticFile(src.replace(/^\/+/, ""))}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.12,
        mixBlendMode: "multiply",
        ...style,
      }}
    />
  ) : null;

const Product: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) =>
  src ? (
    <Img src={src} style={{width: "100%", height: "100%", objectFit: "contain", ...style}} />
  ) : (
    <div style={{width: "100%", height: "100%", display: "grid", placeItems: "center", opacity: 0.35}}>
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
    <span style={{color: scene.accent, fontSize: 15, fontWeight: 950, letterSpacing: 4}}>
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
    <b style={{marginTop: 24, color: scene.accent, fontSize: 15}}>{scene.cta} →</b>
  </div>
);

const Palindrome: React.FC<ProductVideoProps> = (props) => {
  const scene = useScene(props);
  const mirroredFrame = scene.frame <= 150 ? scene.frame : 300 - scene.frame;
  const motion = range(mirroredFrame, [0, 150], [0, 1]);
  return (
    <AbsoluteFill style={{background: scene.template.background, color: "#fff", overflow: "hidden"}}>
      <Material src={props.polyHavenTexture?.localSrc} />
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${50 + Math.cos(index * Math.PI / 2) * motion * 36}%`,
            top: `${48 + Math.sin(index * Math.PI / 2) * motion * 30}%`,
            width: 90 + index * 16,
            height: 90 + index * 16,
            border: `2px solid ${index % 2 ? scene.accent : "#ffffff55"}`,
            transform: `translate(-50%, -50%) rotate(${motion * (index % 2 ? 90 : -90)}deg)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: scene.vertical ? "17% 13% 25%" : "13% 31% 13%",
          zIndex: 2,
          transform: `scale(${0.78 + motion * 0.22})`,
        }}
      >
        <Product
          src={props.imageSrc}
          style={{filter: `drop-shadow(0 0 ${motion * 38}px ${scene.accent}88)`}}
        />
      </div>
      <span
        style={{
          position: "absolute",
          left: "5%",
          top: "5%",
          color: scene.accent,
          fontWeight: 950,
          letterSpacing: 5,
        }}
      >
        {scene.frame <= 150 ? "FORWARD / 01" : "REVERSE / 02"}
      </span>
      <div
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          bottom: "5%",
          zIndex: 3,
          opacity: range(mirroredFrame, [95, 140], [0, 1]),
        }}
      >
        <Copy scene={scene} light centered />
      </div>
    </AbsoluteFill>
  );
};

const TheCallback: React.FC<ProductVideoProps> = (props) => {
  const scene = useScene(props);
  const develop = range(scene.frame, [35, 210], [0, 1]);
  const resolve = range(scene.frame, [210, 260], [0, 1]);
  const productInset = scene.vertical
    ? {top: 16, right: 11, bottom: 26, left: 11}
    : {top: 12, right: 28, bottom: 12, left: 28};
  const edge = 7;
  return (
    <AbsoluteFill
      style={{background: scene.template.background, color: scene.template.foreground, overflow: "hidden"}}
    >
      <Material src={props.polyHavenTexture?.localSrc} />
      <div
        style={{
          position: "absolute",
          left: `${8 + develop * 35}%`,
          top: `${10 + develop * 28}%`,
          width: `${90 - develop * 52}%`,
          height: `${8 + develop * 54}%`,
          border: `18px solid ${scene.accent}`,
          borderRadius: `${develop * 50}%`,
          transform: `rotate(${develop * 180}deg)`,
          opacity: 1 - resolve,
        }}
      />
      <span
        style={{
          position: "absolute",
          left: "5%",
          top: "5%",
          color: scene.accent,
          fontWeight: 950,
          letterSpacing: 5,
        }}
      >
        MOTIF / RETURN
      </span>
      <div
        style={{
          position: "absolute",
          inset: scene.vertical ? "16% 11% 26%" : "12% 28% 12%",
          zIndex: 2,
          transform: `scale(${0.82 + develop * 0.18})`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <div
        style={{
          position: "absolute",
          top: `${productInset.top + (edge - productInset.top) * resolve}%`,
          right: `${productInset.right + (edge - productInset.right) * resolve}%`,
          bottom: `${productInset.bottom + (edge - productInset.bottom) * resolve}%`,
          left: `${productInset.left + (edge - productInset.left) * resolve}%`,
          zIndex: 1,
          border: `5px solid ${scene.accent}`,
          borderRadius: `${(1 - resolve) * 50}%`,
          opacity: resolve,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          bottom: "10%",
          zIndex: 3,
          opacity: resolve,
        }}
      >
        <Copy scene={scene} />
      </div>
    </AbsoluteFill>
  );
};

const LoopDesign: React.FC<ProductVideoProps> = (props) => {
  const scene = useScene(props);
  const angle = (scene.frame / 300) * Math.PI * 2;
  const wave = (1 - Math.cos(angle)) / 2;
  const pulse = Math.sin(angle);
  const hook = range(scene.frame, [0, 18, 60], [0, 1, 0.82]);
  const finish = range(scene.frame, [190, 225, 270, 299], [0, 1, 1, 0]);
  const texture = props.polyHavenTexture?.localSrc;
  const hero = (style: React.CSSProperties) => (
    <div style={{position: "absolute", zIndex: 4, ...style}}>
      <Product src={props.imageSrc} />
    </div>
  );
  const copy = (
    <div style={{position: "absolute", left: "6%", right: "6%", bottom: "5%", zIndex: 8, opacity: finish}}>
      <Copy scene={scene} light={scene.template.background !== "#eee5d8"} centered />
    </div>
  );
  const material = (style: React.CSSProperties, imageStyle?: React.CSSProperties) => (
    <div style={{position: "absolute", overflow: "hidden", ...style}}>
      <Material src={texture} style={{opacity: 0.82, mixBlendMode: "normal", ...imageStyle}} />
    </div>
  );

  if (props.templateId === "orbit-relay") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: "-12%", top: "8%", width: "82%", aspectRatio: "1", borderRadius: "50%", border: `3px solid ${scene.accent}`, transform: `rotate(${angle * 57.3}deg)`})}
      <div style={{position: "absolute", left: "24%", top: "37%", width: 28, height: 28, borderRadius: "50%", background: scene.accent, boxShadow: `0 0 ${30 + hook * 55}px ${scene.accent}`, transform: `translate(${Math.cos(angle) * 170}px,${Math.sin(angle) * 220}px)`, zIndex: 5}} />
      {hero({left: scene.vertical ? "43%" : "54%", top: "18%", width: scene.vertical ? "49%" : "35%", height: "57%", transform: `translateX(${pulse * 22}px) rotate(${pulse * 2}deg) scale(${0.92 + hook * 0.08})`})}
      {copy}
    </AbsoluteFill>;
  }

  if (props.templateId === "reflection-tide") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: "-8%", right: "-8%", top: `${44 + pulse * 7}%`, bottom: "-12%", transform: `skewY(${pulse * 2}deg)`, borderTop: `4px solid ${scene.accent}`}, {filter: "brightness(.48) saturate(1.25)"})}
      {hero({left: "8%", top: `${13 + pulse * 2}%`, width: scene.vertical ? "58%" : "39%", height: "52%", transform: `translateY(${pulse * 18}px) scale(${0.9 + hook * 0.1})`})}
      <div style={{position: "absolute", left: "9%", width: scene.vertical ? "56%" : "38%", top: `${47 + pulse * 7}%`, height: "34%", transform: "scaleY(-1)", opacity: 0.12 + wave * 0.24, filter: "blur(5px)", zIndex: 2}}>
        <Product src={props.imageSrc} />
      </div>
      <div style={{position: "absolute", right: "6%", top: "16%", width: scene.vertical ? "55%" : "42%", zIndex: 6}}><Copy scene={scene} light /></div>
    </AbsoluteFill>;
  }

  if (props.templateId === "folding-horizon-loop") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden", perspective: 1100}}>
      {material({left: "-8%", right: "-8%", top: `${72 - wave * 34}%`, height: "74%", transformOrigin: "50% 0", transform: `rotateX(${72 - wave * 72}deg)`, borderTop: `3px solid ${scene.accent}`})}
      {hero({right: scene.vertical ? "9%" : "17%", top: "14%", width: scene.vertical ? "55%" : "37%", height: "58%", transform: `translateY(${(1 - wave) * 90}px) rotate(${pulse * -3}deg) scale(${0.86 + hook * 0.14})`})}
      <div style={{position: "absolute", left: "6%", top: "12%", width: scene.vertical ? "66%" : "45%", zIndex: 6}}><Copy scene={scene} light /></div>
    </AbsoluteFill>;
  }

  if (props.templateId === "eclipse-halo-loop") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({right: "-18%", top: "7%", width: scene.vertical ? "95%" : "68%", aspectRatio: "1", borderRadius: "50%", filter: `drop-shadow(0 0 80px ${scene.accent}55)`}, {filter: "brightness(.32)"})}
      <div style={{position: "absolute", right: `${2 + Math.cos(angle) * 13}%`, top: `${22 + Math.sin(angle) * 18}%`, width: 240, height: 240, borderRadius: "50%", background: scene.template.background, boxShadow: `0 0 ${45 + hook * 80}px ${scene.accent}`, zIndex: 3}} />
      {hero({left: "7%", bottom: scene.vertical ? "23%" : "9%", width: scene.vertical ? "63%" : "42%", height: "61%", transform: `rotate(${pulse * 4}deg) scale(${0.9 + hook * 0.1})`, filter: `drop-shadow(${Math.cos(angle) * 20}px ${Math.sin(angle) * 18}px 30px ${scene.accent}88)`})}
      {copy}
    </AbsoluteFill>;
  }

  if (props.templateId === "conveyor-infinity") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: "-18%", right: "-18%", top: "48%", height: "28%", transform: `translateX(${pulse * 6}%) skewY(-5deg)`, borderTop: `3px solid ${scene.accent}`, borderBottom: `3px solid ${scene.accent}`}, {filter: "brightness(.48)"})}
      {[-1, 0, 1].map((index) => <div key={index} style={{
        position: "absolute",
        left: `${20 + index * 39 + ((scene.frame / 300) * 39) % 39}%`,
        top: `${43 + index * index * 5}%`,
        width: scene.vertical ? "42%" : "29%",
        height: "51%",
        transform: `translate(-50%,-50%) scale(${index === 0 ? 1 : 0.62}) rotate(${index * 4}deg)`,
        opacity: index === 0 ? 1 : 0.22,
        zIndex: index === 0 ? 3 : 1,
      }}><Product src={props.imageSrc} /></div>)}
      {copy}
    </AbsoluteFill>;
  }

  if (props.templateId === "magnetic-bloom-loop") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {Array.from({length: 12}).map((_, index) => {
        const petal = (index / 12) * Math.PI * 2;
        const radius = 110 + wave * 330;
        return material({left: `calc(34% + ${Math.cos(petal) * radius}px)`, top: `calc(45% + ${Math.sin(petal) * radius * 0.75}px)`, width: 48, height: 150, borderRadius: "50%", transform: `translate(-50%,-50%) rotate(${petal * 57.3 + 90 + wave * 28}deg)`, opacity: 0.36 + wave * 0.54}, {filter: `hue-rotate(${index * 5}deg)`});
      })}
      {hero({left: "9%", top: "16%", width: scene.vertical ? "55%" : "38%", height: "57%", transform: `translate(${wave * 70}px,${-wave * 28}px) rotate(${pulse * -5}deg) scale(${0.9 + hook * 0.1})`})}
      {copy}
    </AbsoluteFill>;
  }

  if (props.templateId === "prism-turn-loop") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {["#ff5975", "#61d9ff", "#ffe078"].map((color, index) => <div key={color} style={{
        position: "absolute",
        right: "-12%",
        top: `${8 + index * 18}%`,
        width: scene.vertical ? "90%" : "64%",
        height: "35%",
        transform: `rotate(${angle * 57.3 + index * 17}deg) scaleX(${0.3 + hook * 0.7})`,
        background: `linear-gradient(90deg,transparent,${color}55,transparent)`,
        mixBlendMode: "screen",
      }} />)}
      {material({right: "4%", top: "10%", width: scene.vertical ? "67%" : "46%", height: "67%", clipPath: "polygon(50% 0,100% 100%,0 100%)", opacity: 0.62}, {mixBlendMode: "screen", filter: "saturate(1.8)"})}
      {hero({right: scene.vertical ? "4%" : "15%", top: "12%", width: scene.vertical ? "58%" : "39%", height: "58%", transform: `translateX(${pulse * 35}px) rotate(${pulse * 5}deg) scale(${0.88 + hook * 0.12})`, filter: `drop-shadow(${pulse * 12}px 0 #ff597566) drop-shadow(${pulse * -12}px 0 #61d9ff66)`})}
      {copy}
    </AbsoluteFill>;
  }

  if (props.templateId === "curtain-breath-loop") {
    const opening = 18 + wave * 30;
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: 0, top: 0, bottom: 0, width: `${51 - opening / 2}%`, borderRadius: "0 45% 45% 0", boxShadow: "20px 0 50px #000b", zIndex: 5}, {filter: "brightness(.62) saturate(1.4)"})}
      {material({right: 0, top: 0, bottom: 0, width: `${51 - opening / 2}%`, borderRadius: "45% 0 0 45%", boxShadow: "-20px 0 50px #000b", zIndex: 5}, {filter: "brightness(.5) saturate(1.4)", transform: "scaleX(-1)"})}
      {hero({left: scene.vertical ? "27%" : "37%", top: `${14 + pulse * 3}%`, width: scene.vertical ? "58%" : "40%", height: "61%", transform: `scale(${0.84 + hook * 0.16}) translateY(${pulse * 16}px)`})}
      {copy}
    </AbsoluteFill>;
  }

  if (props.templateId === "pendulum-stage-loop") {
    const swing = Math.sin(angle) * 38;
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: "6%", right: "6%", bottom: "8%", height: "29%", clipPath: "polygon(7% 0,93% 0,100% 100%,0 100%)"}, {filter: "brightness(.42)"})}
      <div style={{position: "absolute", left: "50%", top: "-4%", width: 6, height: "66%", transformOrigin: "50% 0", transform: `rotate(${swing}deg)`, background: `linear-gradient(${scene.accent},transparent)`, opacity: 0.75}} />
      <div style={{position: "absolute", left: `${50 + Math.sin(angle) * 28}%`, top: "42%", width: "48%", height: "52%", borderRadius: "50%", transform: "translate(-50%,-50%)", background: `radial-gradient(circle,${scene.accent}55,transparent 68%)`, filter: "blur(12px)"}} />
      {hero({left: `${11 + wave * 47}%`, bottom: "13%", width: scene.vertical ? "48%" : "32%", height: "54%", transform: `rotate(${pulse * 7}deg) scale(${0.9 + hook * 0.1})`, filter: `brightness(${0.76 + wave * 0.34}) drop-shadow(0 34px 35px #0007)`})}
      {copy}
    </AbsoluteFill>;
  }

  return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
    {material({inset: "9%", borderRadius: "50%", opacity: 0.56}, {filter: "brightness(.38) saturate(1.35)"})}
    {Array.from({length: 7}).map((_, index) => {
      const radius = 110 + ((index * 78 + wave * 420) % 600);
      return <div key={index} style={{position: "absolute", left: "50%", top: "47%", width: radius * 2, height: radius * 1.45, border: `2px solid ${scene.accent}`, borderRadius: "50%", transform: "translate(-50%,-50%)", opacity: 0.08 + (1 - radius / 720) * 0.32}} />;
    })}
    {hero({right: "7%", top: "19%", width: scene.vertical ? "60%" : "40%", height: "55%", transform: `translate(${pulse * -42}px,${pulse * 14}px) scale(${0.88 + hook * 0.12})`})}
    {copy}
  </AbsoluteFill>;
};

const MotifReveal: React.FC<ProductVideoProps> = (props) => {
  const scene = useScene(props);
  const hook = range(scene.frame, [0, 18, 60], [0, 1, 0.86]);
  const progress = range(scene.frame, [8, 105], [0, 1]);
  const finish = range(scene.frame, [168, 222], [0, 1]);
  const heroVisibility = range(scene.frame, [0, 24, 60], [0.12, 0.82, 1]);
  const texture = props.polyHavenTexture?.localSrc;
  const hero = (style: React.CSSProperties) => <div style={{position: "absolute", zIndex: 4, opacity: heroVisibility, ...style}}><Product src={props.imageSrc} /></div>;
  const copy = <div style={{position: "absolute", left: "7%", right: "7%", bottom: "5%", zIndex: 5, opacity: finish}}><Copy scene={scene} light={scene.template.background.startsWith("#0")} centered={scene.template.layout === "center"} /></div>;
  const material = (style: React.CSSProperties, imageStyle?: React.CSSProperties) => <div style={{position: "absolute", overflow: "hidden", ...style}}><Material src={texture} style={{opacity: 0.84, mixBlendMode: "normal", ...imageStyle}} /></div>;

  if (props.templateId === "light-thread-reveal") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: "5%", top: "9%", width: `${18 + progress * 63}%`, height: 18, borderRadius: 18, transform: `rotate(${10 - progress * 22}deg)`, transformOrigin: "0 50%", boxShadow: `0 0 28px ${scene.accent}`}, {filter: "brightness(1.5) saturate(1.7)"})}
      <div style={{position: "absolute", left: `${7 + progress * 69}%`, top: `${13 + progress * 43}%`, width: 25, height: 25, borderRadius: "50%", background: scene.accent, boxShadow: `0 0 ${30 + hook * 55}px ${scene.accent}`, zIndex: 6}} />
      {hero({right: scene.vertical ? "4%" : "12%", top: "13%", width: scene.vertical ? "57%" : "39%", height: "61%", transform: `translateX(${(1 - progress) * 150}px) rotate(${(1 - progress) * 9}deg) scale(${0.88 + hook * 0.12})`})}{copy}
    </AbsoluteFill>;
  }
  if (props.templateId === "stamp-impression-reveal") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: "7%", top: `${-35 + progress * 48}%`, width: scene.vertical ? "68%" : "48%", height: "55%", border: `14px solid ${scene.accent}`, borderRadius: 28, transform: `rotate(${-8 + progress * 8}deg) scale(${1.35 - hook * 0.35})`, boxShadow: "0 35px 70px #0005"})}
      {hero({left: scene.vertical ? "14%" : "21%", top: "21%", width: scene.vertical ? "55%" : "37%", height: "55%", transform: `translateY(${(1 - progress) * -150}px) rotate(${(1 - progress) * -12}deg) scale(${0.9 + hook * 0.1})`})}{copy}
    </AbsoluteFill>;
  }
  if (props.templateId === "aperture-mark-reveal") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {Array.from({length: 8}).map((_, index) => material({left: "50%", top: "42%", width: `${46 + progress * 38}%`, aspectRatio: "1", clipPath: "polygon(50% 0,100% 48%,50% 58%,0 48%)", transform: `translate(-50%,-50%) rotate(${index * 45 - progress * 52}deg)`, transformOrigin: "50% 50%", opacity: 0.4 + index * 0.04}, {filter: `brightness(${0.45 + index * 0.06})`}))}
      {hero({left: "6%", top: "25%", width: scene.vertical ? "49%" : "34%", height: "51%", transform: `translate(${(1 - progress) * -150}px,${(1 - progress) * 90}px) rotate(${(1 - progress) * -16}deg) scale(${0.86 + hook * 0.14})`})}
      <div style={{position: "absolute", inset: "7%", border: `2px solid ${scene.accent}`, opacity: finish, zIndex: 4}} />{copy}
    </AbsoluteFill>;
  }
  if (props.templateId === "ribbon-signature-reveal") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: `${-58 + progress * 102}%`, top: `${9 + progress * 32}%`, width: "105%", height: 180, borderRadius: "50%", transform: `rotate(${-28 + progress * 42}deg)`, zIndex: progress > 0.55 ? 5 : 2}, {filter: "brightness(.75) saturate(1.5)"})}
      {hero({left: scene.vertical ? "31%" : "40%", top: "12%", width: scene.vertical ? "62%" : "42%", height: "63%", transform: `translateY(${(1 - progress) * 130}px) rotate(${8 - progress * 8}deg) scale(${0.88 + hook * 0.12})`})}{copy}
    </AbsoluteFill>;
  }
  if (props.templateId === "grid-signal-reveal") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: "8%", display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridTemplateRows: "repeat(9,1fr)", gap: 8}}>
        {Array.from({length: 63}).map((_, index) => {
          const active = progress * 72 - Math.abs(index - 31);
          return <div key={index} style={{position: "relative", border: `1px solid ${scene.accent}`, opacity: active > 0 ? Math.min(0.9, active * 0.08) : 0.08, overflow: "hidden"}}>{active > 0 ? <Material src={texture} style={{opacity: 0.78, mixBlendMode: "normal"}} /> : null}</div>;
        })}
      </div>
      {hero({right: "5%", bottom: "17%", width: scene.vertical ? "52%" : "35%", height: "52%", transform: `translate(${(1 - progress) * 120}px,${(1 - progress) * 90}px) rotate(${(1 - progress) * 12}deg) scale(${0.88 + hook * 0.12})`})}{copy}
    </AbsoluteFill>;
  }
  if (props.templateId === "shadow-glyph-reveal") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: "4%", top: "8%", width: scene.vertical ? "84%" : "59%", height: "72%", clipPath: "polygon(50% 0,100% 50%,50% 100%,0 50%)", transform: `rotate(${45 - progress * 45}deg) scale(${1.25 - progress * 0.25})`, transformOrigin: "50% 50%", filter: `drop-shadow(35px 45px 25px #000b)`}, {filter: "brightness(.64)"})}
      {hero({right: "8%", top: "20%", width: scene.vertical ? "51%" : "34%", height: "55%", transform: `translateX(${(1 - progress) * 170}px) rotate(${(1 - progress) * -10}deg) scale(${0.9 + hook * 0.1})`})}{copy}
    </AbsoluteFill>;
  }
  if (props.templateId === "particle-monogram-reveal") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {Array.from({length: 72}).map((_, index) => {
        const a = index * 2.399;
        const radius = 45 + progress * (110 + (index % 8) * 32);
        return material({left: `calc(27% + ${Math.cos(a) * radius}px)`, top: `calc(39% + ${Math.sin(a) * radius * 0.72}px)`, width: 8 + index % 5, height: 8 + index % 5, borderRadius: "50%", opacity: 0.28 + progress * 0.65, transform: "translate(-50%,-50%)"}, {filter: "saturate(1.6) brightness(1.2)"});
      })}
      {hero({left: "5%", top: "13%", width: scene.vertical ? "56%" : "38%", height: "58%", transform: `translateY(${(1 - progress) * 110}px) rotate(${(1 - progress) * 8}deg) scale(${0.86 + hook * 0.14})`})}{copy}
    </AbsoluteFill>;
  }
  if (props.templateId === "cutline-frame-reveal") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {material({left: 0, top: 0, bottom: 0, width: `${8 + progress * 43}%`, borderRight: `5px solid ${scene.accent}`, filter: `drop-shadow(0 0 ${hook * 40}px ${scene.accent})`}, {filter: "brightness(.52)"})}
      {material({right: 0, top: 0, bottom: 0, width: `${92 - progress * 43}%`}, {filter: "brightness(.28)"})}
      {hero({left: `${7 + progress * 38}%`, top: "16%", width: scene.vertical ? "50%" : "34%", height: "56%", transform: `translateX(-${progress * 20}%) rotate(${(1 - progress) * 7}deg) scale(${0.86 + hook * 0.14})`})}
      <div style={{position: "absolute", inset: `${7 + (1 - finish) * 35}%`, border: `3px solid ${scene.accent}`, opacity: finish, zIndex: 2}} />{copy}
    </AbsoluteFill>;
  }
  if (props.templateId === "echo-arc-reveal") {
    return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
      {[0, 1, 2, 3, 4].map((index) => material({left: "12%", top: "14%", width: `${28 + index * 15 + progress * 12}%`, aspectRatio: "1", borderRadius: "50%", clipPath: "polygon(50% 0,100% 0,100% 50%,50% 50%)", transform: `rotate(${progress * 190 + index * 19}deg)`, opacity: 0.28 + index * 0.1}, {filter: `brightness(${0.45 + index * 0.1})`}))}
      {hero({left: scene.vertical ? "38%" : "48%", top: "17%", width: scene.vertical ? "58%" : "40%", height: "58%", transform: `translate(${(1 - progress) * 130}px,${(1 - progress) * -70}px) rotate(${(1 - progress) * 14}deg) scale(${0.88 + hook * 0.12})`})}{copy}
    </AbsoluteFill>;
  }
  return <AbsoluteFill style={{background: scene.template.background, overflow: "hidden"}}>
    {material({left: 0, right: 0, top: `${72 - progress * 42}%`, bottom: 0, transform: `scaleY(${0.05 + progress * 0.95})`, transformOrigin: "50% 0", borderTop: `5px solid ${scene.accent}`}, {filter: "brightness(.65) saturate(1.25)"})}
    {hero({right: "7%", bottom: "17%", width: scene.vertical ? "55%" : "38%", height: "57%", transform: `translateY(${(1 - progress) * 180}px) rotate(${(1 - progress) * -9}deg) scale(${0.86 + hook * 0.14})`})}{copy}
  </AbsoluteFill>;
};

export const ProductTemplateBatch17: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "palindrome-hero":
      return <Palindrome {...props} />;
    case "product-callback":
      return <TheCallback {...props} />;
    case "orbit-relay":
    case "reflection-tide":
    case "folding-horizon-loop":
    case "eclipse-halo-loop":
    case "conveyor-infinity":
    case "magnetic-bloom-loop":
    case "prism-turn-loop":
    case "curtain-breath-loop":
    case "pendulum-stage-loop":
    case "ripple-return-loop":
      return <LoopDesign {...props} />;
    case "light-thread-reveal":
    case "stamp-impression-reveal":
    case "aperture-mark-reveal":
    case "ribbon-signature-reveal":
    case "grid-signal-reveal":
    case "shadow-glyph-reveal":
    case "particle-monogram-reveal":
    case "cutline-frame-reveal":
    case "echo-arc-reveal":
    case "material-seam-reveal":
      return <MotifReveal {...props} />;
    default:
      return null;
  }
};

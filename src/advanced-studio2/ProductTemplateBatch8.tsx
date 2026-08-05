import React from "react";
import {Video} from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {ProductVideoProps} from "./ProductVideo";
import {
  getProductTemplate,
  type ProductMediaSlotId,
} from "./product-templates";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const range = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, clamp);

const useStory = (props: ProductVideoProps) => {
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

type Story = ReturnType<typeof useStory>;

const mediaSource = (
  props: ProductVideoProps,
  id: ProductMediaSlotId,
  fallback = true,
) => props.media?.[id] || (fallback ? props.imageSrc : "");

const ImageAsset: React.FC<{
  src: string;
  fit?: "contain" | "cover";
  position?: string;
  style?: React.CSSProperties;
}> = ({src, fit = "cover", position = "center", style}) =>
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
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        border: "2px dashed currentColor",
        opacity: 0.35,
        fontWeight: 850,
        letterSpacing: 3,
      }}
    >
      ADD MEDIA
    </div>
  );

const ProductAsset: React.FC<{
  src: string;
  style?: React.CSSProperties;
}> = ({src, style}) => (
  <ImageAsset src={src} fit="contain" style={style} />
);

const VideoAsset: React.FC<{
  src: string;
  fallback: string;
  style?: React.CSSProperties;
}> = ({src, fallback, style}) =>
  src ? (
    <Video
      src={src}
      muted
      loop
      objectFit="cover"
      style={{width: "100%", height: "100%", ...style}}
    />
  ) : (
    <ImageAsset src={fallback} fit="cover" style={style} />
  );

const Label: React.FC<{v: Story; light?: boolean; text?: string}> = ({
  v,
  light = false,
  text,
}) => (
  <div
    style={{
      position: "absolute",
      left: "5%",
      top: "5%",
      zIndex: 5,
      color: light ? "#fff" : v.accent,
      fontSize: 15,
      fontWeight: 900,
      letterSpacing: 4,
    }}
  >
    {text || v.eyebrow}
  </div>
);

const AngleStudy: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const assets = [
    mediaSource(props, "hero"),
    mediaSource(props, "angleSide"),
    mediaSource(props, "angleThreeQuarter"),
  ];
  const shot = Math.min(2, Math.floor(v.frame / 68));
  const settle = spring({
    fps: v.fps,
    frame: v.frame - shot * 68,
    config: {damping: 20, stiffness: 105},
  });
  const final = range(v.frame, [214, 254], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        background: v.template.background,
        color: v.template.foreground,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "4%",
          display: "grid",
          gridTemplateColumns: v.vertical ? "1fr" : "34% 66%",
          background: v.template.surface,
        }}
      >
        <div
          style={{
            background: shot === 1 ? v.accent : "#efe9df",
            padding: "10%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <strong style={{fontSize: 18, letterSpacing: 4}}>
            VIEW 0{shot + 1}
          </strong>
          <div
            style={{
              fontFamily: "Georgia,serif",
              fontSize: v.vertical ? 78 : 62,
              lineHeight: 0.88,
            }}
          >
            Form,
            <br />
            considered.
          </div>
        </div>
        <div style={{position: "relative", minHeight: 0}}>
          <div
            style={{
              position: "absolute",
              inset: "7%",
              transform: `translateX(${(1 - settle) * 14}%) scale(${0.94 + settle * 0.06})`,
              filter: "drop-shadow(32px 42px 34px #0004)",
            }}
          >
            <ProductAsset src={assets[shot]} />
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: "4%",
          background: v.template.background,
          opacity: final,
          display: "grid",
          gridTemplateColumns: v.vertical ? "1fr" : "repeat(3,1fr)",
          gridTemplateRows: v.vertical ? "repeat(3,1fr)" : "1fr",
          gap: 8,
          padding: "5%",
        }}
      >
        {assets.map((src, index) => (
          <div
            key={index}
            style={{
              minHeight: 0,
              background: index === 1 ? v.accent : "#f5efe5",
              padding: "8%",
            }}
          >
            <ProductAsset src={src} />
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: "7%",
            right: "7%",
            bottom: "6%",
            background: v.template.background,
            padding: "24px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 24,
          }}
        >
          <strong style={{fontSize: v.vertical ? 64 : 56, lineHeight: 0.9}}>
            {v.headline}
          </strong>
          <span style={{color: v.accent, whiteSpace: "nowrap"}}>
            {v.cta} →
          </span>
        </div>
      </div>
      <Label v={v} />
    </AbsoluteFill>
  );
};

const DetailProof: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const detailOne = mediaSource(props, "detailOne");
  const detailTwo = mediaSource(props, "detailTwo");
  const hero = mediaSource(props, "hero");
  const reveal = range(v.frame, [132, 208], [0, 1]);
  const final = range(v.frame, [220, 258], [0, 1]);
  return (
    <AbsoluteFill
      style={{background: "#080808", color: "#fff9ed", overflow: "hidden"}}
    >
      <div style={{position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr"}}>
        <div style={{overflow: "hidden", transform: `translateY(${-v.frame * 0.12}%)`}}>
          <ImageAsset src={detailOne} fit="cover" style={{transform: "scale(1.18)"}} />
        </div>
        <div style={{overflow: "hidden", transform: `translateY(${v.frame * 0.12}%)`}}>
          <ImageAsset src={detailTwo} fit="cover" style={{transform: "scale(1.18)"}} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: v.template.background,
          clipPath: `inset(${(1 - reveal) * 50}% 0)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: v.vertical ? "50%" : "65%",
            top: v.vertical ? "39%" : "48%",
            width: v.vertical ? "76%" : "54%",
            height: v.vertical ? "59%" : "82%",
            transform: "translate(-50%,-50%)",
            filter: `drop-shadow(0 42px 54px ${v.accent}33)`,
          }}
        >
          <ProductAsset src={hero} />
        </div>
        <div
          style={{
            position: "absolute",
            left: "6%",
            top: v.vertical ? "8%" : "31%",
            width: v.vertical ? "84%" : "35%",
          }}
        >
          <div style={{color: v.accent, letterSpacing: 4, fontWeight: 900}}>
            DETAIL BECOMES PROOF
          </div>
          <div
            style={{
              fontFamily: "Georgia,serif",
              fontSize: v.vertical ? 76 : 64,
              lineHeight: 0.9,
              marginTop: 20,
            }}
          >
            Look closer.
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "5%",
          right: "5%",
          bottom: "5%",
          opacity: final,
          background: "#080808ee",
          borderTop: `2px solid ${v.accent}`,
          paddingTop: 24,
          display: "grid",
          gridTemplateColumns: v.vertical ? "1fr" : "1.25fr .8fr",
          gap: 28,
        }}
      >
        <strong style={{fontSize: v.vertical ? 76 : 64, lineHeight: 0.86}}>
          {v.headline}
        </strong>
        <div>
          <span style={{color: v.template.muted}}>{v.subheadline}</span>
          <b style={{display: "block", color: v.accent, marginTop: 16}}>
            {v.cta} →
          </b>
        </div>
      </div>
      <Label v={v} />
    </AbsoluteFill>
  );
};

const ProductInContext: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const hero = mediaSource(props, "hero");
  const lifestyle = mediaSource(props, "lifestyleImage");
  const context = range(v.frame, [0, 165], [1.12, 1]);
  const card = range(v.frame, [168, 226], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        background: v.template.background,
        color: v.template.foreground,
        overflow: "hidden",
      }}
    >
      <div style={{position: "absolute", inset: 0}}>
        <ImageAsset src={lifestyle} fit="cover" style={{transform: `scale(${context})`}} />
      </div>
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(90deg,#17130fbb,transparent 62%)"}} />
      <div
        style={{
          position: "absolute",
          left: v.vertical ? "50%" : "72%",
          top: v.vertical ? "40%" : "48%",
          width: v.vertical ? "74%" : "46%",
          height: v.vertical ? "58%" : "78%",
          transform: `translate(-50%,-50%) translateY(${(1 - card) * 50}px)`,
          filter: "drop-shadow(28px 42px 32px #0008)",
        }}
      >
        <ProductAsset src={hero} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "5%",
          bottom: "5%",
          width: v.vertical ? "90%" : "43%",
          background: v.template.surface,
          padding: v.vertical ? "38px" : "34px",
          opacity: card,
        }}
      >
        <div style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>
          {v.eyebrow}
        </div>
        <div style={{fontSize: v.vertical ? 76 : 62, lineHeight: 0.87, fontWeight: 900, marginTop: 18}}>
          {v.headline}
        </div>
        <div style={{color: v.template.muted, marginTop: 18}}>{v.subheadline}</div>
        <strong style={{display: "block", color: v.accent, marginTop: 18}}>
          {v.cta} →
        </strong>
      </div>
    </AbsoluteFill>
  );
};

const LiveDemonstration: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const hero = mediaSource(props, "hero");
  const video = mediaSource(props, "demoVideo", false);
  const finish = range(v.frame, [205, 248], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: "#fff", overflow: "hidden"}}>
      <div style={{position: "absolute", inset: "3%", overflow: "hidden"}}>
        <VideoAsset src={video} fallback={hero} />
        <div style={{position: "absolute", inset: 0, border: `2px solid ${v.accent}88`}} />
      </div>
      <div style={{position: "absolute", left: "5%", right: "5%", bottom: "5%", height: 6, background: "#ffffff33"}}>
        <div style={{width: `${range(v.frame, [0, 205], [0, 100])}%`, height: "100%", background: v.accent}} />
      </div>
      <Label v={v} light text="LIVE PRODUCT TEST / RECORDING" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: v.template.background,
          opacity: finish,
          display: "grid",
          gridTemplateColumns: v.vertical ? "1fr" : "1fr .9fr",
          padding: "7%",
          gap: 35,
        }}
      >
        <div style={{minHeight: 0, filter: `drop-shadow(0 45px 55px ${v.accent}44)`}}>
          <ProductAsset src={hero} />
        </div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <span style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</span>
          <strong style={{fontSize: v.vertical ? 80 : 68, lineHeight: 0.84, marginTop: 20}}>{v.headline}</strong>
          <span style={{color: v.template.muted, marginTop: 22, lineHeight: 1.4}}>{v.subheadline}</span>
          <b style={{color: v.accent, marginTop: 22}}>{v.cta} →</b>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BeforeAfter: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const before = mediaSource(props, "beforeImage");
  const after = mediaSource(props, "afterImage");
  const hero = mediaSource(props, "hero");
  const split = range(v.frame, [20, 190], [12, 88]);
  const finish = range(v.frame, [214, 254], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: "4%", overflow: "hidden"}}>
        <ImageAsset src={before} />
        <div style={{position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${split}%)`}}>
          <ImageAsset src={after} />
        </div>
        <div style={{position: "absolute", left: `${split}%`, top: 0, bottom: 0, width: 5, background: v.accent}}>
          <div style={{position: "absolute", left: "50%", top: "50%", width: 58, height: 58, borderRadius: "50%", background: v.accent, transform: "translate(-50%,-50%)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 900}}>↔</div>
        </div>
        <b style={{position: "absolute", left: 25, bottom: 22, background: "#fff", padding: "10px 14px"}}>BEFORE</b>
        <b style={{position: "absolute", right: 25, bottom: 22, background: v.accent, color: "#fff", padding: "10px 14px"}}>AFTER</b>
      </div>
      <div style={{position: "absolute", inset: 0, background: v.template.background, opacity: finish, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : ".9fr 1.1fr", padding: "7%", gap: 30}}>
        <div style={{minHeight: 0}}><ProductAsset src={hero} /></div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <span style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</span>
          <strong style={{fontSize: v.vertical ? 92 : 76, lineHeight: 0.82, marginTop: 20}}>{v.headline}</strong>
          <span style={{color: v.template.muted, marginTop: 22}}>{v.subheadline}</span>
          <b style={{color: v.accent, marginTop: 22}}>{v.cta} →</b>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ColorwayCollection: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const assets = [
    mediaSource(props, "hero"),
    mediaSource(props, "variantTwo"),
    mediaSource(props, "variantThree"),
  ];
  const colors = ["#ffd9de", "#c9dcff", "#e9ffb5"];
  const shot = Math.min(2, Math.floor(v.frame / 68));
  const enter = spring({fps: v.fps, frame: v.frame - shot * 68, config: {damping: 19, stiffness: 100}});
  const final = range(v.frame, [215, 254], [0, 1]);
  return (
    <AbsoluteFill style={{background: colors[shot], color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", left: "-10%", top: "-15%", fontSize: v.vertical ? 300 : 350, fontWeight: 950, color: "#ffffff66"}}>0{shot + 1}</div>
      <div style={{position: "absolute", left: "50%", top: v.vertical ? "42%" : "48%", width: v.vertical ? "78%" : "58%", height: v.vertical ? "62%" : "82%", transform: `translate(-50%,-50%) scale(${0.84 + enter * 0.16})`, filter: "drop-shadow(32px 42px 35px #0004)"}}>
        <ProductAsset src={assets[shot]} />
      </div>
      <Label v={v} text={`COLORWAY / 0${shot + 1}`} />
      <div style={{position: "absolute", inset: 0, background: v.template.background, opacity: final, padding: "6%", display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "repeat(3,1fr)", gridTemplateRows: v.vertical ? "repeat(3,1fr)" : "1fr", gap: 12}}>
        {assets.map((src, index) => (
          <div key={index} style={{minHeight: 0, background: colors[index], padding: "6%", display: "grid", placeItems: "center"}}>
            <ProductAsset src={src} />
          </div>
        ))}
        <div style={{position: "absolute", left: "8%", right: "8%", bottom: "7%", background: v.template.background, padding: "22px 25px", display: "flex", alignItems: "end", justifyContent: "space-between", gap: 20}}>
          <strong style={{fontSize: v.vertical ? 66 : 58, lineHeight: 0.88}}>{v.headline}</strong>
          <span style={{color: v.accent, whiteSpace: "nowrap"}}>{v.cta} →</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PackageToProduct: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const packaged = mediaSource(props, "packageImage");
  const unpacked = mediaSource(props, "unpackedImage");
  const swap = range(v.frame, [88, 152], [0, 1]);
  const final = range(v.frame, [215, 254], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: "5%", background: v.template.surface, boxShadow: "0 28px 70px #56493c33"}}>
        <div style={{position: "absolute", inset: "7%", opacity: 1 - swap, transform: `translateX(${-swap * 24}%) scale(${1 - swap * 0.08})`}}>
          <ProductAsset src={packaged} />
        </div>
        <div style={{position: "absolute", inset: "7%", opacity: swap, transform: `translateX(${(1 - swap) * 24}%) scale(${0.92 + swap * 0.08})`, filter: "drop-shadow(28px 38px 30px #0003)"}}>
          <ProductAsset src={unpacked} />
        </div>
        <div style={{position: "absolute", left: "5%", bottom: "5%", fontFamily: "monospace", color: v.accent}}>
          {swap < 0.5 ? "SEALED / ARRIVAL" : "OPEN / COMPLETE"}
        </div>
      </div>
      <Label v={v} />
      <div style={{position: "absolute", inset: 0, background: v.template.foreground, color: v.template.surface, opacity: final, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1fr .9fr", padding: "7%", gap: 32}}>
        <div style={{minHeight: 0, border: `1px solid ${v.accent}`, padding: "7%"}}><ProductAsset src={unpacked} /></div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <span style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</span>
          <strong style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 76 : 64, lineHeight: 0.88, marginTop: 20}}>{v.headline}</strong>
          <span style={{color: "#c7bdb0", marginTop: 22}}>{v.subheadline}</span>
          <b style={{color: v.accent, marginTop: 22}}>{v.cta} →</b>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FeatureInFocus: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const hero = mediaSource(props, "hero");
  const features = [mediaSource(props, "featureOne"), mediaSource(props, "featureTwo")];
  const active = Math.min(1, Math.floor(v.frame / 94));
  const finish = range(v.frame, [205, 248], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, opacity: 0.25, backgroundImage: `linear-gradient(${v.accent}22 1px,transparent 1px),linear-gradient(90deg,${v.accent}22 1px,transparent 1px)`, backgroundSize: "72px 72px"}} />
      <div style={{position: "absolute", left: v.vertical ? "50%" : "68%", top: v.vertical ? "39%" : "48%", width: v.vertical ? "72%" : "48%", height: v.vertical ? "56%" : "76%", transform: "translate(-50%,-50%)", filter: `drop-shadow(0 0 45px ${v.accent}33)`}}>
        <ProductAsset src={hero} />
      </div>
      <div style={{position: "absolute", left: "5%", top: v.vertical ? "8%" : "26%", width: v.vertical ? "45%" : "31%", height: v.vertical ? "23%" : "44%", background: v.template.surface, border: `1px solid ${v.accent}`, padding: 12, overflow: "hidden"}}>
        <ImageAsset src={features[active]} fit="cover" />
        <b style={{position: "absolute", left: 18, bottom: 16, background: v.template.background, color: v.accent, padding: "9px 12px"}}>FEATURE 0{active + 1}</b>
      </div>
      <Label v={v} />
      <div style={{position: "absolute", inset: 0, background: v.template.surface, opacity: finish, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : ".9fr 1.1fr", padding: "7%", gap: 30}}>
        <div style={{display: "grid", gridTemplateRows: "1fr 1fr", gap: 12, minHeight: 0}}>
          {features.map((src, index) => <div key={index} style={{overflow: "hidden", border: `1px solid ${v.accent}55`}}><ImageAsset src={src} /></div>)}
        </div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <div style={{height: v.vertical ? 420 : 330}}><ProductAsset src={hero} /></div>
          <strong style={{fontSize: v.vertical ? 72 : 60, lineHeight: 0.88, marginTop: 18}}>{v.headline}</strong>
          <span style={{color: v.template.muted, marginTop: 18}}>{v.subheadline}</span>
          <b style={{color: v.accent, marginTop: 18}}>{v.cta} →</b>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const HumanMoment: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const hero = mediaSource(props, "hero");
  const video = mediaSource(props, "lifestyleVideo", false);
  const curtain = range(v.frame, [190, 242], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: v.template.foreground, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0}}>
        <VideoAsset src={video} fallback={hero} style={{filter: "saturate(.82) contrast(1.05)"}} />
      </div>
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(180deg,#17120d66,transparent 48%,#17120daa)"}} />
      <div style={{position: "absolute", left: "6%", bottom: "7%", width: v.vertical ? "88%" : "48%"}}>
        <div style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 82 : 68, lineHeight: 0.88}}>Made for moments that become memories.</div>
      </div>
      <Label v={v} light />
      <div style={{position: "absolute", inset: 0, background: v.template.background, clipPath: `inset(0 ${50 - curtain * 50}% 0 ${50 - curtain * 50}%)`, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : "1fr .9fr", padding: "7%", gap: 30}}>
        <div style={{minHeight: 0, filter: "drop-shadow(30px 42px 32px #0008)"}}><ProductAsset src={hero} /></div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <span style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</span>
          <strong style={{fontFamily: "Georgia,serif", fontSize: v.vertical ? 78 : 66, lineHeight: 0.86, marginTop: 20}}>{v.headline}</strong>
          <span style={{color: v.template.muted, marginTop: 22}}>{v.subheadline}</span>
          <b style={{color: v.accent, marginTop: 22}}>{v.cta} →</b>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CampaignCut: React.FC<ProductVideoProps> = (props) => {
  const v = useStory(props);
  const hero = mediaSource(props, "hero");
  const campaignImage = mediaSource(props, "campaignImage");
  const campaignVideo = mediaSource(props, "campaignVideo", false);
  const shot = Math.min(2, Math.floor(v.frame / 70));
  const final = range(v.frame, [215, 252], [0, 1]);
  return (
    <AbsoluteFill style={{background: v.template.background, color: "#fff", overflow: "hidden"}}>
      {shot === 0 ? (
        <div style={{position: "absolute", inset: 0}}><ImageAsset src={campaignImage} /></div>
      ) : shot === 1 ? (
        <div style={{position: "absolute", inset: 0}}><VideoAsset src={campaignVideo} fallback={campaignImage || hero} /></div>
      ) : (
        <div style={{position: "absolute", inset: "5%", background: v.accent, padding: "6%"}}><ProductAsset src={hero} /></div>
      )}
      <div style={{position: "absolute", inset: 0, border: `${v.vertical ? 30 : 22}px solid ${v.template.background}`}} />
      <Label v={v} light text={`CAMPAIGN CUT / SHOT 0${shot + 1}`} />
      <div style={{position: "absolute", inset: 0, background: v.template.surface, color: "#171513", opacity: final, display: "grid", gridTemplateColumns: v.vertical ? "1fr" : ".9fr 1.1fr", padding: "6%", gap: 28}}>
        <div style={{position: "relative", minHeight: 0, background: v.accent, padding: "6%"}}>
          <ProductAsset src={hero} />
          <span style={{position: "absolute", left: 20, bottom: 18, color: "#fff", fontWeight: 900, letterSpacing: 3}}>MASTER / 01</span>
        </div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <span style={{color: v.accent, fontWeight: 900, letterSpacing: 4}}>{v.eyebrow}</span>
          <strong style={{fontSize: v.vertical ? 86 : 72, lineHeight: 0.82, letterSpacing: -4, marginTop: 20}}>{v.headline}</strong>
          <span style={{color: "#746d64", marginTop: 22, lineHeight: 1.4}}>{v.subheadline}</span>
          <b style={{color: v.accent, marginTop: 22}}>{v.cta} →</b>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch8: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "angle-study":
      return <AngleStudy {...props} />;
    case "detail-proof":
      return <DetailProof {...props} />;
    case "product-in-context":
      return <ProductInContext {...props} />;
    case "live-demonstration":
      return <LiveDemonstration {...props} />;
    case "before-after":
      return <BeforeAfter {...props} />;
    case "colorway-collection":
      return <ColorwayCollection {...props} />;
    case "package-to-product":
      return <PackageToProduct {...props} />;
    case "feature-in-focus":
      return <FeatureInFocus {...props} />;
    case "human-moment":
      return <HumanMoment {...props} />;
    case "campaign-cut":
      return <CampaignCut {...props} />;
    default:
      return null;
  }
};

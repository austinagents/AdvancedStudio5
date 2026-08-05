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

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const range = (frame: number, input: number[], output: number[]) => interpolate(frame, input, output, clamp);

const ProductCutout: React.FC<{
  src: string;
  color: string;
  fit?: "contain" | "cover";
  position?: string;
  style?: React.CSSProperties;
}> = ({src, color, fit = "contain", position = "center", style}) =>
  src ? <Img src={src} style={{width: "100%", height: "100%", objectFit: fit, objectPosition: position, ...style}} /> : (
    <div style={{width: "72%", height: "68%", border: `2px dashed ${color}`, display: "grid", placeItems: "center", color, fontSize: 22, fontWeight: 800, letterSpacing: 3, ...style}}>UPLOAD PRODUCT</div>
  );

const useBatch5 = (props: ProductVideoProps) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const template = getProductTemplate(props.templateId);
  return {
    frame, ...config, template,
    accent: props.accent || template.accent,
    eyebrow: props.eyebrow || template.eyebrow,
    headline: props.headline || template.headline,
    subheadline: props.subheadline || template.subheadline,
    cta: props.cta || template.cta,
    productName: props.productName || "Your Product",
    vertical: config.height / config.width > 1.55,
  };
};

const Glasshouse: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch5(props);
  const build = range(v.frame, [10, 115], [0, 1]);
  const hero = spring({fps: v.fps, frame: v.frame - 72, config: {damping: 22, stiffness: 72}});
  const final = range(v.frame, [225, 270], [0, 1]);
  const panels = [{x:-30,r:55,c:"#62d7ff33"},{x:-8,r:20,c:"#b695ff33"},{x:18,r:-24,c:"#58ffcf2d"},{x:36,r:-58,c:"#ff70b72d"}];
  return <AbsoluteFill style={{background:v.template.background,color:v.template.foreground,overflow:"hidden",perspective:1200}}>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 50%,${v.template.surface},transparent 58%)`}}/>
    {panels.map((p,i)=><div key={i} style={{position:"absolute",left:`${50+p.x*build}%`,top:"-10%",width:"28%",height:"120%",background:`linear-gradient(135deg,transparent,${p.c},transparent)`,border:`1px solid ${v.accent}33`,transform:`rotateY(${p.r*build}deg) rotateZ(${(i%2?1:-1)*8}deg)`,backdropFilter:"blur(3px)",mixBlendMode:"screen"}}/>)}
    <div style={{position:"absolute",left:"50%",top:v.vertical?"21%":"9%",width:v.vertical?"82%":"58%",height:v.vertical?"60%":"80%",transform:`translateX(-50%) scale(${hero})`,filter:`drop-shadow(0 35px 65px ${v.accent}38)`}}><ProductCutout src={props.imageSrc} color={v.accent}/></div>
    <div style={{position:"absolute",left:"5%",top:"5%",color:v.accent,fontWeight:900,letterSpacing:4}}>{v.eyebrow}</div>
    <div style={{position:"absolute",inset:0,padding:"7%",opacity:final,background:"linear-gradient(transparent 58%,rgba(7,16,23,.96) 90%)",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><div style={{fontSize:v.vertical?88:74,fontWeight:800,lineHeight:.87}}>{v.headline}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:24,marginTop:22}}><span style={{fontSize:20,color:v.template.muted}}>{v.subheadline}</span><strong style={{color:v.accent,whiteSpace:"nowrap"}}>{v.cta} →</strong></div></div>
  </AbsoluteFill>;
};

const PrecisionSlice: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch5(props);
  const resolve = range(v.frame,[145,215],[0,1]);
  const final = range(v.frame,[232,274],[0,1]);
  const slices = 14;
  return <AbsoluteFill style={{background:v.template.background,color:v.template.foreground,overflow:"hidden"}}>
    <div style={{position:"absolute",inset:v.vertical?"14% 5% 20%":"9% 4% 13%",display:"flex",gap:3}}>
      {Array.from({length:slices}).map((_,i)=>{const delay=Math.abs(i-slices/2)*5; const enter=spring({fps:v.fps,frame:v.frame-delay,config:{damping:18,stiffness:90}}); const offset=(i%2?1:-1)*(1-resolve)*80; return <div key={i} style={{position:"relative",flex:1,overflow:"hidden",transform:`translateY(${offset}px) scaleY(${enter})`,background:i%2?v.template.surface:v.accent}}><div style={{position:"absolute",width:`${slices*100}%`,height:"100%",left:`-${i*100}%`}}><ProductCutout src={props.imageSrc} color={v.accent}/></div></div>})}
    </div>
    <div style={{position:"absolute",left:"4%",right:"4%",top:"5%",display:"flex",justifyContent:"space-between",fontWeight:900,letterSpacing:3}}><span>{v.eyebrow}</span><span style={{color:v.accent}}>ALIGNMENT {Math.round(resolve*100)}%</span></div>
    <div style={{position:"absolute",left:"5%",right:"5%",bottom:"5%",borderTop:`2px solid ${v.template.foreground}`,paddingTop:18,opacity:final,display:"grid",gridTemplateColumns:v.vertical?"1fr":"1.35fr 1fr",gap:24}}><div style={{fontSize:v.vertical?76:64,fontWeight:950,lineHeight:.86}}>{v.headline}</div><div><div style={{fontSize:19,color:v.template.muted}}>{v.subheadline}</div><strong style={{display:"block",marginTop:15,color:v.accent}}>{v.cta} →</strong></div></div>
  </AbsoluteFill>;
};

const MacroCinema: React.FC<ProductVideoProps> = (props) => {
  const v = useBatch5(props);
  const act = Math.min(3,Math.floor(v.frame/58));
  const zooms=[3.8,2.7,1.8,1];
  const positions=[["42%","34%"],["58%","58%"],["48%","45%"],["50%","50%"]];
  const final=range(v.frame,[225,270],[0,1]);
  return <AbsoluteFill style={{background:v.template.background,color:v.template.foreground,overflow:"hidden"}}>
    <div style={{position:"absolute",left:positions[act][0],top:positions[act][1],width:v.vertical?"82%":"62%",height:v.vertical?"68%":"86%",transform:`translate(-50%,-50%) scale(${zooms[act]})`,filter:"drop-shadow(0 50px 65px rgba(0,0,0,.55))"}}><ProductCutout src={props.imageSrc} color={v.accent}/></div>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at ${positions[act][0]} ${positions[act][1]},transparent 12%,rgba(6,6,6,.72) 55%)`}}/>
    <div style={{position:"absolute",left:"5%",top:"5%",fontFamily:"monospace",color:v.accent}}>MACRO / 0{act+1} &nbsp; FOCUS / LOCKED</div>
    <div style={{position:"absolute",right:"5%",top:"5%",fontWeight:900,letterSpacing:4}}>{v.eyebrow}</div>
    <div style={{position:"absolute",inset:0,background:v.template.background,opacity:final,display:"grid",gridTemplateColumns:v.vertical?"1fr":"1fr .8fr",padding:"7%",gap:30}}><div style={{minHeight:0}}><ProductCutout src={props.imageSrc} color={v.accent} style={{filter:`drop-shadow(0 38px 55px ${v.accent}22)`}}/></div><div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}><div style={{color:v.accent,fontWeight:900,letterSpacing:4}}>{v.productName}</div><div style={{fontFamily:"Georgia,serif",fontSize:v.vertical?92:80,lineHeight:.82,marginTop:18}}>{v.headline}</div><div style={{fontSize:20,color:v.template.muted,marginTop:22}}>{v.subheadline}</div><strong style={{marginTop:25,color:v.accent}}>{v.cta} →</strong></div></div>
  </AbsoluteFill>;
};

const GravityField: React.FC<ProductVideoProps> = (props) => {
  const v=useBatch5(props);
  const stabilize=range(v.frame,[135,210],[0,1]);
  const final=range(v.frame,[230,272],[0,1]);
  return <AbsoluteFill style={{background:v.template.background,color:v.template.foreground,overflow:"hidden"}}>
    {Array.from({length:26}).map((_,i)=>{const angle=i*.91+v.frame*.018*(i%2?1:-1); const radius=(90+(i%7)*48)*(1-stabilize*.38); return <div key={i} style={{position:"absolute",left:`calc(50% + ${Math.cos(angle)*radius}px)`,top:`calc(50% + ${Math.sin(angle)*radius}px)`,width:5+(i%3)*3,aspectRatio:1,borderRadius:"50%",background:i%4===0?v.accent:"#dfffb3",boxShadow:`0 0 14px ${v.accent}`,opacity:.35+(i%4)*.14}}/>})}
    {[0,1,2].map((_,i)=><div key={i} style={{position:"absolute",left:"50%",top:"50%",width:`${38+i*20}%`,aspectRatio:1,borderRadius:"50%",border:`1px ${i%2?"dashed":"solid"} ${v.accent}55`,transform:`translate(-50%,-50%) rotate(${v.frame*(i%2?-.25:.18)}deg) scale(${.7+stabilize*.3})`}}/>)}
    <div style={{position:"absolute",left:"50%",top:v.vertical?"24%":"12%",width:v.vertical?"76%":"52%",height:v.vertical?"54%":"74%",transform:`translateX(-50%) translate(${(1-stabilize)*Math.sin(v.frame/5)*28}px,${(1-stabilize)*Math.cos(v.frame/7)*22}px)`,filter:`drop-shadow(0 0 45px ${v.accent}44)`}}><ProductCutout src={props.imageSrc} color={v.accent}/></div>
    <div style={{position:"absolute",left:"5%",top:"5%",color:v.accent,fontWeight:900,letterSpacing:4}}>{v.eyebrow}</div>
    <div style={{position:"absolute",left:"6%",right:"6%",bottom:"6%",opacity:final,display:"grid",gridTemplateColumns:v.vertical?"1fr":"1.25fr 1fr",gap:24,alignItems:"end"}}><div style={{fontSize:v.vertical?88:74,fontWeight:950,lineHeight:.85}}>{v.headline}</div><div><div style={{fontSize:20,color:v.template.muted}}>{v.subheadline}</div><strong style={{display:"block",marginTop:16,color:v.accent}}>{v.cta} →</strong></div></div>
  </AbsoluteFill>;
};

const ChromaticSignal: React.FC<ProductVideoProps> = (props) => {
  const v=useBatch5(props);
  const lock=range(v.frame,[150,220],[0,1]);
  const final=range(v.frame,[235,275],[0,1]);
  const channels=[{c:"#ff3158",x:-54,b:"screen" as const},{c:"#25e8ff",x:54,b:"screen" as const},{c:"#6854ff",x:0,b:"screen" as const}];
  return <AbsoluteFill style={{background:v.template.background,color:v.template.foreground,overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,opacity:.25,background:"repeating-linear-gradient(0deg,transparent 0,transparent 8px,#fff 9px)"}}/>
    {channels.map((ch,i)=><div key={ch.c} style={{position:"absolute",left:"50%",top:v.vertical?"22%":"9%",width:v.vertical?"82%":"60%",height:v.vertical?"61%":"82%",transform:`translateX(calc(-50% + ${ch.x*(1-lock)}px)) scale(${1+(1-lock)*i*.035})`,mixBlendMode:ch.b,filter:`drop-shadow(0 0 28px ${ch.c})`,opacity:.68+lock*.32}}><ProductCutout src={props.imageSrc} color={ch.c} style={{filter:`sepia(1) saturate(7) hue-rotate(${i*105}deg)`}}/></div>)}
    <div style={{position:"absolute",left:"5%",top:"5%",fontFamily:"monospace",fontWeight:900,color:v.accent}}>RGB / {Math.round(lock*100).toString().padStart(3,"0")} / LOCK</div>
    <div style={{position:"absolute",inset:0,padding:"7%",opacity:final,background:"linear-gradient(transparent 58%,rgba(5,6,17,.97) 89%)",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><div style={{fontSize:v.vertical?90:78,fontWeight:950,lineHeight:.84}}>{v.headline}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:24,marginTop:22}}><span style={{fontSize:20,color:v.template.muted}}>{v.subheadline}</span><strong style={{background:v.accent,padding:"15px 21px",whiteSpace:"nowrap"}}>{v.cta} →</strong></div></div>
  </AbsoluteFill>;
};

const MuseumAfterDark: React.FC<ProductVideoProps> = (props) => {
  const v=useBatch5(props);
  const room=range(v.frame,[0,165],[0,1]);
  const final=range(v.frame,[225,270],[0,1]);
  const light=range(v.frame,[15,200],[-20,120]);
  return <AbsoluteFill style={{background:v.template.background,color:v.template.foreground,overflow:"hidden",perspective:1200}}>
    <div style={{position:"absolute",inset:"5%",background:v.template.surface,clipPath:`polygon(${12-room*12}% 0,${88+room*12}% 0,100% 100%,0 100%)`,boxShadow:"inset 0 0 120px #000"}}/>
    <div style={{position:"absolute",left:"17%",right:"17%",bottom:v.vertical?"17%":"9%",height:"26%",background:"#171411",transform:"rotateX(64deg)",border:`1px solid ${v.accent}44`}}/>
    <div style={{position:"absolute",inset:0,background:`linear-gradient(105deg,transparent ${light-12}%,${v.accent}55 ${light}%,transparent ${light+14}%)`,mixBlendMode:"screen"}}/>
    <div style={{position:"absolute",left:"50%",top:v.vertical?"24%":"12%",width:v.vertical?"72%":"48%",height:v.vertical?"54%":"72%",transform:`translateX(-50%) scale(${.82+room*.18})`,filter:"drop-shadow(0 55px 48px rgba(0,0,0,.6))"}}><ProductCutout src={props.imageSrc} color={v.accent}/></div>
    <div style={{position:"absolute",left:"6%",top:"6%",fontWeight:900,letterSpacing:4,color:v.accent}}>{v.eyebrow}</div>
    <div style={{position:"absolute",left:"6%",right:"6%",bottom:"6%",opacity:final,display:"flex",justifyContent:"space-between",alignItems:"end",gap:24}}><div><div style={{fontFamily:"Georgia,serif",fontSize:v.vertical?75:64,lineHeight:.9}}>{v.headline}</div><div style={{fontSize:19,color:v.template.muted,marginTop:14}}>{v.subheadline}</div></div><strong style={{color:v.accent,whiteSpace:"nowrap"}}>{v.cta} →</strong></div>
  </AbsoluteFill>;
};

const PaperEngineering: React.FC<ProductVideoProps> = (props) => {
  const v=useBatch5(props);
  const build=range(v.frame,[0,175],[0,1]);
  const final=range(v.frame,[228,272],[0,1]);
  const planes=[{l:"4%",t:"18%",r:-16,c:"#ff684d"},{l:"58%",t:"8%",r:18,c:"#67b7c8"},{l:"8%",t:"62%",r:12,c:"#e8ba4a"},{l:"62%",t:"58%",r:-20,c:"#31576a"}];
  return <AbsoluteFill style={{background:v.template.background,color:v.template.foreground,overflow:"hidden",perspective:1100}}>
    {planes.map((p,i)=><div key={i} style={{position:"absolute",left:p.l,top:p.t,width:v.vertical?"42%":"36%",height:"38%",background:p.c,clipPath:"polygon(0 0,100% 10%,90% 100%,12% 88%)",transformOrigin:i%2?"left":"right",transform:`rotate(${p.r}deg) rotateY(${(1-build)*(i%2?100:-100)}deg)`,boxShadow:"0 22px 34px rgba(29,44,54,.15)"}}/>)}
    <div style={{position:"absolute",left:"50%",top:v.vertical?"22%":"10%",width:v.vertical?"78%":"55%",height:v.vertical?"58%":"76%",transform:`translateX(-50%) translateY(${(1-build)*130}px)`,filter:"drop-shadow(0 38px 40px rgba(29,44,54,.2))"}}><ProductCutout src={props.imageSrc} color={v.accent}/></div>
    <div style={{position:"absolute",left:"5%",top:"5%",fontWeight:900,letterSpacing:4}}>{v.eyebrow}</div>
    <div style={{position:"absolute",inset:"5%",background:v.template.surface,transform:`translateY(${(1-final)*115}%) rotate(${(1-final)*-3}deg)`,boxShadow:"0 30px 65px rgba(29,44,54,.2)",display:"grid",gridTemplateColumns:v.vertical?"1fr":"1fr .85fr",padding:"7%",gap:28}}><div style={{minHeight:0}}><ProductCutout src={props.imageSrc} color={v.accent}/></div><div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}><div style={{color:v.accent,fontWeight:900,letterSpacing:3}}>{v.productName}</div><div style={{fontSize:v.vertical?82:68,fontWeight:900,lineHeight:.86,marginTop:18}}>{v.headline}</div><div style={{fontSize:20,color:v.template.muted,marginTop:20}}>{v.subheadline}</div><strong style={{marginTop:24,color:v.accent}}>{v.cta} →</strong></div></div>
  </AbsoluteFill>;
};

const LightboxSequence: React.FC<ProductVideoProps> = (props) => {
  const v=useBatch5(props);
  const setup=Math.min(3,Math.floor(v.frame/58));
  const final=range(v.frame,[230,273],[0,1]);
  const backgrounds=[
    `linear-gradient(90deg,#050505 48%,${v.accent} 50%,#050505 52%)`,
    `radial-gradient(circle at 25% 40%,${v.accent}88,transparent 38%),#101010`,
    `linear-gradient(135deg,#e7e2da,#8a8176)`,
    `radial-gradient(circle,#fff 0,#d9d4cc 48%,#56514b 100%)`,
  ];
  const filters=["brightness(.25) contrast(2)","saturate(1.5)","contrast(1.08)","drop-shadow(0 42px 45px rgba(0,0,0,.3))"];
  return <AbsoluteFill style={{background:backgrounds[setup],color:setup>1?"#111":"#fff",overflow:"hidden"}}>
    <div style={{position:"absolute",left:"50%",top:v.vertical?"21%":"8%",width:v.vertical?"84%":"62%",height:v.vertical?"63%":"84%",transform:"translateX(-50%)"}}><ProductCutout src={props.imageSrc} color={v.accent} style={{filter:filters[setup]}}/></div>
    <div style={{position:"absolute",left:"5%",top:"5%",fontFamily:"monospace",fontWeight:900}}>LIGHT 0{setup+1} / {["RIM","COLOR","TEXTURE","SOFTBOX"][setup]}</div>
    <div style={{position:"absolute",right:"5%",top:"5%",fontWeight:900,letterSpacing:3}}>{v.eyebrow}</div>
    <div style={{position:"absolute",left:"5%",right:"5%",bottom:"5%",background:"#101010",color:"#fff",padding:"3%",opacity:final,display:"flex",justifyContent:"space-between",alignItems:"end",gap:24}}><div><div style={{fontSize:v.vertical?74:62,fontWeight:900,lineHeight:.88}}>{v.headline}</div><div style={{fontSize:19,color:v.template.muted,marginTop:12}}>{v.subheadline}</div></div><strong style={{color:v.accent,whiteSpace:"nowrap"}}>{v.cta} →</strong></div>
  </AbsoluteFill>;
};

const AnalogCampaign: React.FC<ProductVideoProps> = (props) => {
  const v=useBatch5(props);
  const travel=range(v.frame,[0,205],[0,-62]);
  const final=range(v.frame,[228,273],[0,1]);
  const frames=7;
  return <AbsoluteFill style={{background:v.template.background,color:v.template.foreground,overflow:"hidden"}}>
    <div style={{position:"absolute",left:`${travel}%`,top:v.vertical?"17%":"9%",height:v.vertical?"65%":"78%",display:"flex",gap:18,width:"260%"}}>
      {Array.from({length:frames}).map((_,i)=><div key={i} style={{width:`${100/frames}%`,background:v.template.surface,padding:18,flex:"0 0 auto",transform:`rotate(${i%2?2:-2}deg)`,boxShadow:"0 18px 28px rgba(30,25,18,.18)"}}><div style={{height:"88%",overflow:"hidden",filter:i%3===0?"grayscale(1) contrast(1.2)":i%3===1?"sepia(.75)":"saturate(.65)"}}><ProductCutout src={props.imageSrc} color={v.accent} fit="cover" position={i%2?"right":"left"} style={{transform:`scale(${1.1+i*.08})`}}/></div><div style={{color:"#fff",fontFamily:"monospace",marginTop:8}}>FRAME / {41+i}</div></div>)}
    </div>
    <div style={{position:"absolute",left:"4%",top:"4%",background:v.accent,color:"#fff",padding:"9px 13px",fontWeight:900,letterSpacing:3}}>{v.eyebrow}</div>
    <div style={{position:"absolute",inset:"4%",background:v.template.surface,color:"#fff",transform:`translateY(${(1-final)*110}%)`,display:"grid",gridTemplateColumns:v.vertical?"1fr":"1fr .85fr",padding:"7%",gap:28}}><div style={{minHeight:0,border:"12px solid #f4efe7"}}><ProductCutout src={props.imageSrc} color={v.accent} fit="cover"/></div><div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}><div style={{color:v.accent,fontFamily:"monospace",fontWeight:900}}>FINAL SELECT / 01</div><div style={{fontFamily:"Georgia,serif",fontSize:v.vertical?76:64,lineHeight:.88,marginTop:18}}>{v.headline}</div><div style={{fontSize:20,color:"#aaa",marginTop:20}}>{v.subheadline}</div><strong style={{marginTop:24,color:v.accent}}>{v.cta} →</strong></div></div>
  </AbsoluteFill>;
};

const BrandTakeover: React.FC<ProductVideoProps> = (props) => {
  const v=useBatch5(props);
  const act=Math.min(3,Math.floor(v.frame/58));
  const final=range(v.frame,[228,272],[0,1]);
  const placements=[
    {inset:"8% 52% 42% 7%",r:-4},{inset:"14% 8% 32% 56%",r:5},{inset:"55% 42% 6% 18%",r:-2},
  ];
  return <AbsoluteFill style={{background:v.template.background,color:v.template.foreground,overflow:"hidden",perspective:1100}}>
    <div style={{position:"absolute",inset:0,opacity:.16,backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",backgroundSize:"70px 70px"}}/>
    {placements.map((p,i)=>{const enter=spring({fps:v.fps,frame:v.frame-i*18,config:{damping:18,stiffness:90}}); return <div key={i} style={{position:"absolute",inset:p.inset,background:i===1?v.accent:v.template.surface,padding:"2%",transform:`rotate(${p.r}deg) scale(${enter}) translateZ(${i*35}px)`,boxShadow:"0 28px 55px rgba(0,0,0,.35)",opacity:act>=i?1:.25}}><ProductCutout src={props.imageSrc} color={v.accent}/><strong style={{position:"absolute",left:"5%",bottom:"5%",color:i===1?"#fff":"#111"}}>{v.productName} / LIVE</strong></div>})}
    <div style={{position:"absolute",left:"5%",top:"5%",fontWeight:900,letterSpacing:4}}>{v.eyebrow}</div>
    <div style={{position:"absolute",inset:0,background:v.accent,color:"#fff",clipPath:`inset(${(1-final)*50}% ${(1-final)*50}%)`,display:"grid",gridTemplateColumns:v.vertical?"1fr":"1fr .82fr",padding:"7%",gap:30}}><div style={{minHeight:0}}><ProductCutout src={props.imageSrc} color="#fff" style={{filter:"drop-shadow(25px 32px 0 rgba(0,0,0,.2))"}}/></div><div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}><div style={{fontWeight:900,letterSpacing:4}}>{v.productName}</div><div style={{fontSize:v.vertical?96:84,fontWeight:950,lineHeight:.8,marginTop:18}}>{v.headline}</div><div style={{fontSize:20,marginTop:22}}>{v.subheadline}</div><strong style={{marginTop:25,color:v.template.background}}>{v.cta} →</strong></div></div>
  </AbsoluteFill>;
};

export const ProductTemplateBatch5: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "glasshouse": return <Glasshouse {...props}/>;
    case "precision-slice": return <PrecisionSlice {...props}/>;
    case "macro-cinema": return <MacroCinema {...props}/>;
    case "gravity-field": return <GravityField {...props}/>;
    case "chromatic-signal": return <ChromaticSignal {...props}/>;
    case "museum-after-dark": return <MuseumAfterDark {...props}/>;
    case "paper-engineering": return <PaperEngineering {...props}/>;
    case "lightbox-sequence": return <LightboxSequence {...props}/>;
    case "analog-campaign": return <AnalogCampaign {...props}/>;
    case "brand-takeover": return <BrandTakeover {...props}/>;
    default: return null;
  }
};

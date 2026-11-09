import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { estimatedWords, sceneBoundaries, type VideoProps } from '../lib/model';

const palettes = { lilac:{bg:'#ded7f5',ink:'#27213c',label:'#c4b5e8'}, mint:{bg:'#e0eadb',ink:'#21372c',label:'#bbd0af'}, dark:{bg:'#20242a',ink:'#f4f3ef',label:'#373f46'} };
export const AdComposition: React.FC<VideoProps> = ({project,imageSrc,voiceSrc}) => {
  const frame=useCurrentFrame();const {fps,durationInFrames}=useVideoConfig();const time=frame/fps;
  const palette=palettes[project.theme];const boundaries=sceneBoundaries(project);
  const scene=Math.min(3, Math.max(0,boundaries.findIndex((b,i)=>i<4&&time>=b&&time<boundaries[i+1])));
  const localFrame=Math.max(0,frame-boundaries[scene]*fps);const enter=spring({frame:localFrame,fps,config:{damping:26,stiffness:100}});
  const words=project.voice?.words||estimatedWords(project);const active=words.findIndex(w=>time>=w.start&&time<w.end);
  const wordIndex=active>=0?active:Math.max(0,words.findLastIndex(w=>time>=w.start));const group=Math.floor(wordIndex/5)*5;
  const image=imageSrc||(project.product.image==='/demo-product.jpg'?staticFile('demo-product.jpg'):project.product.image);
  const cta={uz:'Batafsil ko‘ring',ru:'Узнать больше',en:'Take a closer look',kk:'Толығырақ біліңіз',tr:'Daha yakından bakın'}[project.language];
  return <AbsoluteFill style={{backgroundColor:palette.bg,color:palette.ink,fontFamily:'Manrope, sans-serif',overflow:'hidden'}}>
    <style>{`@font-face{font-family:Manrope;src:url('${staticFile('fonts/manrope-latin.woff2')}') format('woff2');font-weight:200 800} @font-face{font-family:Manrope;src:url('${staticFile('fonts/manrope-cyrillic.woff2')}') format('woff2');font-weight:200 800;unicode-range:U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}`}</style>
    <div style={{position:'absolute',top:90,left:74,right:74,display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:25,fontWeight:700,letterSpacing:2}}><span>ADCLONE STUDIO</span><span style={{border:`2px solid ${palette.ink}`,borderRadius:30,padding:'10px 21px',fontSize:20}}>{project.product.demo?'NAMUNA':'PRODUCT FILM'}</span></div>
    <div style={{position:'absolute',top:195,left:74,right:74,fontSize:project.product.title.length>35?70:102,lineHeight:1.08,fontWeight:800,letterSpacing:-4,overflowWrap:'anywhere',translate:`0 ${interpolate(enter,[0,1],[28,0])}px`}}>{project.product.title}</div>
    <div style={{position:'absolute',top:465,left:58,right:58,height:790,overflow:'hidden',borderRadius:28,background:'#fff',rotate:`${interpolate(frame,[0,durationInFrames],[-2.2,2.2])}deg`,scale:interpolate(localFrame,[0, Math.max(1,(boundaries[scene+1]-boundaries[scene])*fps)],[1,1.045],{extrapolateRight:'clamp'})}}>
      <Img src={image} style={{width:'100%',height:'100%',objectFit:'cover'}} />
    </div>
    {!!project.product.price&&<div style={{position:'absolute',top:1205,right:70,background:project.captionColor,color:'#20242a',padding:'24px 35px',borderRadius:20,fontSize:48,fontWeight:800,rotate:'-5deg'}}>{project.product.price}</div>}
    <div style={{position:'absolute',top:1390,left:75,right:75,display:'flex',flexWrap:'wrap',justifyContent:'center',alignContent:'center',gap:'12px 16px',minHeight:140,fontSize:53,lineHeight:1.3,fontWeight:800,textAlign:'center'}}>
      {project.captions?words.slice(group,group+5).map((w,i)=><span key={`${group}-${i}`} style={{background:group+i===wordIndex?project.captionColor:'transparent',color:group+i===wordIndex?'#20242a':palette.ink,padding:'2px 8px',borderRadius:8}}>{w.word}</span>):<span style={{fontSize:40}}>{project.scenes[scene].text}</span>}
    </div>
    <div style={{position:'absolute',bottom:160,left:74,right:74,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:25,fontWeight:600}}>{project.product.marketplace}</div>
      <div style={{padding:'24px 35px',background:palette.ink,color:palette.bg,fontSize:30,fontWeight:750,borderRadius:45}}>{cta} ↗</div>
    </div>
    <div style={{position:'absolute',bottom:92,left:74,right:74,display:'flex',gap:12}}>{[0,1,2,3].map(i=><div key={i} style={{height:5,flex:1,borderRadius:3,background:palette.ink,opacity:i<=scene?1:.2}}/>)}</div>
    {project.voice&&<Audio src={voiceSrc||project.voice.url} />}
    {project.music&&<Audio src={staticFile('studio-beat.wav')} loop volume={project.voice?0.10:0.25} />}
  </AbsoluteFill>;
};

'use client';

import {useEffect,useState} from 'react';

export function DoorEntrance(){
 const[opening,setOpening]=useState(false);
 const[visible,setVisible]=useState(false);
 useEffect(()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadySeen=sessionStorage.getItem('k2nobeit-entrance-seen')==='true';
  if(reduced||alreadySeen)return;
  setVisible(true);
  sessionStorage.setItem('k2nobeit-entrance-seen','true');
  const openTimer=setTimeout(()=>setOpening(true),reduced?120:650);
  const hideTimer=setTimeout(()=>setVisible(false),reduced?450:2300);
  return()=>{clearTimeout(openTimer);clearTimeout(hideTimer)};
 },[]);
 if(!visible)return null;
 return <div className={`coded-entrance ${opening?'coded-entrance-open':''}`} aria-label="باب كانو بيت يفتح للمنيو" aria-live="polite">
  <div className="entrance-embroidery entrance-embroidery-right" aria-hidden="true"/>
  <div className="entrance-embroidery entrance-embroidery-left" aria-hidden="true"/>
  <div className="coded-brand" aria-hidden="true"><span>⌂</span><b>كانو بيت</b><small>KANO BEIT</small></div>
  <div className="coded-wood-note" aria-hidden="true">أكل بيتي<br/>بطعم الدار<br/><span>♥</span></div>
  <div className="coded-lantern" aria-hidden="true"><i/><b/></div>
  <div className="coded-plant coded-plant-right" aria-hidden="true"><i/><i/><i/><i/><i/><b/></div>
  <div className="coded-plant coded-plant-left" aria-hidden="true"><i/><i/><i/><i/><i/><b/></div>
  <div className="coded-home-sign"><span>الدار أمان</span></div>
  <div className="coded-door-frame" aria-hidden="true">
   <div className="coded-doorway"/>
   <div className="coded-door coded-door-right">
    <div className="coded-door-carving"><span>◆</span><span>✦</span><span>◆</span></div>
    <div className="coded-door-window"><span/><span/><span/><span/><span/></div>
    <div className="coded-door-panel"/>
    <div className="coded-door-rosette">✦</div>
    <div className="coded-door-handle"/>
   </div>
   <div className="coded-door coded-door-left">
    <div className="coded-door-carving"><span>◆</span><span>✦</span><span>◆</span></div>
    <div className="coded-door-window"><span/><span/><span/><span/><span/></div>
    <div className="coded-door-panel"/>
    <div className="coded-door-rosette">✦</div>
   </div>
  </div>
  <div className="coded-threshold" aria-hidden="true"><span>كانو بيت</span></div>
  <p className="coded-tagline">أكل بيتي، بطعم الدار</p>
 </div>
}

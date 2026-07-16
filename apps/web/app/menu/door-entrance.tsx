"use client";

import { useEffect, useRef, useState } from "react";

export function DoorEntrance() {
  const [opening, setOpening] = useState(false);
  const [visible, setVisible] = useState(true);
  const openTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const openDoor = () => {
    if (opening) return;
    setOpening(true);
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setVisible(false), 1_850);
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    openTimer.current = window.setTimeout(() => setOpening(true), reducedMotion ? 500 : 1_050);
    hideTimer.current = window.setTimeout(() => setVisible(false), reducedMotion ? 1_150 : 3_250);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (openTimer.current !== null) window.clearTimeout(openTimer.current);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      className={`coded-entrance ${opening ? "coded-entrance-open" : ""}`}
      aria-label="باب كأنه بيت يفتح للمنيو"
      aria-live="polite"
    >
      <div className="entrance-embroidery entrance-embroidery-right" aria-hidden="true" />
      <div className="entrance-embroidery entrance-embroidery-left" aria-hidden="true" />
      <div className="coded-brand" aria-hidden="true"><span>⌂</span><b>كأنه بيت</b><small>KANO BEIT</small></div>
      <div className="coded-wood-note" aria-hidden="true">أكل بيتي<br />بطعم الدار<br /><span>♥</span></div>
      <div className="coded-lantern" aria-hidden="true"><i /><b /></div>
      <div className="coded-plant coded-plant-right" aria-hidden="true"><i /><i /><i /><i /><i /><b /></div>
      <div className="coded-plant coded-plant-left" aria-hidden="true"><i /><i /><i /><i /><i /><b /></div>
      <div className="coded-home-sign"><span>أهلًا وسهلًا في كأنه بيت</span></div>
      <div className="coded-door-frame" aria-hidden="true">
        <div className="coded-doorway"><span>نورتوا الدار</span></div>
        <div className="coded-door coded-door-right">
          <div className="coded-door-carving"><span>◆</span><span>✦</span><span>◆</span></div>
          <div className="coded-door-window"><span /><span /><span /><span /><span /></div>
          <div className="coded-door-panel" /><div className="coded-door-rosette">✦</div><div className="coded-door-handle" />
        </div>
        <div className="coded-door coded-door-left">
          <div className="coded-door-carving"><span>◆</span><span>✦</span><span>◆</span></div>
          <div className="coded-door-window"><span /><span /><span /><span /><span /></div>
          <div className="coded-door-panel" /><div className="coded-door-rosette">✦</div>
        </div>
      </div>
      <div className="coded-threshold" aria-hidden="true"><span>كأنه بيت</span></div>
      <p className="coded-tagline">أكل بيتي، بطعم الدار</p>
      <button type="button" className="coded-skip" onClick={openDoor}>ادخل الدار</button>
    </div>
  );
}

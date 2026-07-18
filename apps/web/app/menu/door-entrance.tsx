"use client";

import { useEffect, useRef, useState } from "react";

export function DoorEntrance({ ready = true }: { ready?: boolean }) {
  const [opening, setOpening] = useState(false);
  const [visible, setVisible] = useState(true);
  const openTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const finishEntrance = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (!ready) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    openTimer.current = window.setTimeout(() => setOpening(true), reducedMotion ? 120 : 350);
    hideTimer.current = window.setTimeout(finishEntrance, reducedMotion ? 650 : 1_850);
    return () => {
      if (openTimer.current !== null) window.clearTimeout(openTimer.current);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, [ready]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
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
      <div className="coded-brand" aria-hidden="true"><span>⌂</span><b>كأنه بيت</b><small>KA&apos;ANAH BEIT</small></div>
      <div className="coded-wood-note" aria-hidden="true">أكل بيتي<br />بطعم البيت<br /><span>♥</span></div>
      <div className="coded-lantern" aria-hidden="true"><i /><b /></div>
      <div className="coded-plant coded-plant-right" aria-hidden="true"><i /><i /><i /><i /><i /><b /></div>
      <div className="coded-plant coded-plant-left" aria-hidden="true"><i /><i /><i /><i /><i /><b /></div>
      <div className="coded-home-sign"><span>الدار أمان</span></div>
      <div className="coded-door-frame" aria-hidden="true">
        <div className="coded-doorway"><span>نورتوا البيت</span></div>
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
      <div className="coded-threshold" aria-hidden="true" />
      <p className="coded-tagline">أكل بيتي، بطعم البيت</p>
    </div>
  );
}

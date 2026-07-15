"use client";
import { useEffect, useState } from "react";
type Theme = "day" | "night";
type PlantState = "idle" | "inviting" | "watering" | "bloomed";
export function AmbientExperience() {
  const [theme, setTheme] = useState<Theme>("day");
  const [plantState, setPlantState] = useState<PlantState>("idle");
  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) || "day";
    setTheme(current);
    const watered = localStorage.getItem("k2nobeit-plant-watered") === "true";
    setPlantState(watered ? "bloomed" : "idle");
    if (!watered) {
      const timer = window.setTimeout(() => setPlantState("inviting"), 2600);
      return () => window.clearTimeout(timer);
    }
  }, []);
  function toggleTheme() {
    const next = theme === "day" ? "night" : "day";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("k2nobeit-theme", next);
  }
  function water() {
    if (plantState === "watering" || plantState === "bloomed") return;
    setPlantState("watering");
    window.setTimeout(() => {
      setPlantState("bloomed");
      localStorage.setItem("k2nobeit-plant-watered", "true");
    }, 2600);
  }
  return (
    <>
      <RestaurantBackdrop />
      <HouseLightSwitch theme={theme} onToggle={toggleTheme} />
      <PlantInteraction state={plantState} onWater={water} />
      <div className="ambient-grain" aria-hidden="true" />
    </>
  );
}

function RestaurantBackdrop() {
  return (
    <div className="restaurant-backdrop" aria-hidden="true">
      <div className="restaurant-sunlight"><i /><i /><i /></div>
      <div className="restaurant-wood restaurant-wood-left" />
      <div className="restaurant-wood restaurant-wood-right" />
      <div className="restaurant-curtain restaurant-curtain-left"><i /><i /><i /></div>
      <div className="restaurant-curtain restaurant-curtain-right"><i /><i /><i /></div>
      <VineSide side="left" />
      <VineSide side="right" />
      <div className="hanging-plants hanging-plants-left">
        <VineSprig />
        <VineSprig />
        <VineSprig />
      </div>
      <div className="hanging-plants hanging-plants-right">
        <VineSprig />
        <VineSprig />
      </div>
    </div>
  );
}

function VineSide({ side }: { side: "left" | "right" }) {
  return (
    <svg className={`vine-side vine-side-${side}`} viewBox="0 0 150 900" preserveAspectRatio="none">
      <path className="vine-stem" d="M72-20C18 105 126 176 65 292S120 470 55 585 100 765 62 930" />
      {[[48,70,-35],[91,127,30],[48,198,-28],[92,260,35],[42,355,-32],[89,420,31],[39,520,-35],[88,588,34],[41,690,-29],[88,760,31],[46,845,-32]].map(([x,y,r], i) => (
        <ellipse key={i} className="vine-leaf" cx={x} cy={y} rx="27" ry="13" transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </svg>
  );
}

function VineSprig() {
  return (
    <span className="vine-sprig">
      <i /><i /><i /><i />
    </span>
  );
}
function HouseLightSwitch({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  const night = theme === "night";
  return (
    <aside className="house-switch-wrap" data-mode={theme}>
      <span className="house-switch-label">
        {night ? "شغّل ضو النهار" : "طفي الضو"}
      </span>
      <button
        className="house-switch"
        type="button"
        role="switch"
        aria-checked={night}
        aria-label={night ? "تشغيل الوضع النهاري" : "تشغيل الوضع الليلي"}
        onClick={onToggle}
      >
        <span className="switch-plate">
          <span className="switch-toggle" />
        </span>
        <svg className="switch-pendant" viewBox="0 0 72 112" aria-hidden="true">
          <defs>
            <linearGradient id="amberPendantGlass" x1="0" x2="1">
              <stop offset="0" stopColor="#8f4b16" />
              <stop offset=".24" stopColor="#d98a2b" />
              <stop offset=".5" stopColor="#ffd27a" />
              <stop offset=".76" stopColor="#c46f20" />
              <stop offset="1" stopColor="#71330d" />
            </linearGradient>
            <linearGradient id="pendantMetal" x1="0" x2="1">
              <stop offset="0" stopColor="#171512" />
              <stop offset=".52" stopColor="#b37832" />
              <stop offset="1" stopColor="#211b16" />
            </linearGradient>
          </defs>
          <path className="pendant-cord" d="M36 0v29" />
          <path className="pendant-cap" d="M28 28h16l3 10H25Z" />
          <path className="pendant-glass" d="M28 37C27 55 15 66 9 77c-4 8 3 14 27 14s31-6 27-14C57 66 45 55 44 37Z" />
          <g className="pendant-ribs">
            <path d="M31 39c-1 20-8 35-10 49M35 39l-3 51M41 39c1 20 8 35 10 49" />
          </g>
          <path className="pendant-rim" d="M11 82c10 5 40 5 50 0" />
          <ellipse className="pendant-bulb" cx="36" cy="72" rx="8" ry="11" />
          <ellipse className="pendant-glow" cx="36" cy="75" rx="28" ry="25" />
        </svg>
      </button>
    </aside>
  );
}
function PlantInteraction({
  state,
  onWater,
}: {
  state: PlantState;
  onWater: () => void;
}) {
  return (
    <aside
      className={`plant-interaction plant-${state}`}
      aria-label="نبتة الدار"
    >
      <WaterPlantPrompt
        visible={state === "inviting" || state === "idle"}
        onClick={onWater}
      />
      <WateringCan active={state === "watering"} />
      <WaterDroplets active={state === "watering"} />
      <PlantBackground bloomed={state === "bloomed" || state === "watering"} />
    </aside>
  );
}
function WaterPlantPrompt({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`water-prompt ${visible ? "water-prompt-visible" : ""}`}
      onClick={onClick}
      aria-label="اسقِ زريعتك"
    >
      اسقِ زريعتك
    </button>
  );
}
function WateringCan({ active }: { active: boolean }) {
  return (
    <svg
      className={`watering-can ${active ? "watering-can-active" : ""}`}
      viewBox="0 0 150 100"
      aria-hidden="true"
    >
      <path d="M38 38h70v48H38z" />
      <path d="M108 48 145 33v13l-37 19Z" />
      <path d="M47 38c0-30 48-31 52 0" />
      <path d="M54 28h37" />
      <path d="M62 86h22" />
    </svg>
  );
}
function WaterDroplets({ active }: { active: boolean }) {
  return (
    <span
      className={`water-drops ${active ? "water-drops-active" : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: 7 }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
}
function PlantBackground({ bloomed }: { bloomed: boolean }) {
  return (
    <svg
      className={`plant-art ${bloomed ? "plant-art-bloomed" : ""}`}
      viewBox="0 0 260 430"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="potClay" x1="0" x2="1">
          <stop offset="0" stopColor="#713a27" />
          <stop offset=".38" stopColor="#bd7650" />
          <stop offset=".7" stopColor="#985036" />
          <stop offset="1" stopColor="#592e22" />
        </linearGradient>
        <linearGradient id="leafGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#91a565" />
          <stop offset=".48" stopColor="#607a43" />
          <stop offset="1" stopColor="#344d2e" />
        </linearGradient>
      </defs>
      <ellipse className="plant-shadow" cx="132" cy="398" rx="92" ry="16" />
      <path className="plant-pot" d="M63 315h138l-16 92H80Z" />
      <path className="plant-pot-rim" d="M52 304h158v27H52Z" />
      <g className="plant-stems">
        <path d="M130 311Q120 205 75 125M132 310Q142 188 190 95M130 306Q124 170 132 58M128 304Q88 230 42 213M136 309Q174 250 221 219" />
      </g>
      <g className="plant-leaves">
        <ellipse
          cx="79"
          cy="131"
          rx="25"
          ry="11"
          transform="rotate(34 79 131)"
        />
        <ellipse
          cx="91"
          cy="163"
          rx="28"
          ry="12"
          transform="rotate(-20 91 163)"
        />
        <ellipse
          cx="57"
          cy="191"
          rx="26"
          ry="11"
          transform="rotate(24 57 191)"
        />
        <ellipse
          cx="45"
          cy="221"
          rx="27"
          ry="12"
          transform="rotate(-8 45 221)"
        />
        <ellipse
          cx="189"
          cy="104"
          rx="26"
          ry="11"
          transform="rotate(-35 189 104)"
        />
        <ellipse
          cx="174"
          cy="145"
          rx="28"
          ry="12"
          transform="rotate(20 174 145)"
        />
        <ellipse
          cx="201"
          cy="180"
          rx="27"
          ry="11"
          transform="rotate(-22 201 180)"
        />
        <ellipse
          cx="220"
          cy="223"
          rx="28"
          ry="12"
          transform="rotate(12 220 223)"
        />
        <ellipse
          cx="130"
          cy="70"
          rx="25"
          ry="11"
          transform="rotate(-8 130 70)"
        />
        <ellipse
          cx="111"
          cy="103"
          rx="26"
          ry="11"
          transform="rotate(25 111 103)"
        />
        <ellipse
          cx="149"
          cy="132"
          rx="27"
          ry="12"
          transform="rotate(-25 149 132)"
        />
        <ellipse
          cx="113"
          cy="208"
          rx="30"
          ry="13"
          transform="rotate(18 113 208)"
        />
        <ellipse
          cx="158"
          cy="238"
          rx="30"
          ry="13"
          transform="rotate(-20 158 238)"
        />
      </g>
      <g className="plant-flowers">
        <g transform="translate(72 112)">
          <circle r="12" />
          <circle cx="12" r="12" />
          <circle cx="6" cy="10" r="12" />
          <circle className="flower-heart" cx="6" cy="4" r="5" />
        </g>
        <g transform="translate(183 82)">
          <circle r="10" />
          <circle cx="10" r="10" />
          <circle cx="5" cy="9" r="10" />
          <circle className="flower-heart" cx="5" cy="4" r="4" />
        </g>
        <g transform="translate(125 48)">
          <circle r="9" />
          <circle cx="10" r="9" />
          <circle cx="5" cy="8" r="9" />
          <circle className="flower-heart" cx="5" cy="3" r="4" />
        </g>
      </g>
      <g className="plant-sparkles">
        <circle cx="43" cy="145" r="3" />
        <circle cx="212" cy="139" r="2" />
        <circle cx="160" cy="75" r="2.5" />
        <circle cx="95" cy="224" r="2" />
      </g>
    </svg>
  );
}

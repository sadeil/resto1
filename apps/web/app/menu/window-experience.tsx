"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ArrowUp,
  ChevronDown,
  Facebook,
  Instagram,
  Leaf,
  MapPin,
  Phone,
  Search,
  Share2,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { DoorEntrance } from "./door-entrance";
import { AmbientExperience } from "./ambient-experience";
type Variant = { id: string; name: string; price: string };
type AddOn = { id: string; name: string; nameEn: string | null; price: string };
type Choice = {
  id: string;
  name: string;
  required: boolean;
  options: { id: string; name: string }[];
};
type Item = {
  id: string;
  name: string;
  description: string | null;
  fullIngredients: string[];
  quantityLabel: string | null;
  price: string | null;
  proteinType: string | null;
  proteinWeight: string | null;
  includesRegularFries: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
  featured: boolean;
  subcategory: {
    id: string;
    name: string;
    nameEn: string | null;
    sortOrder: number;
  } | null;
  variants: Variant[];
  addOns: AddOn[];
  choiceGroups: Choice[];
};
type Category = {
  id: string;
  name: string;
  description: string | null;
  items: Item[];
};
type MenuData = {
  settings: {
    name: string;
    nameEn: string;
    description: string;
    currency: string;
    status: string;
    closedMessage: string;
    primaryColor: string;
  };
  categories: Category[];
};
const trays: Record<string, string> = {
  الفطور: "/images/window-menu/breakfast-cartoon.png",
  الساندويشات: "/images/window-menu/sandwiches-cartoon.png",
  البرجرات: "/images/window-menu/burgers-cartoon.png",
  الوجبات: "/images/window-menu/meals-cartoon.png",
  "المشروبات الساخنة": "/images/window-menu/winter-drinks-cartoon.png",
  "المشروبات الباردة": "/images/window-menu/cold-drinks-cartoon.png",
  الأراجيل: "/images/window-menu/argeeleh-cartoon.png",
  السلطات: "/images/window-menu/salads-cartoon.png",
  المقبلات: "/images/window-menu/appetizers-cartoon.png",
};
const clean = (name: string) => name.replace(/[^\u0600-\u06FF\s]/g, "").trim();
function woodSound() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    const ctx = new Audio();
    const duration = 0.13;
    const buffer = ctx.createBuffer(
      1,
      ctx.sampleRate * duration,
      ctx.sampleRate,
    );
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++)
      channel[i] =
        (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 240;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = 0.065;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    source.onended = () => ctx.close();
  } catch {}
}
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
export function WindowMenu({ initial }: { initial: MenuData | null }) {
  const query = useQuery({
    queryKey: ["menu"],
    queryFn: () => api<MenuData>("/menu"),
    initialData: initial || undefined,
    retry: 4,
    retryDelay: (attempt) => Math.min(2_000 * (attempt + 1), 6_000),
  });
  const data = query.data;
  const [first] = data?.categories || [];
  const [selectedId, setSelectedId] = useState(first?.id || "");
  const [shownId, setShownId] = useState(first?.id || "");
  const [phase, setPhase] = useState<"ready" | "retreat" | "enter">("ready");
  const transitionTimer = useRef<number | null>(null);
  const transitionFrame = useRef<number | null>(null);
  const pointerFrame = useRef<number | null>(null);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<Item | null>(null);
  const [promoPhase, setPromoPhase] = useState<"hidden" | "showing" | "leaving">("hidden");
  const featuredItem = useMemo(
    () => data?.categories.flatMap((category) => category.items).find((item) => item.featured) || null,
    [data],
  );
  const selected = data?.categories.find((c) => c.id === selectedId) || first;
  const shown = data?.categories.find((c) => c.id === shownId) || first;
  const items = useMemo(
    () =>
      selected?.items.filter((i) =>
        (i.name + " " + i.fullIngredients.join(" ")).includes(q),
      ) || [],
    [selected, q],
  );
  const isWinterDrinks = clean(selected?.name || "") === "المشروبات الساخنة";
  const isColdDrinks = clean(selected?.name || "") === "المشروبات الباردة";
  const isShownHotDrinks = clean(shown?.name || "") === "المشروبات الساخنة";
  const isShownColdDrinks = clean(shown?.name || "") === "المشروبات الباردة";
  const isArgeeleh = clean(selected?.name || "") === "الأراجيل";
  const categoryAddOns =
    isArgeeleh || isWinterDrinks ? items[0]?.addOns || [] : [];
  const coldGroups = useMemo(() => {
    if (!isColdDrinks) return [];
    const groups = new Map<
      string,
      { subcategory: NonNullable<Item["subcategory"]>; items: Item[] }
    >();
    for (const item of items) {
      if (!item.subcategory) continue;
      const current = groups.get(item.subcategory.id);
      if (current) current.items.push(item);
      else
        groups.set(item.subcategory.id, {
          subcategory: item.subcategory,
          items: [item],
        });
    }
    return [...groups.values()].sort(
      (a, b) => a.subcategory.sortOrder - b.subcategory.sortOrder,
    );
  }, [isColdDrinks, items]);
  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    if (transitionFrame.current !== null) window.cancelAnimationFrame(transitionFrame.current);
    if (pointerFrame.current !== null) window.cancelAnimationFrame(pointerFrame.current);
  }, []);
  useEffect(() => {
    if (!featuredItem) return;
    const showTimer = window.setTimeout(() => setPromoPhase("showing"), 15_000);
    const leaveTimer = window.setTimeout(() => setPromoPhase("leaving"), 24_400);
    const hideTimer = window.setTimeout(() => setPromoPhase("hidden"), 25_000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [featuredItem]);
  function choose(id: string, sound = false) {
    if (id === selectedId || phase !== "ready") return;
    if (sound) woodSound();
    setPhase("retreat");
    transitionTimer.current = window.setTimeout(() => {
      setShownId(id);
      setSelectedId(id);
      setPhase("enter");
      transitionFrame.current = window.requestAnimationFrame(() => {
        transitionFrame.current = window.requestAnimationFrame(() => setPhase("ready"));
      });
    }, 390);
  }
  function moveWindow(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const target = event.currentTarget;
    if (pointerFrame.current !== null) window.cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = window.requestAnimationFrame(() => {
      target.style.setProperty("--window-x", x.toFixed(3));
      target.style.setProperty("--window-y", y.toFixed(3));
      target.style.setProperty("--light-x", `${(50 + x * 18).toFixed(1)}%`);
      target.style.setProperty("--light-y", `${(55 + y * 12).toFixed(1)}%`);
      pointerFrame.current = null;
    });
  }
  function resetWindow(event: React.PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--window-x", "0");
    event.currentTarget.style.setProperty("--window-y", "0");
    event.currentTarget.style.setProperty("--light-x", "50%");
    event.currentTarget.style.setProperty("--light-y", "55%");
  }
  if (!data)
    return <State loading={query.isFetching} retry={() => query.refetch()} />;
  const tray = trays[clean(shown?.name || "")];
  const renderItemCard = (item: Item) => (
    <button
      key={item.id}
      className="window-item-card"
      onClick={() => setModal(item)}
    >
      <span className="card-spotlight" aria-hidden="true" />
      {item.imageUrl && (
        <span className="dish-card-image" aria-hidden="true">
          <img src={item.imageUrl} alt="" loading="lazy" />
        </span>
      )}
      <div className="dish-card-copy">
        {item.featured && <span>الطبق المميز</span>}
        <h3>{item.name}</h3>
        {(isArgeeleh || isWinterDrinks || isColdDrinks) && item.description && (
          <p className="item-english" dir="ltr">
            {item.description}
          </p>
        )}
        {isWinterDrinks && item.fullIngredients.length > 0 && (
          <p className="winter-drink-ingredients">
            {item.fullIngredients.join("، ")}
          </p>
        )}
        {item.proteinWeight && (
          <p>
            {item.proteinWeight} {item.proteinType}
          </p>
        )}
        <strong>
          {item.variants.length ? "ابتداءً من " : ""}
          {item.variants[0]?.price || item.price} {data.settings.currency}
        </strong>
      </div>
      <span className="card-action" aria-hidden="true">
        <ChevronDown />
      </span>
    </button>
  );
  return (
    <>
      <DoorEntrance />
      {featuredItem && promoPhase !== "hidden" && (
        <FeaturedToday
          item={featuredItem}
          currency={data.settings.currency}
          leaving={promoPhase === "leaving"}
          close={() => setPromoPhase("hidden")}
          details={() => {
            setPromoPhase("hidden");
            setModal(featuredItem);
          }}
        />
      )}
      <main
        style={{ "--brand": data.settings.primaryColor } as React.CSSProperties}
        className="window-menu"
      >
        <AmbientExperience />
        <header className="window-menu-header restaurant-hero">
          <span className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <span className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="brand-lockup">
            <img
              className="brand-logo"
              src="/images/brand/kano-beit-logo.png"
              alt={data.settings.name}
            />
            <div className="brand-caption">
              <span dir="ltr">{data.settings.nameEn}</span>
              <h1 className="sr-only">{data.settings.name}</h1>
              <p>{data.settings.description}</p>
              <div className="hero-signals">
                <span className="hero-open-state">
                  <i aria-hidden="true" />
                  {data.settings.status === "OPEN" ? "مفتوح الآن" : "مغلق الآن"}
                </span>
                <span className="hero-house-note"><Leaf size={14} /> من مطبخ الدار</span>
              </div>
            </div>
          </div>
          <button
            aria-label="مشاركة المنيو"
            onClick={() =>
              navigator.share?.({
                title: data.settings.name,
                url: location.href,
              })
            }
          >
            <Share2 />
          </button>
        </header>
        {data.settings.status !== "OPEN" && (
          <p className="mx-auto max-w-4xl rounded-xl bg-terra/10 p-4 text-center font-bold text-terra">
            {data.settings.closedMessage}
          </p>
        )}
        <div className="house-manifesto" aria-hidden="true">
          <span>قعدة بتشبه البيت</span><i />
          <span>أكل معمول على مهله</span><i />
          <span>لَمّة إلها طعم</span>
        </div>
        <nav className="window-categories" aria-label="تصنيفات المنيو">
          {data.categories.map((c) => (
            <button
              key={c.id}
              aria-current={selectedId === c.id ? "true" : undefined}
              onClick={() => choose(c.id, true)}
              onMouseEnter={() => choose(c.id)}
            >
              {clean(c.name)}
            </button>
          ))}
        </nav>
        <section
          className={`kitchen-window kitchen-window-${phase}`}
          aria-live="polite"
          onPointerMove={moveWindow}
          onPointerLeave={resetWindow}
        >
          <aside className="window-side-note window-side-note-right" aria-hidden="true">
            <small>من هون الحكاية</small><strong>اختار صينيّتك</strong><i />
          </aside>
          <aside className="window-side-note window-side-note-left" aria-hidden="true">
            <b>01</b><span dir="ltr">FROM OUR<br />KITCHEN WINDOW</span>
          </aside>
          <img
            className="kitchen-window-base"
            src="/images/window-menu/window-cartoon-transparent-v3.png"
            alt="شباك مطبخ بيت فلسطيني تقليدي"
          />
          <div className="kitchen-interior-dim" aria-hidden="true" />
          <div className="window-story-label" aria-hidden="true">
            <Sparkles size={13} />
            <span>اختار، واحنا منجهّزها</span>
          </div>
          <div className="curtain-sway curtain-sway-right" />
          <div className="curtain-sway curtain-sway-left" />
          <div className="shutter-motion shutter-motion-right" />
          <div className="shutter-motion shutter-motion-left" />
          {tray && (
            <div className="tray-stage">
              {isShownHotDrinks && (
                <div className="steam" aria-hidden="true">
                  <i /><i /><i /><i /><i />
                </div>
              )}
              {isShownColdDrinks && (
                <div className="ice-cubes" aria-hidden="true">
                  <i /><i /><i /><i /><i />
                </div>
              )}
              <img
                key={tray}
                className={`category-tray ${clean(shown?.name || "") === "السلطات" ? "tray-dark-bg" : ""}`}
                src={tray}
                alt={`صينية ${clean(shown?.name || "")}`}
              />
              <span className="tray-shadow" />
            </div>
          )}
        </section>
        <a className="menu-scroll-cue" href="#selected-menu">
          <span>اكتشف القائمة</span>
          <ChevronDown size={17} />
        </a>
        <section className="selected-menu" id="selected-menu">
          <div className="chair-sticker" aria-hidden="true">
            <img src="/images/decor/patterned-chair-sticker.png" alt="" />
          </div>
          <span className="menu-editorial-mark" aria-hidden="true">MENU · منيو الدار</span>
          <div className="selected-menu-heading">
            <div>
              <small>من شباك الدار</small>
              <h2 key={selectedId}>{clean(selected?.name || "")}</h2>
              {selected?.description && (
                <em className="category-english" dir="ltr">
                  {selected.description}
                </em>
              )}
              <span className="menu-count">
                <b>{items.length}</b>
                <span>{items.length === 1 ? "صنف" : "أصناف"}</span>
              </span>
            </div>
            <label>
              <Search />
              <span className="sr-only">بحث</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث في هالقسم…"
              />
            </label>
          </div>
          {isWinterDrinks && items.length > 0 && (
            <div className="seasonal-menu-heading">
              <span aria-hidden="true" className="seasonal-flake">
                <i />
              </span>
              <div>
                <small dir="ltr">Hot Drinks</small>
                <h3>{items[0].subcategory?.name || "مشروبات ساخنة"}</h3>
              </div>
              <span className="seasonal-line" aria-hidden="true" />
            </div>
          )}
          {items.length && isColdDrinks ? (
            <div key={selectedId} className="cold-drink-sections">
              {coldGroups.map((group) => (
                <section
                  className="cold-drink-group"
                  key={group.subcategory.id}
                >
                  <header>
                    <div>
                      <small dir="ltr">{group.subcategory.nameEn}</small>
                      <h3>{group.subcategory.name}</h3>
                    </div>
                    <span>{group.items.length}</span>
                  </header>
                  <div className="window-items cold-drinks-grid">
                    {group.items.map(renderItemCard)}
                  </div>
                </section>
              ))}
            </div>
          ) : items.length ? (
            <div
              key={selectedId}
              className={`window-items ${isWinterDrinks ? "winter-drinks-grid" : ""}`}
            >
              {items.map(renderItemCard)}
            </div>
          ) : (
            <div className="window-empty">
              <UtensilsCrossed />
              <p>ما لقينا أطباق بهالبحث.</p>
            </div>
          )}
          {categoryAddOns.length > 0 && (
            <section
              className="argeeleh-addons"
              aria-labelledby="argeeleh-addons-title"
            >
              <header>
                <div>
                  <small dir="ltr">Add-ons</small>
                  <h3 id="argeeleh-addons-title">
                    {isWinterDrinks ? "الإضافات" : "إضافات الأرجيلة"}
                  </h3>
                </div>
                <span aria-hidden="true" />
              </header>
              <div className="argeeleh-addon-list">
                {categoryAddOns.map((addOn) => (
                  <article key={addOn.id}>
                    <div>
                      <h4>{addOn.name}</h4>
                      {addOn.nameEn && <p dir="ltr">+ {addOn.nameEn}</p>}
                    </div>
                    <strong>
                      +{addOn.price} {data.settings.currency}
                    </strong>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>
        <footer className="restaurant-footer">
          <div className="footer-main">
            <div className="footer-brand">
              <img src="/images/brand/kano-beit-logo.png" alt={data.settings.name} />
              <div>
                <strong>{data.settings.name}</strong>
                <small dir="ltr">{data.settings.nameEn}</small>
              </div>
              <p>{data.settings.description}</p>
              <div className="footer-socials">
                <a href="https://instagram.com/k2nobeit" target="_blank" rel="noreferrer" aria-label="إنستغرام"><Instagram /></a>
                <a href="https://facebook.com/k2nobeit" target="_blank" rel="noreferrer" aria-label="فيسبوك"><Facebook /></a>
              </div>
            </div>
            <nav className="footer-column" aria-label="روابط المنيو">
              <h2>منيو الدار</h2>
              {data.categories.slice(0, 6).map((category) => (
                <button key={category.id} onClick={() => { choose(category.id, true); document.getElementById("selected-menu")?.scrollIntoView({ behavior: "smooth" }); }}>
                  {clean(category.name)}
                </button>
              ))}
            </nav>
            <div className="footer-column footer-contact">
              <h2>تواصل معنا</h2>
              <a href="tel:022989647"><Phone /><span><small>للحجز والاستفسار</small><b dir="ltr">02 298 9647</b></span></a>
              <a href="https://maps.app.goo.gl/fcZTv9Uqmx4G4SvcA?g_st=ic" target="_blank" rel="noreferrer"><MapPin /><span><small>موقعنا</small><b>افتح الاتجاهات</b></span></a>
              <a href="https://instagram.com/k2nobeit" target="_blank" rel="noreferrer"><Instagram /><span><small>إنستغرام</small><b dir="ltr">@k2nobeit</b></span></a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {data.settings.name}. جميع الحقوق محفوظة.</span>
            <span dir="ltr">FOOD · COFFEE · GOOD COMPANY</span>
          </div>
        </footer>
        <button
          onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
          className="window-top"
          aria-label="العودة للأعلى"
        >
          <ArrowUp />
        </button>
        {modal && (
          <DishModal
            item={modal}
            currency={data.settings.currency}
            close={() => setModal(null)}
          />
        )}
      </main>
    </>
  );
}
function FeaturedToday({
  item,
  currency,
  leaving,
  close,
  details,
}: {
  item: Item;
  currency: string;
  leaving: boolean;
  close: () => void;
  details: () => void;
}) {
  const price = item.variants[0]?.price || item.price;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);
  return (
    <aside
      className={`featured-today ${leaving ? "featured-today-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="featured-today-title"
    >
      <div className="featured-glow" aria-hidden="true" />
      <button className="featured-close" onClick={close} aria-label="إغلاق الصنف المميز">
        <X />
      </button>
      <div className="featured-copy">
        <span className="featured-kicker"><Sparkles size={18} /> اختيار الدار</span>
        <p className="featured-eyebrow">الصنف المميز اليوم</p>
        <h2 id="featured-today-title">{item.name}</h2>
        {item.description && <p className="featured-description">{item.description}</p>}
        <div className="featured-price">
          {item.variants.length > 0 && <small>ابتداءً من</small>}
          <strong>{price} {currency}</strong>
        </div>
        <button className="featured-action" onClick={details}>شوف التفاصيل</button>
      </div>
      <div className={`featured-visual ${item.imageUrl ? "" : "featured-visual-empty"}`}>
        {item.imageUrl ? <img src={item.imageUrl} alt={item.imageAlt || item.name} /> : <UtensilsCrossed size={88} />}
        <span aria-hidden="true">مميز اليوم</span>
      </div>
      <div className="featured-progress" aria-hidden="true"><i /></div>
    </aside>
  );
}
function DishModal({
  item,
  currency,
  close,
}: {
  item: Item;
  currency: string;
  close: () => void;
}) {
  const [variant, setVariant] = useState(item.variants[0]);
  const [extras, setExtras] = useState<string[]>([]);
  const [choices, setChoices] = useState<Record<string, string>>({});
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close]);
  const total =
    Number(variant?.price || item.price || 0) +
    item.addOns
      .filter((a) => extras.includes(a.id))
      .reduce((n, a) => n + Number(a.price), 0);
  return (
    <div
      className="dish-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-name"
        className="dish-dialog"
      >
        <span className="dish-drag-handle" aria-hidden="true" />
        <button onClick={close} aria-label="إغلاق">
          <X />
        </button>
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.imageAlt || item.name} />
        )}
        <div className="dish-content">
          <h2 id="dish-name">{item.name}</h2>
          {item.proteinWeight && (
            <p className="dish-protein">
              {item.proteinWeight} {item.proteinType}
            </p>
          )}
          {item.fullIngredients.length > 0 && (
            <div>
              <h3>المكونات</h3>
              <ul>
                {item.fullIngredients.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          {item.variants.length > 0 && (
            <fieldset>
              <legend>اختر الحجم</legend>
              {item.variants.map((v) => (
                <label key={v.id}>
                  <input
                    type="radio"
                    checked={variant?.id === v.id}
                    onChange={() => setVariant(v)}
                  />
                  {v.name}
                  <b>
                    {v.price} {currency}
                  </b>
                </label>
              ))}
            </fieldset>
          )}
          {item.choiceGroups.map((g) => (
            <fieldset key={g.id}>
              <legend>{g.name}</legend>
              {g.options.map((o) => (
                <label key={o.id}>
                  <input
                    required={g.required}
                    type="radio"
                    name={g.id}
                    checked={choices[g.id] === o.id}
                    onChange={() => setChoices((s) => ({ ...s, [g.id]: o.id }))}
                  />
                  {o.name}
                </label>
              ))}
            </fieldset>
          ))}
          {item.addOns.length > 0 && (
            <fieldset>
              <legend>إضافات اختيارية</legend>
              {item.addOns.map((a) => (
                <label key={a.id}>
                  <input
                    type="checkbox"
                    checked={extras.includes(a.id)}
                    onChange={() =>
                      setExtras((s) =>
                        s.includes(a.id)
                          ? s.filter((x) => x !== a.id)
                          : [...s, a.id],
                      )
                    }
                  />
                  {a.name}
                  {a.nameEn && <small dir="ltr">{a.nameEn}</small>}
                  <b>
                    +{a.price} {currency}
                  </b>
                </label>
              ))}
            </fieldset>
          )}
          <footer>
            <span>السعر</span>
            <b>
              {total} {currency}
            </b>
          </footer>
        </div>
      </article>
    </div>
  );
}
function State({ loading, retry }: { loading: boolean; retry: () => void }) {
  return (
    <div className="window-empty min-h-screen">
      <UtensilsCrossed />
      <p>{loading ? "بنجهّز شباك الدار… قد يستغرق تشغيل الخدمة لحظات" : "تعذّر تحميل المنيو"}</p>
      {!loading && <button onClick={retry}>حاول مرة ثانية</button>}
    </div>
  );
}

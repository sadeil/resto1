"use client";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ArrowUp,
  ChevronDown,
  Search,
  Share2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { DoorEntrance } from "./door-entrance";
type Variant = {
  id: string;
  name: string;
  weight: string | null;
  price: string;
};
type AddOn = { id: string; name: string; price: string };
type ChoiceGroup = {
  id: string;
  name: string;
  required: boolean;
  minChoices: number;
  maxChoices: number;
  options: { id: string; name: string; price: string }[];
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
  subcategory: { id: string; name: string; sortOrder: number } | null;
  variants: Variant[];
  addOns: AddOn[];
  choiceGroups: ChoiceGroup[];
  badges: { name: string }[];
  allergens: { name: string }[];
};
type Menu = {
  settings: {
    name: string;
    nameEn: string;
    description: string;
    currency: string;
    status: string;
    closedMessage: string;
    primaryColor: string;
  };
  categories: { id: string; name: string; items: Item[] }[];
};
export function MenuClient({ initial }: { initial: Menu | null }) {
  const { data, error, refetch, isFetching } = useQuery({
    queryKey: ["menu"],
    queryFn: () => api<Menu>("/menu"),
    initialData: initial || undefined,
  });
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);
  const categories = useMemo(
    () =>
      data?.categories
        .map((c) => ({
          ...c,
          items: c.items.filter((i) =>
            (
              i.name +
              " " +
              i.fullIngredients.join(" ") +
              " " +
              c.name +
              " " +
              (i.proteinType || "") +
              " " +
              i.badges.map((b) => b.name).join(" ")
            )
              .toLocaleLowerCase("ar")
              .includes(q.toLocaleLowerCase("ar")),
          ),
        }))
        .filter((c) => c.items.length) || [],
    [data, q],
  );
  if (!data)
    return (
      <State
        text={isFetching ? "بنجهّز سفرة البيت…" : "ما قدرنا نوصل للقائمة"}
        action={error ? () => refetch() : undefined}
      />
    );
  return (
    <>
      <DoorEntrance />
      <main
        style={{ "--brand": data.settings.primaryColor } as React.CSSProperties}
      >
        <header className="relative overflow-hidden border-b border-beige bg-paper">
          <div className="absolute inset-y-0 left-0 hidden w-1/3 rounded-r-[9rem] bg-beige/40 md:block" />
          <div className="relative mx-auto max-w-6xl px-5 py-14 md:py-20">
            <div className="mb-5 h-1 w-24 rounded bg-terra" />
            <p
              className="mb-2 text-sm font-bold tracking-[.25em] text-brown"
              dir="ltr"
            >
              {data.settings.nameEn}
            </p>
            <h1 className="text-5xl font-extrabold md:text-7xl">
              {data.settings.name}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-brown">
              {data.settings.description}
            </p>
            {data.settings.status !== "OPEN" && (
              <p
                role="status"
                className="mt-6 rounded-xl border border-terra/30 bg-terra/10 p-4 font-bold text-terra"
              >
                {data.settings.closedMessage}
              </p>
            )}
          </div>
        </header>
        <nav
          aria-label="تصنيفات القائمة"
          className="sticky top-0 z-20 overflow-x-auto border-b border-beige bg-cream/95 px-4 py-3 backdrop-blur"
        >
          <div className="mx-auto flex max-w-6xl gap-2">
            {data.categories.map((c) => (
              <a
                className="focus-ring shrink-0 rounded-full border border-beige bg-paper px-4 py-2 font-bold hover:border-olive"
                href={`#category-${c.id}`}
                key={c.id}
              >
                {c.name}
              </a>
            ))}
          </div>
        </nav>
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="mb-10 flex gap-3">
            <label className="relative grow">
              <span className="sr-only">
                ابحث بالاسم أو المكونات أو نوع البروتين
              </span>
              <Search
                className="absolute right-4 top-3.5 text-brown"
                size={20}
              />
              <input
                className="input pr-12"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن طبق أو مكوّن…"
              />
            </label>
            <button
              aria-label="مشاركة القائمة"
              className="btn border border-beige bg-paper"
              onClick={() =>
                navigator.share?.({
                  title: data.settings.name,
                  url: location.href,
                })
              }
            >
              <Share2 />
            </button>
          </div>
          {categories.length ? (
            categories.map((c) => (
              <section
                id={`category-${c.id}`}
                className="mb-16 scroll-mt-28"
                key={c.id}
              >
                <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
                  <h2 className="flex items-center gap-3 text-3xl font-extrabold">
                    <span className="h-8 w-2 rounded bg-terra" />
                    {c.name}
                  </h2>
                  {c.name.includes("البرجرات") && (
                    <p className="rounded-full bg-olive/10 px-4 py-2 text-sm font-bold text-olive">
                      الأسعار شاملة البطاطا
                    </p>
                  )}
                </div>
                <CategoryItems
                  items={c.items}
                  currency={data.settings.currency}
                  open={setSelected}
                />
              </section>
            ))
          ) : (
            <State text="ما لقينا أطباق بهالبحث. جرّب كلمة ثانية." />
          )}
        </div>
        <button
          onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="العودة إلى الأعلى"
          className="btn fixed bottom-5 left-5 bg-charcoal text-white"
        >
          <ArrowUp />
        </button>
        {selected && (
          <ItemModal
            item={selected}
            currency={data.settings.currency}
            close={() => setSelected(null)}
          />
        )}
      </main>
    </>
  );
}
function CategoryItems({
  items,
  currency,
  open,
}: {
  items: Item[];
  currency: string;
  open: (item: Item) => void;
}) {
  const groups = [
    ...new Map(
      items.map((i) => [i.subcategory?.id || "", i.subcategory]),
    ).entries(),
  ].sort((a, b) => (a[1]?.sortOrder || 0) - (b[1]?.sortOrder || 0));
  return (
    <>
      {groups.map(([id, sub]) => (
        <div className="mb-8" key={id || "main"}>
          {sub && (
            <h3 className="mb-4 text-xl font-extrabold text-brown">
              {sub.name}
            </h3>
          )}
          <div className="grid gap-5 md:grid-cols-2">
            {items
              .filter((i) => (i.subcategory?.id || "") === id)
              .map((i) => (
                <ItemCard
                  key={i.id}
                  item={i}
                  currency={currency}
                  open={() => open(i)}
                />
              ))}
          </div>
        </div>
      ))}
    </>
  );
}
function ItemCard({
  item,
  currency,
  open,
}: {
  item: Item;
  currency: string;
  open: () => void;
}) {
  const price = item.variants[0]?.price || item.price;
  return (
    <article
      className={`card flex min-h-44 overflow-hidden ${item.featured ? "ring-2 ring-terra" : ""}`}
    >
      <button
        onClick={open}
        className="focus-ring flex w-full text-right"
        aria-label={`تفاصيل ${item.name}`}
      >
        {item.imageUrl ? (
          <img
            loading="lazy"
            src={item.imageUrl}
            alt={item.imageAlt || item.name}
            className="w-32 object-cover sm:w-44"
          />
        ) : (
          <div className="flex w-28 shrink-0 items-center justify-center bg-beige/50 text-brown sm:w-40">
            <UtensilsCrossed size={36} />
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          {item.featured && (
            <span className="mb-2 w-fit rounded-full bg-terra/10 px-3 py-1 text-xs font-bold text-terra">
            الطبق المميز
            </span>
          )}
          <h3 className="text-xl font-bold">{item.name}</h3>
          {item.proteinWeight && (
            <p className="mt-2 w-fit rounded-lg bg-beige/50 px-2 py-1 text-xs font-bold">
              {item.proteinWeight} {item.proteinType}
            </p>
          )}
          <p className="mt-auto pt-3 text-lg font-extrabold">
            {item.variants.length ? "ابتداءً من " : ""}
            {price} {currency}
          </p>
          <span className="mt-1 text-sm font-bold text-olive">
            عرض التفاصيل
          </span>
        </div>
      </button>
    </article>
  );
}
function ItemModal({
  item,
  currency,
  close,
}: {
  item: Item;
  currency: string;
  close: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState(item.variants[0]);
  const [extras, setExtras] = useState<string[]>([]);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const base = Number(variant?.price || item.price || 0),
    extraTotal = item.addOns
      .filter((a) => extras.includes(a.id))
      .reduce((n, a) => n + Number(a.price), 0);
  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="fixed inset-0 z-50 grid place-items-end bg-charcoal/55 p-0 md:place-items-center md:p-5"
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-paper shadow-2xl md:rounded-[2rem]"
      >
        <div className="sticky top-0 z-10 flex justify-end bg-paper/90 p-3 backdrop-blur">
          <button onClick={close} className="btn p-3" aria-label="إغلاق">
            <X />
          </button>
        </div>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.imageAlt || item.name}
            className="h-64 w-full object-cover"
          />
        )}
        <div className="space-y-6 p-6 md:p-8">
          {item.featured && (
            <span className="rounded-full bg-terra/10 px-3 py-2 text-sm font-bold text-terra">
              الطبق المميز
            </span>
          )}
          <h2 id="item-title" className="text-3xl font-extrabold">
            {item.name}
          </h2>
          {item.description && (
            <p className="leading-7 text-brown">{item.description}</p>
          )}
          {item.proteinWeight && (
            <p className="w-fit rounded-xl bg-beige/60 px-4 py-2 font-bold">
              {item.proteinWeight} {item.proteinType}
            </p>
          )}
          {item.quantityLabel && (
            <p
              className="w-fit rounded-xl bg-beige/60 px-4 py-2 font-bold"
              dir="auto"
            >
              {item.quantityLabel}
            </p>
          )}
          {item.variants.length > 0 && (
            <fieldset>
              <legend className="mb-3 text-lg font-bold">اختر الحجم</legend>
              <div className="grid grid-cols-2 gap-3">
                {item.variants.map((v) => (
                  <label
                    className={`focus-within:ring-2 focus-within:ring-olive flex cursor-pointer justify-between rounded-xl border p-4 ${variant?.id === v.id ? "border-olive bg-olive/5" : "border-beige"}`}
                    key={v.id}
                  >
                    <span>
                      <input
                        required
                        className="ml-2"
                        type="radio"
                        name="variant"
                        checked={variant?.id === v.id}
                        onChange={() => setVariant(v)}
                      />
                      {v.name}
                    </span>
                    <b>
                      {v.price} {currency}
                    </b>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {item.fullIngredients.length > 0 && (
            <details className="rounded-xl border border-beige p-4" open>
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between font-bold">
                المكونات <ChevronDown />
              </summary>
              <ul className="mt-4 flex flex-wrap gap-2">
                {item.fullIngredients.map((x) => (
                  <li
                    className="rounded-full bg-beige/50 px-3 py-2 text-sm"
                    key={x}
                  >
                    {x}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {item.choiceGroups.map((group) => (
            <fieldset key={group.id}>
              <legend className="mb-3 text-lg font-bold">
                {group.name}
                {group.required && (
                  <span className="mr-2 text-sm text-terra">مطلوب</span>
                )}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.options.map((option) => (
                  <label
                    className={`cursor-pointer rounded-xl border p-4 ${choices[group.id] === option.id ? "border-olive bg-olive/5" : "border-beige"}`}
                    key={option.id}
                  >
                    <input
                      required={group.required}
                      className="ml-2"
                      type="radio"
                      name={`choice-${group.id}`}
                      checked={choices[group.id] === option.id}
                      onChange={() =>
                        setChoices((s) => ({ ...s, [group.id]: option.id }))
                      }
                    />
                    {option.name}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {item.addOns.length > 0 && (
            <fieldset>
              <legend className="mb-3 text-lg font-bold">
                إضافات اختيارية
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {item.addOns.map((a) => (
                  <label
                    className="flex cursor-pointer justify-between rounded-xl border border-beige p-3"
                    key={a.id}
                  >
                    <span>
                      <input
                        className="ml-2"
                        type="checkbox"
                        checked={extras.includes(a.id)}
                        onChange={() =>
                          setExtras((s) =>
                            s.includes(a.id)
                              ? s.filter((id) => id !== a.id)
                              : [...s, a.id],
                          )
                        }
                      />
                      {a.name}
                    </span>
                    <b>
                      +{a.price} {currency}
                    </b>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {item.includesRegularFries && (
            <p className="rounded-xl bg-olive/10 p-4 text-center font-bold text-olive">
              الأسعار شاملة البطاطا
            </p>
          )}
          <div className="sticky bottom-0 flex items-center justify-between rounded-xl bg-charcoal p-5 text-paper">
            <span>السعر</span>
            <strong className="text-2xl">
              {base + extraTotal} {currency}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
function State({ text, action }: { text: string; action?: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-content-center gap-4 p-8 text-center">
      <UtensilsCrossed className="mx-auto text-olive" size={42} />
      <p className="text-xl font-bold">{text}</p>
      {action && (
        <button className="btn btn-primary" onClick={action}>
          حاول مرة ثانية
        </button>
      )}
    </div>
  );
}

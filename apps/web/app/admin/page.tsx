"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LogOut, Pencil, Plus, Send, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type Category = { id: string; name: string; active: boolean; deletedAt: string | null; _count: { items: number } };
type Item = { id: string; name: string; price: string | null; active: boolean; featured: boolean; deletedAt: string | null; category: { name: string }; variants: { price: string }[] };

export default function Admin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const me = useQuery({ queryKey: ["me"], queryFn: () => api<{ email: string }>("/auth/me"), retry: false });
  const categories = useQuery({ queryKey: ["cats"], queryFn: () => api<Category[]>("/admin/categories"), enabled: !!me.data });
  const items = useQuery({ queryKey: ["items"], queryFn: () => api<{ items: Item[] }>("/admin/items"), enabled: !!me.data });
  const create = useMutation({
    mutationFn: () => api("/admin/categories", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: () => { setName(""); queryClient.invalidateQueries({ queryKey: ["cats"] }); toast.success("تم إنشاء التصنيف"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const publish = useMutation({
    mutationFn: () => api("/admin/publish", { method: "POST" }),
    onSuccess: () => toast.success("صارت القائمة منشورة للزوار"),
    onError: (error: Error) => toast.error(error.message),
  });
  const archive = useMutation({
    mutationFn: (id: string) => api(`/admin/items/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["items"] }); toast.success("تمت أرشفة الصنف"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const status = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api(`/admin/items/${id}/status`, { method: "PATCH", body: JSON.stringify({ active }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["items"] }); toast.success("تم تحديث التوفر"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const feature = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => api(`/admin/items/${id}/status`, { method: "PATCH", body: JSON.stringify({ featured }) }),
    onSuccess: (_data, variables) => { queryClient.invalidateQueries({ queryKey: ["items"] }); toast.success(variables.featured ? "تم اختيار الصنف المميز اليوم" : "تم إلغاء الصنف المميز"); },
    onError: (error: Error) => toast.error(error.message),
  });

  if (me.isError) { router.replace("/admin/login"); return null; }
  if (me.isLoading) return <p className="p-10">جاري التحميل…</p>;
  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-beige bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 p-5">
          <div><p dir="ltr" className="font-bold text-olive">k2nobeit</p><h1 className="text-2xl font-extrabold">إدارة قائمة البيت</h1></div>
          <div className="flex flex-wrap gap-2">
            <a href="/menu" target="_blank" className="btn border border-beige"><ExternalLink size={18} />معاينة</a>
            <button className="btn btn-primary" onClick={() => publish.mutate()}><Send size={18} />نشر القائمة</button>
            <button aria-label="خروج" className="btn border border-beige" onClick={() => api("/auth/logout", { method: "POST" }).then(() => router.replace("/admin/login"))}><LogOut /></button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 p-5 lg:grid-cols-[1fr_2fr]">
        <section className="card h-fit p-6">
          <h2 className="text-xl font-extrabold">التصنيفات</h2>
          <form className="my-5 flex gap-2" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
            <input required minLength={2} className="input" placeholder="اسم التصنيف" value={name} onChange={(event) => setName(event.target.value)} />
            <button className="btn btn-primary" aria-label="إضافة"><Plus /></button>
          </form>
          {categories.isLoading ? <p>جاري التحميل…</p> : categories.data?.map((category) => (
            <div className="flex items-center justify-between border-t border-beige py-3" key={category.id}>
              <span className="font-bold">{category.name} <small className="text-brown">({category._count.items})</small></span>
              <span className="text-sm text-brown">{category.deletedAt ? "مؤرشف" : category.active ? "فعّال" : "مخفي"}</span>
            </div>
          ))}
        </section>
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-extrabold">الأصناف</h2><span className="text-sm text-brown">اختر صنفًا واحدًا كمميز اليوم، ثم انشر القائمة</span></div>
          {items.isLoading ? <p className="py-8">جاري تحميل الأصناف…</p> : items.data?.items.length ? items.data.items.map((item) => (
            <article className="flex flex-wrap items-center justify-between gap-3 border-b border-beige py-4" key={item.id}>
              <div><h3 className="font-bold">{item.name}</h3><p className="text-sm text-brown">{item.category.name} · {item.price ?? item.variants[0]?.price} ₪</p></div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button onClick={() => status.mutate({ id: item.id, active: !item.active })}><Badge text={item.active ? "متوفر" : "غير متوفر"} /></button>
                <button disabled={!item.active || !!item.deletedAt || feature.isPending} onClick={() => feature.mutate({ id: item.id, featured: !item.featured })} className={`focus-ring inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold disabled:opacity-40 ${item.featured ? "bg-amber-100 text-amber-800" : "bg-beige/50 text-brown"}`}>
                  <Star size={14} fill={item.featured ? "currentColor" : "none"} />{item.featured ? "مميز اليوم" : "اختيار كمميز"}
                </button>
                <a href={`/admin/items/${item.id}`} aria-label="تعديل" className="focus-ring text-olive"><Pencil size={18} /></a>
                <button onClick={() => confirm(`أرشفة ${item.name}؟`) && archive.mutate(item.id)} aria-label="أرشفة" className="focus-ring text-terra"><Trash2 size={18} /></button>
              </div>
            </article>
          )) : <div className="py-14 text-center"><p className="font-bold">ما في أصناف بعد</p></div>}
        </section>
      </div>
    </main>
  );
}

function Badge({ text }: { text: string }) {
  return <span className="rounded-full bg-olive/10 px-3 py-1 text-xs font-bold text-olive">{text}</span>;
}

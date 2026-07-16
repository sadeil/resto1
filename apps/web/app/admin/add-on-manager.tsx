"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type AddOn={id:string;name:string;nameEn:string|null;price:string;category:string;available:boolean;sortOrder:number};
type Draft={id?:string;name:string;nameEn:string;price:string;category:string;available:boolean;sortOrder:number};
const empty:Draft={name:"",nameEn:"",price:"",category:"",available:true,sortOrder:0};

export default function AddOnManager(){
 const qc=useQueryClient(); const [draft,setDraft]=useState<Draft|null>(null);
 const query=useQuery({queryKey:["add-ons"],queryFn:()=>api<AddOn[]>("/admin/add-ons")});
 const save=useMutation({mutationFn:()=>api(`/admin/add-ons${draft?.id?`/${draft.id}`:""}`,{method:draft?.id?"PUT":"POST",body:JSON.stringify({...draft,price:Number(draft?.price),nameEn:draft?.nameEn||null})}),onSuccess:()=>{setDraft(null);qc.invalidateQueries({queryKey:["add-ons"]});toast.success("تم حفظ الإضافة")},onError:(e:Error)=>toast.error(e.message)});
 const remove=useMutation({mutationFn:(id:string)=>api(`/admin/add-ons/${id}`,{method:"DELETE"}),onSuccess:()=>{qc.invalidateQueries({queryKey:["add-ons"]});toast.success("تمت أرشفة الإضافة")},onError:(e:Error)=>toast.error(e.message)});
 const set=(key:keyof Draft,value:Draft[keyof Draft])=>setDraft(d=>d&&({...d,[key]:value}));
 return <section className="card p-6 lg:col-span-2"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">الإضافات</h2><p className="text-sm text-brown">أنشئ الإضافات وعدّل السعر والتوفر، ثم اربطها بالأصناف من صفحة تعديل الصنف.</p></div><button className="btn btn-primary" onClick={()=>setDraft(empty)}><Plus size={18}/>إضافة</button></div>
 {draft&&<form className="my-5 grid gap-3 rounded-xl border border-beige p-4 md:grid-cols-3" onSubmit={e=>{e.preventDefault();save.mutate()}}><input required className="input" placeholder="اسم الإضافة" value={draft.name} onChange={e=>set("name",e.target.value)}/><input className="input" dir="ltr" placeholder="English name (optional)" value={draft.nameEn} onChange={e=>set("nameEn",e.target.value)}/><input required className="input" placeholder="القسم، مثال: الفطور" value={draft.category} onChange={e=>set("category",e.target.value)}/><input required min="0" step="0.01" type="number" className="input" placeholder="السعر" value={draft.price} onChange={e=>set("price",e.target.value)}/><input min="0" type="number" className="input" aria-label="الترتيب" value={draft.sortOrder} onChange={e=>set("sortOrder",Number(e.target.value))}/><label className="flex items-center gap-2"><input type="checkbox" checked={draft.available} onChange={e=>set("available",e.target.checked)}/>متوفرة</label><div className="flex gap-2 md:col-span-3"><button disabled={save.isPending} className="btn btn-primary"><Save size={18}/>حفظ</button><button type="button" className="btn border border-beige" onClick={()=>setDraft(null)}><X size={18}/>إلغاء</button></div></form>}
 <div className="mt-5 grid gap-2 md:grid-cols-2">{query.data?.map(a=><article key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-beige p-3"><div><strong>{a.name}</strong><p className="text-sm text-brown">{a.category} · {a.price} ₪ · {a.available?"متوفرة":"مخفية"}</p></div><div className="flex gap-3"><button aria-label="تعديل الإضافة" onClick={()=>setDraft({...a,nameEn:a.nameEn||"",price:a.price})}><Pencil size={18}/></button><button aria-label="أرشفة الإضافة" className="text-terra" onClick={()=>confirm(`أرشفة ${a.name}؟`)&&remove.mutate(a.id)}><Trash2 size={18}/></button></div></article>)}</div></section>;
}

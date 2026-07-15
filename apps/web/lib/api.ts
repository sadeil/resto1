export const API=process.env.NEXT_PUBLIC_API_URL||'http://127.0.0.1:4000/api';

export async function api<T>(path:string,init?:RequestInit):Promise<T>{
  const method=(init?.method||'GET').toUpperCase();
  const sensitive=path.startsWith('/admin')||path.startsWith('/auth')||method!=='GET';
  const r=await fetch(`${API}${path}`,{
    ...init,
    cache:sensitive?'no-store':init?.cache,
    credentials:'include',
    headers:{'Content-Type':'application/json',...init?.headers},
  });
  const body=await r.json();
  if(!r.ok||!body.success)throw new Error(body.message||'تعذّر إتمام العملية');
  return body.data as T;
}

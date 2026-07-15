import type { Response } from 'express';
export const ok=(res:Response,data:unknown,message='Operation completed successfully',status=200)=>res.status(status).json({success:true,data,message});
export const fail=(res:Response,message:string,status=400,errors:unknown[]=[])=>(res.status(status).json({success:false,message,errors}));
const production=process.env.NODE_ENV==='production';
export const cookie={httpOnly:true,sameSite:(production?'none':'lax') as 'none'|'lax',secure:production,path:'/',maxAge:8*60*60*1000};
export const clearCookie={httpOnly:true,sameSite:cookie.sameSite,secure:cookie.secure,path:'/'};

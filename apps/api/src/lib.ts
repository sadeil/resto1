import type { Response } from 'express';
export const ok=(res:Response,data:unknown,message='Operation completed successfully',status=200)=>res.status(status).json({success:true,data,message});
export const fail=(res:Response,message:string,status=400,errors:unknown[]=[])=>(res.status(status).json({success:false,message,errors}));
export const cookie={httpOnly:true,sameSite:'lax' as const,secure:process.env.NODE_ENV==='production',path:'/',maxAge:8*60*60*1000};

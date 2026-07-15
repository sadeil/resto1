import 'dotenv/config'; import { z } from 'zod';
const schema=z.object({DATABASE_URL:z.string().min(1),JWT_SECRET:z.string().min(32),PORT:z.coerce.number().default(4000),NODE_ENV:z.enum(['development','test','production']).default('development'),WEB_ORIGIN:z.string().url().default('http://localhost:3000'),CLOUDINARY_CLOUD_NAME:z.string().optional(),CLOUDINARY_API_KEY:z.string().optional(),CLOUDINARY_API_SECRET:z.string().optional()});
export const env=schema.parse(process.env);

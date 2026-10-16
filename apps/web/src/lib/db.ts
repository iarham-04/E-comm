import { Pool } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_rjb9V7LxqTCt@ep-polished-breeze-atgbwr02.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30';

export const pool = new Pool({ connectionString });

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
  return `cm${timestamp}${randomStr}`.substring(0, 25);
}

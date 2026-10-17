import 'server-only';
import { Pool } from '@neondatabase/serverless';
import * as crypto from 'crypto';

let pool: Pool | null = null;

/** Lazily connects so builds without DATABASE_URL still succeed. Credentials come only from the environment. */
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not configured.');
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

/** Collision-resistant id compatible with the cuid-style ids Prisma generates. */
export function generateId(): string {
  return `c${Date.now().toString(36)}${crypto.randomBytes(9).toString('hex')}`.slice(0, 25);
}

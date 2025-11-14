import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Use the DATABASE_URL from .env file
const connectionString = import.meta.env.VITE_DATABASE_URL || 
  `postgresql://postgres.${import.meta.env.VITE_CEB_SUPABASE_ID}:${import.meta.env.VITE_SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

const sql = postgres(connectionString, { prepare: false });
export const db = drizzle(sql);
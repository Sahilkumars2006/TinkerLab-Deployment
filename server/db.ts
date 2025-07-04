import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using demo database for now.");
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgresql://demo:demo@demo.neon.tech/demo?sslmode=require" 
});
export const db = drizzle({ client: pool, schema });
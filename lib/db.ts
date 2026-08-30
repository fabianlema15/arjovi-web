/**
 * Postgres will plug in here later (Neon on Vercel is the usual pairing).
 *
 * Example:
 *   import { neon } from "@neondatabase/serverless";
 *   export const sql = neon(process.env.DATABASE_URL!);
 *
 * Or Prisma:
 *   export const db = new PrismaClient();
 *
 * A first table for contact leads might look like:
 *   CREATE TABLE leads (
 *     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     name text NOT NULL,
 *     phone text NOT NULL,
 *     email text NOT NULL,
 *     message text NOT NULL,
 *     created_at timestamptz NOT NULL DEFAULT now()
 *   );
 */
export const db = null;

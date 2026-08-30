import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

type PostgresClient = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as {
  postgres?: PostgresClient;
};

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return postgres(url, { prepare: false, max: 1 });
}

export function getDb() {
  const client = globalForDb.postgres ?? createClient();
  if (process.env.NODE_ENV !== "production") {
    globalForDb.postgres = client;
  }
  return drizzle(client, { schema });
}

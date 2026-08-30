import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const url =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  entities: {
    roles: { provider: "neon" },
  },
});

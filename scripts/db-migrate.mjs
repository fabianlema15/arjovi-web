import { spawnSync } from "node:child_process";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.log("Skipping database migrate (no DATABASE_URL).");
  process.exit(0);
}

try {
  console.log(`Migrating database at ${new URL(url).host}`);
} catch {
  console.log("Migrating database.");
}

const result = spawnSync("npx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);

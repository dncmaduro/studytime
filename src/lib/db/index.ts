import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env, isProduction } from "@/lib/env";
import * as schema from "@/db/schema";

declare global {
  var __study_time_sql__: postgres.Sql | undefined;
}

export const sqlClient =
  globalThis.__study_time_sql__ ??
  postgres(env.DATABASE_URL, {
    max: 10,
    prepare: false,
  });

if (!isProduction) {
  globalThis.__study_time_sql__ = sqlClient;
}

export const db = drizzle(sqlClient, { schema });

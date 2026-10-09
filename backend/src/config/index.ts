/**
 * Runtime configuration. Values come from the environment (see `.env.example`).
 * A real service would validate these at boot and fail fast on anything missing.
 */
export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
} as const

export type Config = typeof config

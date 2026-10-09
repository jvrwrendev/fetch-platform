import { config } from "./config"
import { database } from "./database"
import { routes } from "./routes"

/**
 * Skeleton entry point. It intentionally does **not** start an HTTP listener:
 * the current build is mock-only. A real service would create the app here,
 * attach `middleware` + `routes`, and call `listen(config.port)`.
 */
export async function createServer() {
  await database.connect()
  return { config, routes }
}

if (require.main === module) {
  createServer().then(({ config: cfg, routes: table }) => {
    // eslint-disable-next-line no-console
    console.log(
      `[fetch-backend] skeleton ready — ${table.length} route groups would mount on :${cfg.port}`
    )
  })
}

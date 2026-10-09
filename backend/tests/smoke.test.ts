import { routes } from "../src/routes"

/**
 * Placeholder smoke test. Wire up a runner (vitest/jest) when the service is
 * real. For now this stays framework-agnostic so `tsc --noEmit` is clean
 * without test globals.
 */
export function smokeTest(): void {
  for (const route of routes) {
    if (!route.basePath.startsWith("/")) {
      throw new Error(`Route base path must start with "/": ${route.basePath}`)
    }
  }
}

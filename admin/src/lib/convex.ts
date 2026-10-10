import { ConvexReactClient } from "convex/react"

/**
 * The console's Convex client, talking to the same deployment the apps write
 * to, so what an admin sees is the live platform rather than a mock mirror.
 *
 * `VITE_CONVEX_URL` is public by design; the deploy key that pushes functions
 * lives only in `frontend/.env.local`.
 */
const url = import.meta.env.VITE_CONVEX_URL

if (!url) {
  console.warn("VITE_CONVEX_URL is not set — the console cannot reach the backend.")
}

export const convex = new ConvexReactClient(url ?? "http://127.0.0.1:3210")

import { ConvexReactClient } from "convex/react"

/**
 * The Convex client for the fleet-husky-171 deployment.
 *
 * The URL is public by design (`EXPO_PUBLIC_`), and the deploy key that writes
 * to the deployment lives only in `.env.local`. If the URL is missing we still
 * construct a client so imports do not explode; the first request surfaces the
 * real error.
 */
const url = process.env.EXPO_PUBLIC_CONVEX_URL

if (!url) {
  console.warn(
    "EXPO_PUBLIC_CONVEX_URL is not set — the app cannot reach the backend. See frontend/.env.local."
  )
}

export const convex = new ConvexReactClient(
  url ?? "http://127.0.0.1:3210"
)

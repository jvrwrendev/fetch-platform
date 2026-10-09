export type Role = "passenger" | "rider" | "admin"

export interface RequestContext {
  userId?: string
  role?: Role
}

/**
 * Placeholder auth middleware. A real service would verify a bearer token and
 * populate `RequestContext`.
 */
export function authenticate(
  headers: Record<string, string | undefined>
): RequestContext {
  void headers
  return {}
}

/** Placeholder error normaliser shared by every route. */
export function handleError(error: unknown): { status: number; message: string } {
  return {
    status: 500,
    message: error instanceof Error ? error.message : "Unknown error",
  }
}

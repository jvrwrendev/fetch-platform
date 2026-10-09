import { useEffect, useState } from "react"

/**
 * Minimal async loader for the mock service layer. `deps` controls re-fetching;
 * pass the same values you'd give a `useEffect`.
 */
export function useAsync<T>(
  load: () => Promise<T>,
  deps: unknown[] = []
): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let stale = false
    setLoading(true)
    load()
      .then((value) => {
        if (!stale) {
          setData(value)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!stale) setLoading(false)
      })
    return () => {
      stale = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading }
}

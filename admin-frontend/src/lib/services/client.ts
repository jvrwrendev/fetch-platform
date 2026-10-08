export const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

export const MOCK_LATENCY_MS = 250

export function delay<T>(value: T, ms: number = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))
}

export function failure(message: string): Promise<never> {
  return Promise.reject(new Error(message))
}

import AsyncStorage from "@react-native-async-storage/async-storage"
import { colorScheme, useColorScheme } from "nativewind"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type ThemePreference = "system" | "light" | "dark"

interface ThemeContextValue {
  /** What the user picked; "system" follows the device. */
  preference: ThemePreference
  /** The resolved scheme actually in effect. */
  scheme: "light" | "dark"
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = "fetch_theme"

function isPreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark"
}

/**
 * Owns the light/dark choice. NativeWind's `colorScheme` drives both the
 * `dark:` variants and the CSS variables in `global.css`, so everything flips
 * from one call — including the system-following default.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme: scheme } = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>("system")

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (isPreference(raw)) {
          setPreferenceState(raw)
          colorScheme.set(raw)
        }
      })
      .catch(() => undefined)
  }, [])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    colorScheme.set(next)
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      scheme: scheme === "dark" ? "dark" : "light",
      setPreference,
    }),
    [preference, scheme, setPreference]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

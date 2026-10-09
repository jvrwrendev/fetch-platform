/**
 * The monorepo's shared core, re-exported for React Native.
 *
 * Metro is configured (see `metro.config.js`) to watch `../shared`, so the
 * phone bundles the exact same domain types, fare engine, geo helpers and mock
 * world the web apps do — one fare, three platforms.
 */
export * from "../../shared/src/index"

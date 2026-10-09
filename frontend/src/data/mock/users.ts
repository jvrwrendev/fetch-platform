// Frontend-facing facade over the shared mock world. Keep `shared/` as the
// single source of truth; these modules only re-export it for local imports.
export { USERS, VEHICLE_LABELS } from "@/shared"

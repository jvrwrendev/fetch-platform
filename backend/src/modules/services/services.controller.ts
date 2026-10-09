import { servicesService } from "./services.service"

/** HTTP-facing handlers for the services module. */
export const servicesController = {
  list: () => servicesService.list(),
}
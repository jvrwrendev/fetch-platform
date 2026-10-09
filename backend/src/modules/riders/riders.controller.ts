import { ridersService } from "./riders.service"

/** HTTP-facing handlers for the riders module. */
export const ridersController = {
  list: () => ridersService.list(),
}
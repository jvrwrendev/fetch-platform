import { adminsService } from "./admins.service"

/** HTTP-facing handlers for the admins module. */
export const adminsController = {
  list: () => adminsService.list(),
}
import { usersService } from "./users.service"

/** HTTP-facing handlers for the users module. */
export const usersController = {
  list: () => usersService.list(),
}
/**
 * User module types. The real service imports the shared domain model
 * (@fetch/shared) so the API and the clients can never drift apart.
 */
export interface UserDTO {
  id: string
}
/**
 * Database access layer. No client is wired up in the skeleton — a real service
 * would initialise the connection here and export typed repositories that the
 * modules in `src/modules` depend on.
 */
export interface Database {
  connect(): Promise<void>
  disconnect(): Promise<void>
}

export const database: Database = {
  async connect() {
    // no-op in the mock build
  },
  async disconnect() {
    // no-op in the mock build
  },
}

/** Shared budgets. Test authors select an operation from TIMEOUTS instead of a duration. */
export const TIMEOUT_TYPES = {
  standard: { timeout: 30_000 },
  extended: { timeout: 90_000 },
  long: { timeout: 120_000 },
} as const satisfies Record<string, Cypress.Timeoutable>

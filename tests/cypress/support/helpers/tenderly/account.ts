export type TenderlyAccount = {
  accountSlug: string
  projectSlug: string
  accessKey: string
}

const accountSlug = Cypress.env('TENDERLY_ACCOUNT_SLUG')
const projectSlug = Cypress.env('TENDERLY_PROJECT_SLUG')
const accessKey = Cypress.env('TENDERLY_ACCESS_KEY')

if (typeof accountSlug !== 'string' || typeof projectSlug !== 'string' || typeof accessKey !== 'string') {
  throw new Error('Tenderly account environment variables are not set')
}

/**
 * Tenderly account configuration, read from Cypress environment variables.
 * If you want to run tests locally, create a `cypress.env.json` file in the `tests` directory
 */
export const tenderlyAccount = { accountSlug, projectSlug, accessKey }

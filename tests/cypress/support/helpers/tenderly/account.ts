import { assert } from '@primitives/objects.utils'

export type TenderlyAccount = {
  accountSlug: string
  projectSlug: string
  accessKey: string
}

export type TenderlyConfig = TenderlyAccount & { vnetId: string }

let tenderlyAccount: TenderlyAccount | undefined

/**
 * Tenderly account configuration, read from Cypress environment variables.
 * If you want to run tests locally, create a `cypress.env.json` file in the `tests` directory
 */
export const loadTenderlyAccount = () =>
  cy
    .env(['TENDERLY_ACCOUNT_SLUG', 'TENDERLY_PROJECT_SLUG', 'TENDERLY_ACCESS_KEY'])
    .then(
      ({ TENDERLY_ACCESS_KEY: accountSlug, TENDERLY_ACCOUNT_SLUG: projectSlug, TENDERLY_PROJECT_SLUG: accessKey }) => {
        assert(
          [accountSlug, projectSlug, accessKey].every(Boolean),
          'Tenderly account environment variables are not set',
        )
        return (tenderlyAccount = { accountSlug, projectSlug, accessKey })
      },
    )

export const getTenderlyAccount = () =>
  assert(tenderlyAccount, 'Tenderly account environment variables have not been loaded yet')

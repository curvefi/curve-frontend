export type TenderlyAccount = {
  accountSlug: string
  projectSlug: string
  accessKey: string
}

const accountSlug = Cypress.env('TENDERLY_ACCOUNT_SLUG')
const projectSlug = Cypress.env('TENDERLY_PROJECT_SLUG')
const accessKey = Cypress.env('TENDERLY_ACCESS_KEY')

export const tenderlyAccount =
  accountSlug && projectSlug && accessKey ? { accountSlug, projectSlug, accessKey } : undefined

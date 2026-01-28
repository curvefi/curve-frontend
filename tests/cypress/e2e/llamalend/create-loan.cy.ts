import '@cy/support/helpers/eip6963-test-setup'
import { recordValues } from '@curvefi/prices-api/objects.util'
import {
  checkLoanDetailsLoaded,
  checkLoanRangeSlider,
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/create-loan.helpers'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { LlamaMarketType } from '@ui-kit/types/market'

// todo: remove this once we know the test is stable
const RETRY = { retries: { openMode: 0, runMode: 2 } }

describe('Create loan', () => {
  recordValues(LlamaMarketType).forEach((marketType) => {
    const { collateral, borrow, path } = oneLoanTestMarket(marketType)
    const leverageEnabled = false // "max_borrowable" query always fails because of the 'fake' e2e account :(

    it(`for ${marketType} market`, RETRY, () => {
      cy.visit(path)
      writeCreateLoanForm({ collateral, borrow, leverageEnabled })
      checkLoanDetailsLoaded({ leverageEnabled, hasLeverage })
      checkLoanRangeSlider({ leverageEnabled, hasLeverage })
      // e2e tests run with a 'fake' account so the transaction fails
      submitCreateLoanForm().then(() =>
        cy.get('[data-testid="loan-form-error"]', LOAD_TIMEOUT).contains('unknown account'),
      )
    })
  })
})

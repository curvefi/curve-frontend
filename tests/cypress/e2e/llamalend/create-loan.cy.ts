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

describe('Create loan', () => {
  recordValues(LlamaMarketType).forEach((marketType) => {
    const { collateral, borrow, path } = oneLoanTestMarket(marketType)
    const leverageEnabled = false // "max_borrowable" query always fails because of the 'fake' e2e account :(

    it(`for ${marketType} market`, () => {
      cy.visit(path)
      writeCreateLoanForm({ collateral, borrow, leverageEnabled })
      checkLoanDetailsLoaded({ leverageEnabled })
      checkLoanRangeSlider({ leverageEnabled })
      // e2e tests run with a 'fake' account so the transaction fails
      submitCreateLoanForm('error', 'Transaction failed').then(() =>
        cy.get('[data-testid="loan-form-error"]', LOAD_TIMEOUT).contains('unknown account'),
      )
    })
  })
})

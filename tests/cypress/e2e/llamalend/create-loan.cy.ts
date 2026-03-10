import {
  checkLoanDetailsLoaded,
  checkLoanRangeSlider,
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { recordValues } from '@primitives/objects.utils'
import { LlamaMarketType } from '@ui-kit/types/market'

describe('Create loan', () => {
  recordValues(LlamaMarketType).forEach((marketType) => {
    const { collateral, borrow, path, label, hasLeverage } = oneLoanTestMarket(marketType)
    const leverageEnabled = hasLeverage && false // "max_borrowable" query always fails because of the 'fake' e2e account :(

    it(label, () => {
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

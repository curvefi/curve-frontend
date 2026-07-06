import {
  checkLoanDetailsLoaded,
  checkLoanRangeSlider,
  oneLoanTestMarket,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { recordValues } from '@primitives/objects.utils'
import { LlamaMarketType } from '@ui-kit/types/market'

// Wallets update the Max Priority Fee and Max Fee cap based on current network conditions.
// However, our test doesn't do that so we get the 'fee cap' error when the base fee exceeds the Max Fee cap.
// With other network conditions when the fee is fine, we get 'insufficient funds' since account is generated and has no funds.
const expectedErrorRegex = /(insufficient funds)|(fee cap)/i

describe('Create loan', () => {
  const testCases = recordValues(LlamaMarketType).map(marketType => oneLoanTestMarket(marketType))

  testCases.forEach(({ collateral, borrow, path, label, hasLeverage }) => {
    const leverageEnabled = hasLeverage && false // "max_borrowable" query always fails because of the 'fake' e2e account :(
    const expectError = 'maximum collateral amount'

    it(label, () => {
      cy.visit(path)
      writeCreateLoanForm({ collateral, borrow, leverageEnabled, hasLeverage })
      checkLoanDetailsLoaded({ leverageEnabled, expectError })
      checkLoanRangeSlider()
      checkLoanDetailsLoaded({ leverageEnabled, expectError })
      // e2e tests run with a 'fake' account so the transaction fails
      cy.get(`[data-testid="create-loan-submit-button"]`).should('be.disabled')
    })
  })
})

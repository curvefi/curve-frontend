import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import {
  checkLoanDetailsLoaded,
  checkLoanRangeSlider,
  oneLoanTestMarket,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { recordValues } from '@primitives/objects.utils'
import { MarketType } from '@ui-kit/types/market'

const testCases = recordValues(MarketType).map(marketType => oneLoanTestMarket(marketType))

describe('Create loan', () => {
  beforeEach(() => mockMerklCampaigns())

  testCases.forEach(({ collateral, borrow, path, label, hasLeverage, chainId }) => {
    const leverageEnabled = hasLeverage && false // "max_borrowable" query always fails because of the 'fake' e2e account :(
    const expectError = 'maximum collateral amount'

    it(label, () => {
      cy.visit(path, {
        onBeforeLoad: win => (win.CypressTestConnectorChain = chainId),
      })
      writeCreateLoanForm({ collateral, borrow, leverageEnabled, hasLeverage })
      checkLoanDetailsLoaded({ leverageEnabled, expectError })
      checkLoanRangeSlider()
      checkLoanDetailsLoaded({ leverageEnabled, expectError })
      // e2e tests run with a 'fake' account so the transaction fails
      cy.get(`[data-testid="create-loan-submit-button"]`).should('be.disabled')
    })
  })
})

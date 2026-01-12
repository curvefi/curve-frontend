import { oneBool } from '@cy/support/generators'
import {
  checkLoanDetailsLoaded,
  checkLoanRangeSlider,
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/create-loan.helpers'
import { LlamaMarketType } from '@ui-kit/types/market'

describe(`Create Mint market loan`, () => {
  const { collateral, borrow, path } = oneLoanTestMarket(LlamaMarketType.Mint)
  const leverageEnabled = oneBool()

  beforeEach(() => {
    cy.visit(path)
  })

  it(`may be created`, () => {
    writeCreateLoanForm({ collateral, borrow, leverageEnabled })
    checkLoanDetailsLoaded({ leverageEnabled })
    checkLoanRangeSlider(leverageEnabled)
    // e2e tests run with a 'fake' account so the transaction fails
    submitCreateLoanForm().then(() => expect(cy.get('[data-testid="loan-form-error"]')).includes('unknown account'))
  })
})

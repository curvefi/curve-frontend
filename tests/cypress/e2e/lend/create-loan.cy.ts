import { oneBool } from '@cy/support/generators'
import {
  checkLoanDetailsLoaded,
  checkLoanRangeSlider,
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/create-loan.helpers'
import { LlamaMarketType } from '@ui-kit/types/market'

describe(`Create Lend market loan`, () => {
  const { collateral, borrow, path } = oneLoanTestMarket(LlamaMarketType.Lend)
  const leverageEnabled = oneBool()

  beforeEach(() => {
    cy.visit(path)
  })

  it(`should open the borrow details`, () => {
    writeCreateLoanForm({ collateral, borrow, leverageEnabled })
    checkLoanDetailsLoaded({ leverageEnabled })
    checkLoanRangeSlider(leverageEnabled)
    submitCreateLoanForm().then(() => expect(cy.get('[data-testid="loan-form-error"]')).includes('unknown account'))
  })
})

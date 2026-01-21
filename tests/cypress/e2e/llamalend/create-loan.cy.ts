import { oneBool } from '@cy/support/generators'
import {
  checkLoanDetailsLoaded,
  checkLoanRangeSlider,
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/create-loan.helpers'

describe(`Create Mint market loan`, () => {
  const { collateral, borrow, path } = oneLoanTestMarket()
  const leverageEnabled = oneBool()

  beforeEach(() => {
    cy.visit(path)
  })

  it.skip(`may be created`, () => {
    writeCreateLoanForm({ collateral, borrow, leverageEnabled })
    checkLoanDetailsLoaded({ leverageEnabled })
    checkLoanRangeSlider(leverageEnabled)
    // e2e tests run with a 'fake' account so the transaction fails
    submitCreateLoanForm().then(() => cy.get('[data-testid="loan-form-error"]').contains('unknown account'))
  })
})

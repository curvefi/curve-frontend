import { oneBool } from '@cy/support/generators'
import {
  checkLoanDetailsLoaded,
  checkLoanRangeSlider,
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/create-loan.helpers'
import { LOAD_TIMEOUT } from '@cy/support/ui'

// todo: remove this once we know the test is stable
const RETRY = { retries: { openMode: 0, runMode: 2 } }

describe(`Create loan`, () => {
  const { collateral, borrow, path } = oneLoanTestMarket()
  const leverageEnabled = oneBool()

  beforeEach(() => {
    cy.visit(path)
  })

  it.skip(`may be created`, RETRY, () => {
    writeCreateLoanForm({ collateral, borrow, leverageEnabled })
    checkLoanDetailsLoaded({ leverageEnabled })
    checkLoanRangeSlider(leverageEnabled)
    // e2e tests run with a 'fake' account so the transaction fails
    submitCreateLoanForm().then(() =>
      cy.get('[data-testid="loan-form-error"]', LOAD_TIMEOUT).contains('unknown account'),
    )
  })
})

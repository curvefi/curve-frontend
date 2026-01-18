import { oneLoanTestMarket } from '@cy/support/helpers/create-loan.helpers'
import {
  checkRepayDetailsLoaded,
  selectRepayToken,
  submitRepayForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/repay-loan.helpers'
import { mockLoanExistsAndUserState } from '@cy/support/helpers/repay-mocks'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { LlamaMarketType } from '@ui-kit/types/market'

describe(`Repay Lend market loan`, () => {
  const { path } = oneLoanTestMarket(LlamaMarketType.Lend)

  beforeEach(() => {
    mockLoanExistsAndUserState()
    cy.visit(path)
  })

  it(`may be repaid`, () => {
    cy.get('[data-testid="tab-repay"]', LOAD_TIMEOUT).click()
    selectRepayToken('crvUSD')
    writeRepayLoanForm({ amount: '0.1' })
    checkRepayDetailsLoaded()
    // e2e tests run with a 'fake' account so the transaction fails
    submitRepayForm().then(() => expect(cy.get('[data-testid="loan-form-error"]')).includes('unknown account'))
  })
})

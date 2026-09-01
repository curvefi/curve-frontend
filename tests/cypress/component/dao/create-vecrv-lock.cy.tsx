import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { networks } from '@/dao/networks'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createCreateVeCrvLockScenario } from '@cy/support/helpers/dao/mocks/create-vecrv-lock.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'
import type { CurveApi } from '@evm-ui/features/connect-wallet'

const CHAIN_ID = 1
const TEST_NOW = Date.UTC(2026, 7, 31, 12)
const ONE_YEAR_DAYS = 365
const ONE_WEEK_DAYS = 7
const NON_THURSDAY_DAYS = 9

const CreateVeCrvLockForm = ({ curve }: { curve: CurveApi }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormLockCreate chainId={CHAIN_ID} />
  </CurveComponentTestWrapper>
)

const fillCreateLockForm = (lockedAmount: string, quickActionIndex = 3) => {
  cy.get('input[name="lockedAmount"]').clear().type(lockedAmount)
  cy.get(`[data-testid="btn-create-date-picker-inline-quick-action-${quickActionIndex}"]`).click()
}

const typeCreateUnlockDate = ({ month, day, year }: { month: string; day: string; year: string }) => {
  cy.get('[data-testid="create-date-picker-field"] [role="spinbutton"]').eq(0).type(month)
  cy.get('[data-testid="create-date-picker-field"] [role="spinbutton"]').eq(1).type(day)
  cy.get('[data-testid="create-date-picker-field"] [role="spinbutton"]').eq(2).type(year)
}

describe('FormLockCreate (mocked)', () => {
  beforeEach(() => {
    cy.clock(TEST_NOW, ['Date'])
    setupMockedDaoComponentTest()
  })

  const testCases = [
    { isApproved: false, title: 'estimates, approves, and creates a lock' },
    { isApproved: true, title: 'estimates and creates an approved lock' },
  ]

  testCases.forEach(({ isApproved, title }) => {
    it(title, () => {
      const { assertPreSubmit, assertSubmit, curve, lockedAmount } = createCreateVeCrvLockScenario({ isApproved })
      setGasInfo({ chainId: CHAIN_ID, networks })

      cy.mount(<CreateVeCrvLockForm curve={curve} />)
      fillCreateLockForm(lockedAmount)
      cy.get('[data-testid="create-lock-submit-button"]').should('be.enabled')
      cy.get('[data-testid="create-date-picker-field"]').should('contain.text', '8/26/2027')
      cy.get('[data-testid="helper-message-error"]').should('not.exist')
      cy.wrap(null).should(() => assertPreSubmit(ONE_YEAR_DAYS))

      if (isApproved) {
        cy.get('[data-testid="create-lock-submit-button"]').click()
      } else {
        cy.get('[data-testid="create-lock-submit-button"]').click()
      }
      cy.wrap(null).should(() => assertSubmit(ONE_YEAR_DAYS))
    })
  })

  it('rounds quick action dates in the picker while submitting the selected duration', () => {
    const { assertPreSubmit, curve, lockedAmount } = createCreateVeCrvLockScenario({ isApproved: true })
    setGasInfo({ chainId: CHAIN_ID, networks })

    cy.mount(<CreateVeCrvLockForm curve={curve} />)
    fillCreateLockForm(lockedAmount, 0)

    cy.get('[data-testid="create-date-picker-field"]').should('contain.text', '9/3/2026')
    cy.get('[data-testid="helper-message-error"]').should('not.exist')
    cy.wrap(null).should(() => assertPreSubmit(ONE_WEEK_DAYS))
  })

  it('shows the effective rounded unlock date for a typed non-Thursday date', () => {
    const { assertPreSubmit, curve, lockedAmount } = createCreateVeCrvLockScenario({ isApproved: true })
    setGasInfo({ chainId: CHAIN_ID, networks })

    cy.mount(<CreateVeCrvLockForm curve={curve} />)
    cy.get('input[name="lockedAmount"]').clear().type(lockedAmount)
    typeCreateUnlockDate({ month: '9', day: '9', year: '2026' })

    cy.get('[data-testid="create-date-picker-field"]').should('contain.text', '9/9/2026')
    cy.get('[data-testid="helper-message-error"]').should('contain.text', 'Sep 03, 2026')
    cy.get('[data-testid="create-lock-submit-button"]').should('be.enabled')
    cy.wrap(null).should(() => assertPreSubmit(NON_THURSDAY_DAYS))
  })

  it('shows a max lock amount error when the CRV balance is too low', () => {
    const { curve } = createCreateVeCrvLockScenario({ isApproved: true })

    cy.mount(<CreateVeCrvLockForm curve={curve} />)
    fillCreateLockForm('1001')

    cy.get('[data-testid="helper-message-error"]').should('contain.text', 'The maximum lock amount is 1k')
    cy.get('[data-testid="create-lock-submit-button"]').should('be.disabled')
  })
})

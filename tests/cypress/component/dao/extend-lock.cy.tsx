import { FormLockDate } from '@/dao/components/PageVeCrv/components/FormLockDate'
import { networks } from '@/dao/networks'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createExtendLockScenario } from '@cy/support/helpers/dao/mocks/extend-lock.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'
import type { CurveApi } from '@evm-ui/features/connect-wallet'

const CHAIN_ID = 1
const TEST_NOW = Date.UTC(2026, 7, 31, 12)
const ONE_YEAR_FROM_ROUNDED_LOCK_DAYS = 366
const NON_THURSDAY_EXTEND_DAYS = 365

const ExtendLockForm = ({ curve }: { curve: CurveApi }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormLockDate chainId={CHAIN_ID} />
  </CurveComponentTestWrapper>
)

const typeExtendUnlockDate = ({ month, day, year }: { month: string; day: string; year: string }) => {
  cy.get('[data-testid="adjust-date-date-picker-field"] [role="spinbutton"]').eq(0).type(month)
  cy.get('[data-testid="adjust-date-date-picker-field"] [role="spinbutton"]').eq(1).type(day)
  cy.get('[data-testid="adjust-date-date-picker-field"] [role="spinbutton"]').eq(2).type(year)
}

describe('FormLockDate (mocked)', () => {
  beforeEach(() => {
    cy.clock(TEST_NOW, ['Date'])
    setupMockedDaoComponentTest()
  })

  it('estimates and extends a lock', () => {
    const { assertPreSubmit, assertSubmit, curve } = createExtendLockScenario()
    setGasInfo({ chainId: CHAIN_ID, networks })

    cy.mount(<ExtendLockForm curve={curve} />)
    cy.get('[data-testid="btn-adjust-date-date-picker-inline-quick-action-3"]').click()
    cy.get('[data-testid="extend-lock-submit-button"]').should('be.enabled')
    cy.get('[data-testid="adjust-date-date-picker-field"]').should('contain.text', '8/24/2028')
    cy.get('[data-testid="helper-message-error"]').should('not.exist')
    cy.get('[data-testid="estimated-tx-cost"]').should('contain.text', '$')
    cy.then(() => assertPreSubmit(ONE_YEAR_FROM_ROUNDED_LOCK_DAYS))

    cy.get('[data-testid="extend-lock-submit-button"]').should('be.enabled').click()
    cy.wrap(null).should(() => assertSubmit(ONE_YEAR_FROM_ROUNDED_LOCK_DAYS))
  })

  it('shows the effective rounded unlock date for a typed non-Thursday date', () => {
    const { assertPreSubmit, curve } = createExtendLockScenario()
    setGasInfo({ chainId: CHAIN_ID, networks })

    cy.mount(<ExtendLockForm curve={curve} />)
    typeExtendUnlockDate({ month: '8', day: '25', year: '2028' })

    cy.get('[data-testid="adjust-date-date-picker-field"]').should('contain.text', '8/25/2028')
    cy.get('[data-testid="helper-message-error"]').should('contain.text', 'Aug 24, 2028')
    cy.get('[data-testid="extend-lock-submit-button"]').should('be.enabled')
    cy.get('[data-testid="estimated-tx-cost"]').should('contain.text', '$')
    cy.then(() => assertPreSubmit(NON_THURSDAY_EXTEND_DAYS))
  })
})

import { FormWithdraw } from '@/dao/components/PageVeCrv/components/FormWithdraw'
import { networks } from '@/dao/networks'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createWithdrawLockScenario } from '@cy/support/helpers/dao/mocks/withdraw-lock.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'
import type { CurveApi } from '@evm-ui/features/connect-wallet'
import { dayjs } from '@evm-ui/lib/dayjs'

const CHAIN_ID = 1

const WithdrawLockForm = ({ curve }: { curve: CurveApi }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormWithdraw chainId={CHAIN_ID} />
  </CurveComponentTestWrapper>
)

describe('FormWithdraw (mocked)', () => {
  beforeEach(setupMockedDaoComponentTest)

  it('estimates and withdraws an expired lock', () => {
    const { assertPreSubmit, assertSubmit, curve } = createWithdrawLockScenario()
    setGasInfo({ chainId: CHAIN_ID, networks })

    cy.mount(<WithdrawLockForm curve={curve} />)
    cy.get('[data-testid="withdraw-lock-submit-button"]').should('be.enabled')
    cy.wrap(null).should(assertPreSubmit)
    cy.get('[data-testid="withdraw-lock-submit-button"]').click()
    cy.wrap(null).should(assertSubmit)
  })

  it('shows the unlock countdown and disables withdrawal before expiry', () => {
    const unlockTime = dayjs.utc().add(1, 'year').valueOf()
    const { curve } = createWithdrawLockScenario({ unlockTime })

    cy.mount(<WithdrawLockForm curve={curve} />)
    cy.get('[data-testid="withdraw-lock-countdown"]').should('be.visible')
    cy.get('[data-testid="withdraw-lock-submit-button"]').should('be.disabled')
  })
})

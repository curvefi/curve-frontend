import { FormWithdraw } from '@/dao/components/PageVeCrv/components/FormWithdraw'
import { helpers } from '@/dao/lib/curvejs'
import { networks } from '@/dao/networks'
import type { CurveApi } from '@/dao/types/dao.types'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createWithdrawLockScenario } from '@cy/support/helpers/dao/mocks/withdraw-lock.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'
import { dayjs } from '@evm-ui/lib/dayjs'

const CHAIN_ID = 1

const WithdrawLockForm = ({ curve, unlockTime }: { curve: CurveApi; unlockTime: number }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormWithdraw
      curve={curve}
      rChainId={CHAIN_ID}
      vecrvInfo={{
        crv: '0',
        lockedAmountAndUnlockTime: { lockedAmount: '100', unlockTime },
        veCrv: '0',
        veCrvPct: '0',
      }}
    />
  </CurveComponentTestWrapper>
)

describe('FormWithdraw (mocked)', () => {
  beforeEach(setupMockedDaoComponentTest)

  it('estimates and withdraws an expired lock', () => {
    const { assertPreSubmit, assertSubmit, curve, unlockTime } = createWithdrawLockScenario()
    setGasInfo({ chainId: CHAIN_ID, networks })
    cy.stub(helpers, 'waitForTransaction').resolves({ status: 1 })

    cy.mount(<WithdrawLockForm curve={curve} unlockTime={unlockTime} />)
    cy.get('[data-testid="withdraw-lock-submit-button"]').should('be.enabled')
    cy.wrap(null).should(assertPreSubmit)
    cy.get('[data-testid="withdraw-lock-submit-button"]').click()
    cy.wrap(null).should(assertSubmit)
  })

  it('shows the unlock countdown and disables withdrawal before expiry', () => {
    const { curve } = createWithdrawLockScenario()

    cy.mount(<WithdrawLockForm curve={curve} unlockTime={dayjs.utc().add(1, 'year').valueOf()} />)
    cy.contains('Your CRV unlocks in:').should('be.visible')
    cy.contains('button', 'Withdraw').should('be.disabled')
  })
})

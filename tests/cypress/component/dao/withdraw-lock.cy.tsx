import { FormWithdraw } from '@/dao/components/PageVeCrv/components/FormWithdraw'
import { helpers } from '@/dao/lib/curvejs'
import { networks } from '@/dao/networks'
import type { CurveApi } from '@/dao/types/dao.types'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createWithdrawLockScenario } from '@cy/support/helpers/dao/mocks/withdraw-lock.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'

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
    const { assertSubmit, curve, unlockTime } = createWithdrawLockScenario()
    setGasInfo({ chainId: CHAIN_ID, networks })
    cy.stub(helpers, 'waitForTransaction').resolves({ status: 1 })

    cy.mount(<WithdrawLockForm curve={curve} unlockTime={unlockTime} />)
    cy.contains('button', 'Withdraw').click()
    cy.then(assertSubmit)
  })
})

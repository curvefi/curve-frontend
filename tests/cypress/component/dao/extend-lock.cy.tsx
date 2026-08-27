import { FormLockDate } from '@/dao/components/PageVeCrv/components/FormLockDate'
import { helpers } from '@/dao/lib/curvejs'
import type { CurveApi } from '@/dao/types/dao.types'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createExtendLockScenario } from '@cy/support/helpers/dao/mocks/extend-lock.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'

const CHAIN_ID = 1

const ExtendLockForm = ({ curve, unlockTime }: { curve: CurveApi; unlockTime: number }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormLockDate
      curve={curve}
      rChainId={CHAIN_ID}
      vecrvInfo={{
        crv: '0',
        lockedAmountAndUnlockTime: { lockedAmount: '100', unlockTime },
        veCrv: '100',
        veCrvPct: '0',
      }}
    />
  </CurveComponentTestWrapper>
)

describe('FormLockDate (mocked)', () => {
  beforeEach(setupMockedDaoComponentTest)

  it('estimates and extends a lock', () => {
    const { assertPreSubmit, assertSubmit, curve, unlockTime } = createExtendLockScenario()
    cy.stub(helpers, 'waitForTransaction').resolves({ status: 1 })

    cy.mount(<ExtendLockForm curve={curve} unlockTime={unlockTime} />)
    cy.contains('button', '1 year').click()
    cy.get('[data-testid="increase_time"]').should('be.enabled')
    cy.then(assertPreSubmit)

    cy.get('[data-testid="increase_time"]').click()
    cy.then(assertSubmit)
  })
})

import { FormLockCrv } from '@/dao/components/PageVeCrv/components/FormLockCrv'
import { helpers } from '@/dao/lib/curvejs'
import type { CurveApi } from '@/dao/types/dao.types'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createLockMoreScenario } from '@cy/support/helpers/dao/mocks/lock-more.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'

const CHAIN_ID = 1

const LockMoreForm = ({ curve }: { curve: CurveApi }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormLockCrv
      curve={curve}
      rChainId={CHAIN_ID}
      vecrvInfo={{
        crv: '1000',
        lockedAmountAndUnlockTime: { lockedAmount: '100', unlockTime: 2_000_000_000 },
        veCrv: '100',
        veCrvPct: '0',
      }}
    />
  </CurveComponentTestWrapper>
)

const writeLockMoreForm = (lockedAmount: string) => {
  cy.get('input[name="lockedAmt"]').clear().type(lockedAmount)
}

describe('FormLockCrv (mocked)', () => {
  beforeEach(setupMockedDaoComponentTest)

  const testCases = [
    { isApproved: false, title: 'estimates, approves, and increases a lock' },
    { isApproved: true, title: 'estimates and increases an approved lock' },
  ]

  testCases.forEach(({ isApproved, title }) => {
    it(title, () => {
      const { assertPreSubmit, assertSubmit, curve, lockedAmount } = createLockMoreScenario({ isApproved })
      cy.stub(helpers, 'waitForTransaction').resolves({ status: 1 })
      cy.stub(helpers, 'waitForTransactions').resolves([{ status: 1 }])

      cy.mount(<LockMoreForm curve={curve} />)
      writeLockMoreForm(lockedAmount)
      cy.get(isApproved ? '[data-testid="increase_crv"]' : '[data-testid="approval"]').should('be.enabled')
      cy.then(assertPreSubmit)

      if (!isApproved) cy.get('[data-testid="approval"]').click()

      cy.get('[data-testid="increase_crv"]').click()
      cy.then(assertSubmit)
    })
  })
})

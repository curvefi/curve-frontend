import { FormLockCrv } from '@/dao/components/PageVeCrv/components/FormLockCrv'
import { networks } from '@/dao/networks'
import type { CurveApi } from '@/dao/types/dao.types'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createLockMoreScenario } from '@cy/support/helpers/dao/mocks/lock-more.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'

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
      setGasInfo({ chainId: CHAIN_ID, networks })

      cy.mount(<LockMoreForm curve={curve} />)
      writeLockMoreForm(lockedAmount)
      cy.get('[data-testid="increase-lock-submit-button"]').should('be.enabled')
      cy.wrap(null).should(assertPreSubmit)

      if (isApproved) {
        cy.get('[data-testid="increase-lock-submit-button"]').should('contain.text', 'Increase Lock Amount').click()
      } else {
        cy.get('[data-testid="increase-lock-submit-button"]').should('contain.text', 'Approve').click()
      }
      cy.wrap(null).should(assertSubmit)
    })
  })
})

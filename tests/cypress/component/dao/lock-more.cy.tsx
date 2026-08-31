import { FormLockCrv } from '@/dao/components/PageVeCrv/components/FormLockCrv'
import { networks } from '@/dao/networks'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createLockMoreScenario } from '@cy/support/helpers/dao/mocks/lock-more.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'
import type { CurveApi } from '@evm-ui/features/connect-wallet'

const CHAIN_ID = 1

const LockMoreForm = ({ curve }: { curve: CurveApi }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormLockCrv chainId={CHAIN_ID} />
  </CurveComponentTestWrapper>
)

const writeLockMoreForm = (lockedAmount: string) => {
  cy.get('input[name="lockedAmount"]').clear().type(lockedAmount)
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
        cy.get('[data-testid="increase-lock-submit-button"]').click()
      } else {
        cy.get('[data-testid="increase-lock-submit-button"]').click()
      }
      cy.wrap(null).should(assertSubmit)
    })
  })
})

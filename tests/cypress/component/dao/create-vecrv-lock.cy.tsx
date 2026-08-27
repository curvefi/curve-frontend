import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { networks } from '@/dao/networks'
import type { CurveApi } from '@/dao/types/dao.types'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createCreateVeCrvLockScenario } from '@cy/support/helpers/dao/mocks/create-vecrv-lock.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'

const CHAIN_ID = 1

const CreateVeCrvLockForm = ({ curve, crv = '1000' }: { curve: CurveApi; crv?: string }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormLockCreate
      curve={curve}
      rChainId={CHAIN_ID}
      vecrvInfo={{
        crv,
        lockedAmountAndUnlockTime: { lockedAmount: '0', unlockTime: 0 },
        veCrv: '0',
        veCrvPct: '0',
      }}
    />
  </CurveComponentTestWrapper>
)

const fillCreateLockForm = (lockedAmount: string) => {
  cy.get('input[name="lockedAmt"]').clear().type(lockedAmount)
  cy.contains('button', '1 year').click()
}

describe('FormLockCreate (mocked)', () => {
  beforeEach(setupMockedDaoComponentTest)

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
      cy.then(assertPreSubmit)

      if (!isApproved) {
        cy.get('[data-testid="create-lock-submit-button"]').should('contain.text', 'Approve').click()
      }

      cy.get('[data-testid="create-lock-submit-button"]').should('contain.text', 'Create Lock').click()
      cy.then(assertSubmit)
    })
  })
})

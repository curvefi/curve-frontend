import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { networks } from '@/dao/networks'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createCreateVeCrvLockScenario } from '@cy/support/helpers/dao/mocks/create-vecrv-lock.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'
import type { CurveApi } from '@evm-ui/features/connect-wallet'

const CHAIN_ID = 1

const CreateVeCrvLockForm = ({ curve }: { curve: CurveApi }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormLockCreate chainId={CHAIN_ID} />
  </CurveComponentTestWrapper>
)

const fillCreateLockForm = (lockedAmount: string) => {
  cy.get('input[name="lockedAmount"]').clear().type(lockedAmount)
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
      cy.wrap(null).should(assertPreSubmit)

      if (isApproved) {
        cy.get('[data-testid="create-lock-submit-button"]').should('contain.text', 'Create Lock').click()
      } else {
        cy.get('[data-testid="create-lock-submit-button"]').should('contain.text', 'Approve').click()
      }
      cy.wrap(null).should(assertSubmit)
    })
  })
})

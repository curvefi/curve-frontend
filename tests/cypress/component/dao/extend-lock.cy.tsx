import { FormLockDate } from '@/dao/components/PageVeCrv/components/FormLockDate'
import { networks } from '@/dao/networks'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createExtendLockScenario } from '@cy/support/helpers/dao/mocks/extend-lock.mocks'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'
import type { CurveApi } from '@evm-ui/features/connect-wallet'

const CHAIN_ID = 1

const ExtendLockForm = ({ curve }: { curve: CurveApi }) => (
  <CurveComponentTestWrapper curve={curve}>
    <FormLockDate chainId={CHAIN_ID} />
  </CurveComponentTestWrapper>
)

describe('FormLockDate (mocked)', () => {
  beforeEach(setupMockedDaoComponentTest)

  it('estimates and extends a lock', () => {
    const { assertPreSubmit, assertSubmit, curve } = createExtendLockScenario()
    setGasInfo({ chainId: CHAIN_ID, networks })

    cy.mount(<ExtendLockForm curve={curve} />)
    cy.contains('button', '1 year').click()
    cy.get('[data-testid="extend-lock-submit-button"]').should('be.enabled')
    cy.then(assertPreSubmit)

    cy.get('[data-testid="extend-lock-submit-button"]').should('be.enabled').click()
    cy.wrap(null).should(assertSubmit)
  })
})

import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { helpers } from '@/dao/lib/curvejs'
import { useStore } from '@/dao/store/useStore'
import type { CurveApi } from '@/dao/types/dao.types'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import { createCreateVeCrvLockScenario } from '@cy/support/helpers/dao/mocks/create-vecrv-lock.mocks'

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
  beforeEach(() => {
    useStore.getState().lockedCrv.resetState()
  })

  const testCases = [
    { isApproved: false, title: 'estimates, approves, and creates a lock' },
    { isApproved: true, title: 'estimates and creates an approved lock' },
  ]

  testCases.forEach(({ isApproved, title }) => {
    it(title, () => {
      const scenario = createCreateVeCrvLockScenario({ isApproved })
      cy.stub(helpers, 'waitForTransaction').resolves({ status: 1 })
      cy.stub(helpers, 'waitForTransactions').resolves([{ status: 1 }])

      cy.mount(<CreateVeCrvLockForm curve={scenario.curve} />)
      fillCreateLockForm(scenario.lockedAmount)
      cy.get(isApproved ? '[data-testid="create_lock"]' : '[data-testid="approval"]').should('be.enabled')

      cy.then(() => {
        expect(scenario.calcUnlockTime.called).to.eq(true)
        expect(scenario.isApproved.calledWithExactly(scenario.lockedAmount)).to.eq(true)
        if (isApproved) {
          expect(scenario.estimateCreateLock.calledWithExactly(scenario.lockedAmount, scenario.calculatedDays())).to.eq(
            true,
          )
        } else {
          expect(scenario.estimateApprove.calledWithExactly(scenario.lockedAmount)).to.eq(true)
        }
      })

      if (!isApproved) {
        cy.get('[data-testid="approval"]').click()
        cy.then(() => expect(scenario.approve.calledWithExactly(scenario.lockedAmount)).to.eq(true))
      }

      cy.get('[data-testid="create_lock"]').click()
      cy.then(() => {
        const days = scenario.calculatedDays()
        expect(scenario.estimateCreateLock.calledWithExactly(scenario.lockedAmount, days)).to.eq(true)
        expect(scenario.createLock.calledWithExactly(scenario.lockedAmount, days)).to.eq(true)
      })
    })
  })

  it('rejects an amount greater than the CRV balance without calling curvejs', () => {
    const scenario = createCreateVeCrvLockScenario({ isApproved: true })

    cy.mount(<CreateVeCrvLockForm curve={scenario.curve} crv="10" />)
    fillCreateLockForm('10.01')

    cy.contains('Amount is greater than balance').should('be.visible')
    cy.get('[data-testid="create_lock"]').should('be.disabled')
    cy.then(() => {
      expect(scenario.isApproved.callCount).to.eq(0)
      expect(scenario.estimateApprove.callCount).to.eq(0)
      expect(scenario.estimateCreateLock.callCount).to.eq(0)
      expect(scenario.createLock.callCount).to.eq(0)
    })
  })
})

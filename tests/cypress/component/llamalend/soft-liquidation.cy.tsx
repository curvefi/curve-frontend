import { type Address } from 'viem'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { oneInt } from '@cy/support/generators'
import { TEST_ADDRESS } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { seedCrvUsdBalance } from '@cy/support/helpers/llamalend/query-cache.helpers'
import { checkRepayDetailsLoaded } from '@cy/support/helpers/llamalend/repay-loan.helpers'
import {
  checkClosePositionDetailsLoaded,
  submitClosePositionForm,
  submitImproveHealthForm,
  writeImproveHealthForm,
} from '@cy/support/helpers/llamalend/soft-liquidation.helpers'
import { resetLlamaTestContext, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createSoftLiquidationScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = 1

describe('Soft Liquidation Forms (mocked)', () => {
  const createScenario = ({ approved }: { approved: boolean }) => createSoftLiquidationScenario({ chainId, approved })

  afterEach(() => {
    resetLlamaTestContext()
  })

  describe('ImproveHealthForm', () => {
    const runImproveHealthCase = ({ approved, title }: { approved: boolean; title: string }) =>
      it(title, () => {
        const scenario = createScenario({ approved })
      const onRepaid = cy.spy().as('onRepaid')
      const { llamaApi, expected, market, borrow, stubs, collateral } = scenario

      void collateral
      setLlamaApi(llamaApi)
      seedCrvUsdBalance({
        chainId,
        addresses: [TEST_ADDRESS as Address, TEST_ADDRESS.toLowerCase() as Address],
        rawBalance: BigInt(oneInt(15, 90)) * 10n ** 18n,
      })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <ImproveHealthForm market={market} networks={networks} chainId={chainId} onRepaid={onRepaid} />
        </MockLoanTestWrapper>,
      )

      writeImproveHealthForm({ amount: borrow })
      checkRepayDetailsLoaded({ debt: [scenario.debt, scenario.debtAfterImprove, 'crvUSD'] })
      cy.get('[data-testid="improve-health-submit"]').should('not.be.disabled')

        cy.then(() => {
          expect(stubs.parameters).to.have.been.calledWithExactly()
          expect(stubs.repayHealth).to.have.been.calledWithExactly(...expected.improveHealth.health)
          expect(stubs.repayPrices).to.have.been.calledWithExactly(...expected.improveHealth.prices)
          expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.improveHealth.isApproved)
          if ('estimateGasRepayApprove' in stubs) {
            expect(stubs.estimateGasRepayApprove).to.have.been.calledWithExactly(...expected.improveHealth.estimateGasApprove)
          } else {
            expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.improveHealth.estimateGas)
          }
        })

        submitImproveHealthForm().then(() => {
          expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.improveHealth.estimateGas)
          if ('repayApprove' in stubs) {
            expect(stubs.repayApprove).to.have.been.calledWithExactly(...expected.improveHealth.approve)
          }
          expect(stubs.repay).to.have.been.calledWithExactly(...expected.improveHealth.submit)
        })
      })

    runImproveHealthCase({ approved: true, title: 'fills and submits improve health data (already approved)' })
    runImproveHealthCase({ approved: false, title: 'fills, approves, and submits improve health data' })
  })

  describe('ClosePositionForm', () => {
    const runClosePositionCase = ({ approved, title }: { approved: boolean; title: string }) =>
      it(title, () => {
        const scenario = createScenario({ approved })
      const onClosed = cy.spy().as('onClosed')
      const { llamaApi, expected, market, borrow, stubs, collateral } = scenario

      void borrow
      void collateral
      setLlamaApi(llamaApi)
      seedCrvUsdBalance({
        chainId,
        addresses: [TEST_ADDRESS as Address, TEST_ADDRESS.toLowerCase() as Address],
        rawBalance: BigInt(oneInt(15, 90)) * 10n ** 18n,
      })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <ClosePositionForm market={market} networks={networks} chainId={chainId} onClosed={onClosed} />
        </MockLoanTestWrapper>,
      )

      cy.get('[data-testid="loan-info-accordion"] button').first().click()
      checkClosePositionDetailsLoaded({ debt: scenario.debt })

        cy.then(() => {
          expect(stubs.selfLiquidateIsApproved).to.have.been.calledWithExactly(...expected.closePosition.isApproved)
          expect(stubs.estimateGasSelfLiquidate).to.have.been.calledWithExactly(...expected.closePosition.estimateGas)
        })

        submitClosePositionForm().then(() => {
          if ('selfLiquidateApprove' in stubs) {
            expect(stubs.selfLiquidateApprove).to.have.been.calledWithExactly(...expected.closePosition.approve)
          }
          expect(stubs.selfLiquidate).to.have.been.calledWithExactly(...expected.closePosition.submit)
        })
      })

    runClosePositionCase({ approved: true, title: 'shows details and submits close position (already approved)' })
    runClosePositionCase({ approved: false, title: 'shows details, approves, and submits close position' })
  })
})

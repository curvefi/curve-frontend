/* eslint-disable @typescript-eslint/no-unused-expressions */
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
import { resetLlamaTestContext, setGasInfo, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createSoftLiquidationScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = 1
const testCases = [
  { approved: true, title: 'fills and submits (already approved)' },
  { approved: false, title: 'fills, approves, and submits' },
]

describe('Soft Liquidation Forms (mocked)', () => {
  afterEach(() => {
    resetLlamaTestContext()
  })

  describe('ImproveHealthForm', () => {
    testCases.forEach(({ approved, title }: { approved: boolean; title: string }) => {
      it(title, () => {
        const { borrow, debt, debtAfterImprove, expected, llamaApi, market, stubs } = createSoftLiquidationScenario({
          chainId,
          approved,
        })
        const onSuccess = cy.spy().as('onSuccess')
        const onPricesUpdated = cy.spy().as('onPricesUpdated')

        setLlamaApi(llamaApi)
        setGasInfo({ chainId, networks })
        seedCrvUsdBalance({
          chainId,
          addresses: [TEST_ADDRESS as Address, TEST_ADDRESS.toLowerCase() as Address],
          rawBalance: BigInt(oneInt(15, 90)) * 10n ** 18n,
        })

        cy.mount(
          <MockLoanTestWrapper llamaApi={llamaApi}>
            <ImproveHealthForm
              market={market}
              networks={networks}
              chainId={chainId}
              onSuccess={onSuccess}
              onPricesUpdated={onPricesUpdated}
            />
          </MockLoanTestWrapper>,
        )

        writeImproveHealthForm({ amount: borrow })
        checkRepayDetailsLoaded({
          debt: { current: debt, future: debtAfterImprove, symbol: 'crvUSD' },
        })
        cy.get('[data-testid="improve-health-submit-button"]').should('not.be.disabled')

        cy.then(() => {
          expect(stubs.parameters).to.have.been.calledWithExactly()
          expect(stubs.repayHealth).to.have.been.calledWithExactly(...expected.improveHealth.health)
          expect(stubs.repayPrices).to.have.been.calledWithExactly(...expected.improveHealth.prices)
          expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.improveHealth.isApproved)
          if (approved) {
            expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.improveHealth.estimateGas)
          } else {
            expect(stubs.estimateGasRepayApprove).to.have.been.calledWithExactly(
              ...expected.improveHealth.estimateGasApprove,
            )
          }
        })

        submitImproveHealthForm().then(() => {
          expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.improveHealth.estimateGas)
          if (approved) {
            expect(stubs.repayApprove).to.not.have.been.called
          } else {
            expect(stubs.repayApprove).to.have.been.calledWithExactly(...expected.improveHealth.approve)
          }
          expect(stubs.repay).to.have.been.calledWithExactly(...expected.improveHealth.submit)
          expect(onSuccess).to.have.been.calledOnce
        })
      })
    })
  })

  describe('ClosePositionForm', () => {
    testCases.forEach(({ approved, title }: { approved: boolean; title: string }) => {
      it(title, () => {
        const { debt, expected, llamaApi, market, stubs } = createSoftLiquidationScenario({ chainId, approved })
        const onSuccess = cy.spy().as('onSuccess')

        setLlamaApi(llamaApi)
        setGasInfo({ chainId, networks })
        seedCrvUsdBalance({
          chainId,
          addresses: [TEST_ADDRESS as Address, TEST_ADDRESS.toLowerCase() as Address],
          rawBalance: BigInt(oneInt(15, 90)) * 10n ** 18n,
        })

        cy.mount(
          <MockLoanTestWrapper llamaApi={llamaApi}>
            <ClosePositionForm market={market} networks={networks} chainId={chainId} onSuccess={onSuccess} />
          </MockLoanTestWrapper>,
        )

        checkClosePositionDetailsLoaded({ debt })

        cy.then(() => {
          expect(stubs.selfLiquidateIsApproved).to.have.been.calledWithExactly(...expected.closePosition.isApproved)
          expect(stubs.estimateGasSelfLiquidate).to.have.been.calledWithExactly(...expected.closePosition.estimateGas)
        })

        submitClosePositionForm().then(() => {
          if (approved) {
            expect(stubs.selfLiquidateApprove).to.not.have.been.called
          } else {
            expect(stubs.selfLiquidateApprove).to.have.been.calledWithExactly(...expected.closePosition.approve)
          }
          expect(stubs.selfLiquidate).to.have.been.calledWithExactly(...expected.closePosition.submit)
          expect(onSuccess).to.have.been.calledOnce
        })
      })
    })
  })
})

/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { getAmmAddress, getControllerAddress, getTokens, getZapAddress } from '@/llamalend/llama.utils'
import { oneInt } from '@cy/support/generators'
import { TEST_ADDRESS } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { seedCrvUsdBalance } from '@cy/support/helpers/llamalend/query-cache.helpers'
import {
  checkRepayDetailsLoaded,
  submitRepayForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/llamalend/repay-loan.helpers'
import {
  checkClosePositionDetailsLoaded,
  submitClosePositionForm,
} from '@cy/support/helpers/llamalend/soft-liquidation.helpers'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { createSoftLiquidationScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { LlamaMarketType } from '@ui-kit/types/market'
import { constQ } from '@ui-kit/types/util'

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

        setLlamaApi(llamaApi)
        setGasInfo({ chainId, networks: llamaNetworks })
        seedCrvUsdBalance({ chainId, addresses: [TEST_ADDRESS], min: borrow })

        cy.mount(
          <MockLoanTestWrapper llamaApi={llamaApi}>
            <ImproveHealthForm
              market={market}
              marketId={market.id}
              ammAddress={getAmmAddress(market)}
              zapAddress={getZapAddress(market)}
              controllerAddress={getControllerAddress(market)}
              tokens={getTokens(market)}
              networks={llamaNetworks}
              chainId={chainId}
              collateralEvents={constQ(undefined)}
              marketType={LlamaMarketType.Mint}
            />
          </MockLoanTestWrapper>,
        )

        writeRepayLoanForm({ amount: borrow })
        checkRepayDetailsLoaded({
          debt: { current: debt, future: debtAfterImprove, symbol: 'crvUSD' },
          isPriceChanged: false,
        })
        cy.get('[data-testid="repay-submit-button"]').should('not.be.disabled')

        cy.then(() => {
          expect(stubs.parameters).to.have.been.calledWithExactly()
          expect(stubs.repayHealth).to.have.been.calledWithExactly(...expected.improveHealth.health)
          expect(stubs.repayPrices).to.have.been.calledWithExactly(...expected.improveHealth.prices)
          expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.improveHealth.isApproved)
          if (approved) {
            expect(stubs.estimateGasRepayApprove).to.not.have.been.called
            expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.improveHealth.estimateGas)
          } else {
            expect(stubs.estimateGasRepayApprove).to.have.been.calledWithExactly(
              ...expected.improveHealth.estimateGasApprove,
            )
          }
        })

        submitRepayForm().then(() => {
          expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.improveHealth.estimateGas)
          if (approved) {
            expect(stubs.estimateGasRepayApprove).to.not.have.been.called
            expect(stubs.repayApprove).to.not.have.been.called
          } else {
            expect(stubs.estimateGasRepayApprove).to.have.been.calledWithExactly(...expected.improveHealth.approve)
            expect(stubs.repayApprove).to.have.been.calledWithExactly(...expected.improveHealth.approve)
          }
          expect(stubs.repay).to.have.been.calledWithExactly(...expected.improveHealth.submit)
        })
      })
    })
  })

  describe('ClosePositionForm', () => {
    testCases.forEach(({ approved, title }: { approved: boolean; title: string }) => {
      it(title, () => {
        const { debt, expected, llamaApi, market, stubs } = createSoftLiquidationScenario({ chainId, approved })

        setLlamaApi(llamaApi)
        setGasInfo({ chainId, networks: llamaNetworks })
        seedCrvUsdBalance({ chainId, addresses: [TEST_ADDRESS], min: `${oneInt(15, 90)}` })

        cy.mount(
          <MockLoanTestWrapper llamaApi={llamaApi}>
            <ClosePositionForm
              marketId={market.id}
              tokens={getTokens(market)}
              networks={llamaNetworks}
              chainId={chainId}
            />
          </MockLoanTestWrapper>,
        )

        checkClosePositionDetailsLoaded({ debt })

        cy.then(() => {
          expect(stubs.selfLiquidateIsApproved).to.have.been.calledWithExactly(...expected.closePosition.isApproved)
        })

        submitClosePositionForm().then(() => {
          if (approved) {
            expect(stubs.estimateGasSelfLiquidateApprove).to.not.have.been.called
            expect(stubs.selfLiquidateApprove).to.not.have.been.called
          } else {
            expect(stubs.estimateGasSelfLiquidate).to.have.been.calledWithExactly(...expected.closePosition.estimateGas)
            expect(stubs.selfLiquidateApprove).to.have.been.calledWithExactly(...expected.closePosition.approve)
          }
          expect(stubs.selfLiquidate).to.have.been.calledWithExactly(...expected.closePosition.submit)
        })
      })
    })
  })
})

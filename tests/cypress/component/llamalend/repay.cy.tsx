/* eslint-disable @typescript-eslint/no-unused-expressions */
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { fakeCollateralEvents, TEST_ADDRESS } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { seedCrvUsdBalance } from '@cy/support/helpers/llamalend/query-cache.helpers'
import {
  checkRepayDetailsLoaded,
  selectRepayToken,
  submitRepayForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/llamalend/repay-loan.helpers'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { createRepayScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { constQ } from '@ui-kit/types/util'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

const chainId = 1
const testCases = [
  { approved: true, title: 'fills and submits (already approved)' },
  { approved: false, title: 'fills, approves, and submits' },
].flatMap(testCase => [
  {
    ...testCase,
    leverage: false,
    repayToken: 'borrowed' as const,
  },
  {
    ...testCase,
    title: `${testCase.title} with leverage`,
    leverage: true,
    repayToken: 'collateral' as const,
  },
])

describe('RepayForm (mocked)', () => {
  afterEach(() => {
    resetLlamaTestContext()
  })

  testCases.forEach(({ approved, leverage, repayToken, title }) => {
    it(title, () => {
      const { borrow, collateral, currentDebt, expected, futureDebt, llamaApi, market, stubs } = createRepayScenario({
        chainId,
        approved,
        leverage,
      })

      const onPricesUpdated = cy.spy().as('onPricesUpdated')
      const amount = repayToken === 'collateral' ? collateral : borrow
      const hasLeverageManagement = leverage
      const token =
        repayToken === 'collateral'
          ? { symbol: market.collateralSymbol, tokenAddress: market.collateral, optionIndex: 1 }
          : { symbol: 'crvUSD', tokenAddress: CRVUSD_ADDRESS, optionIndex: 0 }

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks: llamaNetworks })
      seedCrvUsdBalance({ chainId, addresses: [TEST_ADDRESS], min: borrow })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <RepayForm
            market={market}
            networks={llamaNetworks}
            chainId={chainId}
            onPricesUpdated={onPricesUpdated}
            collateralEvents={constQ(fakeCollateralEvents)}
          />
        </MockLoanTestWrapper>,
      )

      selectRepayToken({ ...token, hasLeverageManagement })
      writeRepayLoanForm({ amount })
      checkRepayDetailsLoaded({
        debt: { current: currentDebt, future: futureDebt, symbol: 'crvUSD' },
        leverageEnabled: leverage,
      })

      cy.then(() => {
        expect(stubs.parameters).to.have.been.calledWithExactly()
        expect(stubs.repayHealth).to.have.been.calledWithExactly(...expected.health)
        expect(stubs.repayPrices).to.have.been.calledWithExactly(...expected.prices)
        expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
        if (expected.leverage) {
          const { expectedBorrowed, futureLeverage, priceImpact } = expected.leverage
          expect(stubs.repayExpectedBorrowed).to.have.been.calledWithExactly(...expectedBorrowed)
          expect(stubs.repayFutureLeverage).to.have.been.calledWithExactly(...futureLeverage)
          expect(stubs.repayPriceImpact).to.have.been.calledWithExactly(...priceImpact)
        }
        if (approved) {
          expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.estimateGasRepayApprove).to.not.have.been.called
        } else {
          expect(stubs.estimateGasRepayApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        }
      })

      submitRepayForm().then(() => {
        expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.estimateGas)
        expect(stubs.repay).to.have.been.calledWithExactly(...expected.submit)
        if (approved) {
          expect(stubs.repayApprove).to.not.have.been.called
        } else {
          expect(stubs.repayApprove).to.have.been.calledWithExactly(...expected.approve)
        }
      })
    })
  })
})

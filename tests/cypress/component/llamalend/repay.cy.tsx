import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { getTokens } from '@/llamalend/llama.utils'
import { fakeCollateralEvents, TEST_ADDRESS } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createRepayScenario } from '@cy/support/helpers/llamalend/mocks/repay.mocks'
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
      const { borrow, collateral, currentDebt, futureDebt, llamaApi, market, assertPreSubmit, assertSubmit } =
        createRepayScenario({
          chainId,
          approved,
          leverage,
        })

      const onPricesUpdated = cy.spy().as('onPricesUpdated')
      const amount = repayToken === 'collateral' ? collateral : borrow
      const hasLeverageManagement = leverage
      const { collateralToken } = getTokens(market)
      const token =
        repayToken === 'collateral'
          ? { symbol: collateralToken.symbol, tokenAddress: collateralToken.address, optionIndex: 1 }
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

      cy.then(assertPreSubmit)
      submitRepayForm().then(assertSubmit)
    })
  })
})

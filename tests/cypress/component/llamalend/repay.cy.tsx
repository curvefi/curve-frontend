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
  setupMockedLlamalendComponentTest,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import { constQ } from '@ui/features/queries/util'

const CHAIN_ID = 1
const OVERSIZED_CALLDATA = `0x${'00'.repeat(9_401)}` as const
const testCases = [
  { approved: true, title: 'fills and submits (already approved)' },
  { approved: false, title: 'fills, approves, and submits' },
].flatMap(testCase => [
  { ...testCase, leverage: false, repayToken: 'borrowed' as const },
  { ...testCase, title: `${testCase.title} with leverage`, leverage: true, repayToken: 'collateral' as const },
])

describe('RepayForm (mocked)', () => {
  beforeEach(setupMockedLlamalendComponentTest)

  it('approves delegation and repays on LLv2 with oversized calldata', () => {
    const { collateral, controllerApproval, llamaApi, market } = createRepayScenario({
      chainId: CHAIN_ID,
      approved: true,
      leverage: true,
      controllerApproved: false,
      routeCalldata: OVERSIZED_CALLDATA,
    })
    Object.assign(market, { version: 'v2' })
    const { collateralToken } = getTokens(market)
    setLlamaApi(llamaApi)
    setGasInfo({ chainId: CHAIN_ID })
    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
        <RepayForm
          networks={llamaNetworks}
          onPricesUpdated={cy.spy()}
          collateralEvents={constQ(fakeCollateralEvents)}
        />
      </MockLoanTestWrapper>,
    )
    selectRepayToken({
      symbol: collateralToken.symbol,
      tokenAddress: collateralToken.address,
      hasLeverageManagement: true,
      optionIndex: 1,
    })
    writeRepayLoanForm({ amount: collateral, waitForRoutes: true })
    const repay = market.leverageZapV2.repay as unknown as ReturnType<typeof cy.stub>
    cy.get('[data-testid="loan-form-error-routeId"]').should('not.exist')
    cy.get('[data-testid="repay-submit-button"]')
      .should('be.enabled')
      .and('have.text', 'Approve & Repay from Position')
      .click()
    cy.get('[data-testid="leverage-delegation-modal"]').should('be.visible')
    cy.then(() => expect(repay.callCount).to.equal(0))
    cy.get('[data-testid="leverage-delegation-approve"]').click()
    cy.contains('[data-testid="toast-success"]', 'Loan repaid!', TRANSACTION_LOAD_TIMEOUT)
    cy.then(() => {
      expect(controllerApproval.setControllerApproval.callCount).to.equal(1)
      expect(repay.callCount).to.equal(1)
    })
  })

  testCases.forEach(({ approved, leverage, repayToken, title }) => {
    it(title, () => {
      const { borrow, collateral, currentDebt, futureDebt, llamaApi, market, assertPreSubmit, assertSubmit } =
        createRepayScenario({ chainId: CHAIN_ID, approved, leverage })

      const onPricesUpdated = cy.spy().as('onPricesUpdated')
      const amount = repayToken === 'collateral' ? collateral : borrow
      const hasLeverageManagement = leverage
      const { collateralToken } = getTokens(market)
      const token =
        repayToken === 'collateral'
          ? { symbol: collateralToken.symbol, tokenAddress: collateralToken.address, optionIndex: 1 }
          : { symbol: 'crvUSD', tokenAddress: CRVUSD_ADDRESS, optionIndex: 0 }

      setLlamaApi(llamaApi)
      setGasInfo({ chainId: CHAIN_ID })
      seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: borrow })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
          <RepayForm
            networks={llamaNetworks}
            onPricesUpdated={onPricesUpdated}
            collateralEvents={constQ(fakeCollateralEvents)}
          />
        </MockLoanTestWrapper>,
      )

      selectRepayToken({ ...token, hasLeverageManagement })
      writeRepayLoanForm({ amount, waitForRoutes: leverage })
      checkRepayDetailsLoaded({
        debt: { current: currentDebt, future: futureDebt, symbol: 'crvUSD' },
        leverageEnabled: leverage,
      })

      cy.then(assertPreSubmit)
      submitRepayForm().then(assertSubmit)
    })
  })
})

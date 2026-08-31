import type { Hex } from 'viem'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { getTokens } from '@/llamalend/llama.utils'
import { writeBorrowMoreForm } from '@cy/support/helpers/llamalend/borrow-more.helpers'
import { writeCreateLoanForm } from '@cy/support/helpers/llamalend/create-loan.helpers'
import { fakeCollateralEvents } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createBorrowMoreScenario } from '@cy/support/helpers/llamalend/mocks/borrow-more.mocks'
import { createCreateLoanScenario } from '@cy/support/helpers/llamalend/mocks/create-loan.mocks'
import { createRepayScenario } from '@cy/support/helpers/llamalend/mocks/repay.mocks'
import { selectRepayToken, writeRepayLoanForm } from '@cy/support/helpers/llamalend/repay-loan.helpers'
import {
  llamaNetworks,
  setupMockedLlamalendComponentTest,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { mockMintSnapshots } from '@cy/support/helpers/minting-mocks'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { constQ } from '@evm-ui/types/util'

const routerCalldataOfSize = (bytes: number): Hex => `0x${'00'.repeat(bytes)}`
const CHAIN_ID = 1
const OVERSIZED_CALLDATA = routerCalldataOfSize(9_401)
const ROUTE_ERROR = '[data-testid="loan-form-error-routeId"]'

const checkOversizedCalldataBlocked = (submitButtonTestId: string) => {
  cy.wait('@routerRoutes', LOAD_TIMEOUT)
  cy.get(ROUTE_ERROR).should('be.visible')
  cy.get(`[data-testid="${submitButtonTestId}"]`).should('be.disabled')
}

describe('ZapV2 router calldata size', () => {
  beforeEach(setupMockedLlamalendComponentTest)

  it('accepts calldata at the size limit', () => {
    const { llamaApi, market, borrow, collateral } = createCreateLoanScenario({
      chainId: CHAIN_ID,
      approved: true,
      leverage: true,
      routeCalldata: routerCalldataOfSize(9_400),
    })

    setLlamaApi(llamaApi)
    setGasInfo({ chainId: CHAIN_ID, networks: llamaNetworks })
    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
        <CreateLoanForm networks={llamaNetworks} onPricesUpdated={cy.spy()} />
      </MockLoanTestWrapper>,
    )

    writeCreateLoanForm({ collateral, borrow, leverageEnabled: true, hasLeverage: true, waitForRoutes: true })
    cy.get(ROUTE_ERROR).should('not.exist')
  })

  it('warns and blocks create loan calldata above the size limit', () => {
    const { llamaApi, market, borrow, collateral } = createCreateLoanScenario({
      chainId: CHAIN_ID,
      approved: true,
      leverage: true,
      routeCalldata: OVERSIZED_CALLDATA,
    })

    setLlamaApi(llamaApi)
    setGasInfo({ chainId: CHAIN_ID, networks: llamaNetworks })
    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
        <CreateLoanForm networks={llamaNetworks} onPricesUpdated={cy.spy()} />
      </MockLoanTestWrapper>,
    )

    writeCreateLoanForm({ collateral, borrow, leverageEnabled: true, hasLeverage: true })
    checkOversizedCalldataBlocked('create-loan-submit-button')
  })

  it('warns and blocks borrow more calldata above the size limit', () => {
    mockMintSnapshots({ limit: 1 })
    const { borrow, llamaApi, market } = createBorrowMoreScenario({
      chainId: CHAIN_ID,
      approved: true,
      leverage: true,
      leverageImplementation: 'zapV2',
      routeCalldata: OVERSIZED_CALLDATA,
    })

    setLlamaApi(llamaApi)
    setGasInfo({ chainId: CHAIN_ID, networks: llamaNetworks })
    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
        <BorrowMoreForm
          networks={llamaNetworks}
          onPricesUpdated={cy.spy()}
          collateralEvents={constQ(fakeCollateralEvents)}
        />
      </MockLoanTestWrapper>,
    )

    writeBorrowMoreForm({ debt: borrow, hasLeverageManagement: true, leverageEnabled: true })
    checkOversizedCalldataBlocked('borrow-more-submit-button')
  })

  it('warns and blocks repay calldata above the size limit', () => {
    const { collateral, llamaApi, market } = createRepayScenario({
      chainId: CHAIN_ID,
      approved: true,
      leverage: true,
      routeCalldata: OVERSIZED_CALLDATA,
    })
    const { collateralToken } = getTokens(market)

    setLlamaApi(llamaApi)
    setGasInfo({ chainId: CHAIN_ID, networks: llamaNetworks })
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
    writeRepayLoanForm({ amount: collateral })
    checkOversizedCalldataBlocked('repay-submit-button')
  })
})

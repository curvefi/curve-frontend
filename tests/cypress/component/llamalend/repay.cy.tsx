import type { Hex } from 'viem'
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
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import { constQ } from '@ui/features/queries/util'

const CHAIN_ID = 1
const OVERSIZED_CALLDATA = `0x${'00'.repeat(9_401)}` as const
const testCases: {
  approved: boolean
  title: string
  leverage: boolean
  repayToken: 'borrowed' | 'collateral'
  controllerApproved?: boolean
  marketVersion?: 'v2'
  routeCalldata?: Hex
  buttonText?: string
}[] = [
  ...[
    { approved: true, title: 'fills and submits (already approved)' },
    { approved: false, title: 'fills, approves, and submits' },
  ].flatMap(testCase => [
    { ...testCase, leverage: false, repayToken: 'borrowed' as const },
    { ...testCase, title: `${testCase.title} with leverage`, leverage: true, repayToken: 'collateral' as const },
  ]),
  {
    title: 'approves delegation and repays on LLv2 with oversized calldata',
    approved: true,
    leverage: true,
    repayToken: 'collateral',
    controllerApproved: false,
    marketVersion: 'v2',
    routeCalldata: OVERSIZED_CALLDATA,
    buttonText: 'Approve & Repay from Position',
  },
]

describe('RepayForm (mocked)', () => {
  beforeEach(setupMockedLlamalendComponentTest)

  testCases.forEach(
    ({
      approved,
      leverage,
      repayToken,
      title,
      controllerApproved = true,
      marketVersion,
      routeCalldata,
      buttonText,
    }) => {
      it(title, () => {
        const { borrow, collateral, currentDebt, futureDebt, llamaApi, market, assertPreSubmit, assertSubmit } =
          createRepayScenario({ chainId: CHAIN_ID, approved, leverage, controllerApproved, routeCalldata })
        if (marketVersion) Object.assign(market, { version: marketVersion })

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

        if (buttonText) cy.get('[data-testid="repay-submit-button"]').should('be.enabled').and('have.text', buttonText)
        cy.then(assertPreSubmit)
        submitRepayForm(controllerApproved ? undefined : assertPreSubmit).then(assertSubmit)
      })
    },
  )
})

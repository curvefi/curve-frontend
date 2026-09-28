import { type Hex, zeroAddress } from 'viem'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import {
  checkLoanDetailsLoaded,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { ZAP_V2_OVER_LEGACY_LIMIT_CALLDATA } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createCreateLoanScenario } from '@cy/support/helpers/llamalend/mocks/create-loan.mocks'
import {
  llamaNetworks,
  setupMockedLlamalendComponentTest,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { MarketVersion } from '@evm-ui/types/market'

type CreateLoanTestCase = {
  approved: boolean
  title: string
  hasLeverage: boolean
  leverageEnabled: boolean
  controllerApproved?: boolean
  marketVersion?: MarketVersion
  routeCalldata?: Hex
}

const CHAIN_ID = 1

const testCases: CreateLoanTestCase[] = [
  ...[
    { approved: false, title: 'fills, approves, and submits' },
    { approved: true, title: 'fills and submits' },
  ].flatMap(testCase => [
    { ...testCase, hasLeverage: false, leverageEnabled: false },
    { ...testCase, title: `${testCase.title} with leverage`, hasLeverage: true, leverageEnabled: true },
  ]),
  {
    title: 'approves delegation and creates an LLv2 loan with oversized calldata',
    approved: false,
    hasLeverage: true,
    leverageEnabled: true,
    controllerApproved: false,
    marketVersion: MarketVersion.v2,
    routeCalldata: ZAP_V2_OVER_LEGACY_LIMIT_CALLDATA,
  },
]

describe('CreateLoanForm (mocked)', () => {
  beforeEach(setupMockedLlamalendComponentTest)

  testCases.forEach(
    ({ approved, hasLeverage, leverageEnabled, title, controllerApproved = true, marketVersion, routeCalldata }) => {
      it(title, () => {
        const { llamaApi, market, borrow, collateral, assertPreSubmit, assertSubmit } = createCreateLoanScenario({
          chainId: CHAIN_ID,
          presetRange: 50,
          approved,
          leverage: hasLeverage,
          controllerApproved,
          marketVersion,
          routeCalldata,
        })
        const onPricesUpdated = cy.spy().as('onPricesUpdated')

        setLlamaApi(llamaApi)
        setGasInfo({ chainId: CHAIN_ID })

        cy.mount(
          <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
            <CreateLoanForm networks={llamaNetworks} onPricesUpdated={onPricesUpdated} />
          </MockLoanTestWrapper>,
        )

        writeCreateLoanForm({ collateral, borrow, leverageEnabled, hasLeverage, waitForRoutes: leverageEnabled })
        checkLoanDetailsLoaded({ leverageEnabled, controllerApproved })

        cy.then(assertPreSubmit)
        submitCreateLoanForm({ controllerApproved }).then(assertSubmit)
      })
    },
  )

  it('hides leverage for an unlisted ZapV2 market', () => {
    const { llamaApi, market } = createCreateLoanScenario({
      chainId: CHAIN_ID,
      presetRange: 50,
      approved: true,
      leverage: true,
    })
    Object.assign((market as LendMarketTemplate).addresses, { controller: zeroAddress })
    setLlamaApi(llamaApi)
    setGasInfo({ chainId: CHAIN_ID })
    cy.intercept('GET', '**/api/router/v1/routes*').as('routerRoutes')

    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
        <CreateLoanForm networks={llamaNetworks} onPricesUpdated={cy.spy()} />
      </MockLoanTestWrapper>,
    )

    cy.get('[data-testid="leverage-checkbox"]').should('not.exist')
    cy.get('@routerRoutes.all').should('have.length', 0)
  })
})

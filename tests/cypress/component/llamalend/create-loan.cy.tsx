import { zeroAddress } from 'viem'
import { LoanPreset } from '@/llamalend/constants'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import {
  checkLoanDetailsLoaded,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import {
  DEFAULT_CONTROLLER_APPROVAL_TEST_CASE,
  ZAP_V2_OVER_LEGACY_LIMIT_CALLDATA,
} from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createCreateLoanScenario } from '@cy/support/helpers/llamalend/mocks/create-loan.mocks'
import {
  llamaNetworks,
  setupMockedLlamalendComponentTest,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { MarketVersion } from '@evm-ui/types/market'

const CHAIN_ID = 1

const testCases = [
  ...[
    { ...DEFAULT_CONTROLLER_APPROVAL_TEST_CASE, approved: false, title: 'fills, approves, and submits' },
    { ...DEFAULT_CONTROLLER_APPROVAL_TEST_CASE, approved: true, title: 'fills and submits' },
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

        writeCreateLoanForm({
          collateral,
          borrow,
          leverageEnabled,
          hasLeverage,
          waitForRoutes: leverageEnabled,
          isMocked: true,
        })
        checkLoanDetailsLoaded({ leverageEnabled, controllerApproved, isMocked: true })

        cy.then(assertPreSubmit)
        submitCreateLoanForm({ controllerApproved, isMocked: true }).then(assertSubmit)
      })
    },
  )

  ;[[LoanPreset.Safe], [LoanPreset.MaxLtv, LoanPreset.Safe]].forEach(presets => {
    it(`keeps the form valid after selecting ${presets.join(' then ')}`, () => {
      const { llamaApi, market, collateral } = createCreateLoanScenario({ chainId: CHAIN_ID, approved: false })
      Object.assign(market, { createLoanMaxRecv: cy.stub().resolves('136083.72') })
      setLlamaApi(llamaApi)
      setGasInfo({ chainId: CHAIN_ID })
      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
          <CreateLoanForm networks={llamaNetworks} onPricesUpdated={cy.spy()} />
        </MockLoanTestWrapper>,
      )
      writeCreateLoanForm({ collateral, borrow: '1', leverageEnabled: false, hasLeverage: false, isMocked: true })
      cy.get('[data-testid="create-loan-submit-button"]').should('be.enabled')
      presets.forEach(preset => {
        cy.get(`[data-testid="loan-preset-${preset}"]`).click()
        cy.get('[data-testid="create-loan-submit-button"]').should('be.enabled')
      })
      cy.get('[data-testid="borrow-debt-input"] input[type="text"]').should('have.value', '1')
      cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    })
  })

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

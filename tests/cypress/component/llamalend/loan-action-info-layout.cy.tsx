import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { oneViewport } from '@cy/support/ui'
import { q } from '@ui-kit/types/util'
import { mockRoutes } from '@ui-kit/widgets/RouteProvider/route.mock'

const getHeight = (testId: string) =>
  cy
    .get(`[data-testid="${testId}"]`)
    .should('be.visible')
    .then(($element) => $element[0].getBoundingClientRect().height)

const routes = {
  data: mockRoutes,
  isLoading: false,
  error: null,
  selectedRoute: mockRoutes[0],
  onChange: async () => undefined,
  onRefresh: () => undefined,
  tokenOut: { symbol: 'crvUSD', decimals: 18, usdRate: q({ data: 1, error: null, isLoading: false }) },
}

describe('Loan action info layout', () => {
  const [width, height] = oneViewport()
  const expectedHeight = 16 // expected height in Figma

  beforeEach(() => {
    cy.viewport(width, height)
  })

  const testCases = [
    { label: 'data' },
    { label: 'error', data: null, error: new Error('test') },
    { label: 'isLoading', data: null, isLoading: true },
    { label: 'disabled', data: null },
  ]

  testCases.forEach(({ label, isLoading = false, error = null, ...state }) => {
    it(`should have consistent heights (${label})`, () => {
      cy.mount(
        <ComponentTestWrapper>
          <LoanActionInfoList
            isOpen
            health={q({ data: '123.4', ...{ isLoading, error, ...state } })}
            exchangeRate={q({ data: '123.4', ...{ isLoading, error, ...state } })}
            gas={q({ data: { estGasCostUsd: '123.4' }, ...{ isLoading, error, ...state } })}
            rates={q({ data: { borrowApr: '123.4' }, ...{ isLoading, error, ...state } })}
            collateralSymbol="wstETH"
            borrowSymbol="crvUSD"
            routes={routes}
          />
        </ComponentTestWrapper>,
      )

      getHeight('borrow-health').should('equal', expectedHeight)
      getHeight('borrow-apr').should('equal', expectedHeight)
      getHeight('borrow-exchange-rate').should('equal', expectedHeight)
      getHeight('estimated-tx-cost').should('equal', expectedHeight)
      getHeight('route-provider-accordion').should('equal', expectedHeight)
    })
  })
})

import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { oneViewport } from '@cy/support/ui'
import { Decimal } from '@primitives/decimal.utils'
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
  tokenOut: { symbol: 'crvUSD', decimals: 18, usdRate: q({ data: 1, isLoading: false, error: null }) },
}

describe('Loan action info layout', () => {
  const [width, height] = oneViewport()
  const expectedHeight = 14 // expected height in Figma

  beforeEach(() => {
    cy.viewport(width, height)
  })

  it('keeps ActionInfo rows and the collapsed route providers accordion aligned', () => {
    cy.mount(
      <ComponentTestWrapper>
        <LoanActionInfoList
          isOpen
          // health is loaded
          health={q({ data: '1.2345' as Decimal, isLoading: false, error: null })} // health state
          exchangeRate={q({ data: null, isLoading: false, error: new Error('Failed to fetch exchange rate') })} // error state
          gas={q({ data: null, isLoading: false, error: null })} // disabled state
          rates={q({ data: null, isLoading: true, error: null })} // loading state
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
  })
})

import { noop } from 'lodash'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { allViewports } from '@cy/support/ui'
import { notFalsy } from '@primitives/objects.utils'
import { q } from '@ui-kit/types/util'
import { mockRoutes } from '@ui-kit/widgets/RouteProvider/route.mock'

const getHeight = (testId: string, subelement?: string) =>
  cy
    .get(notFalsy(`[data-testid="${testId}"]`, subelement).join(' '))
    .should('be.visible')
    .then($element => $element[0].getBoundingClientRect().height)

const routes = {
  data: mockRoutes,
  isLoading: false,
  error: null,
  selectedRoute: mockRoutes[0],
  onChange: async () => undefined,
  onRefresh: () => undefined,
  tokenOut: { symbol: 'crvUSD', decimals: 18, usdRate: q({ data: 1, error: null, isLoading: false }) },
}

allViewports().forEach(([width, height, viewport]) => {
  describe(`Loan action info list on ${viewport}`, () => {
    const expectedHeight = 16 // expected height in Figma
    const expectedIconHeight = viewport == 'mobile' ? 12 : 14

    beforeEach(() => {
      cy.viewport(width, height)
    })

    const testCases = [
      { label: 'with data' },
      { label: 'on error', data: null, error: new Error('test') },
      { label: 'while loading', data: null, isLoading: true },
      { label: 'when disabled', data: null },
    ]

    testCases.forEach(({ label, isLoading = false, error = null, ...state }) => {
      it(`has consistent heights ${label}`, () => {
        cy.mount(
          <ComponentTestWrapper>
            <LoanActionInfoList
              isOpen
              prevHealth={q({ data: '12.4', ...{ isLoading, error } })} // make sure `->` doesn't change the line height
              health={q({ data: '123.4', ...{ isLoading, error, ...state } })}
              exchangeRate={q({ data: '123.4', ...{ isLoading, error, ...state } })}
              gas={q({ data: { estGasCostUsd: '123.4' }, ...{ isLoading, error, ...state } })}
              rates={q({ data: { borrowApr: '123.4' }, ...{ isLoading, error, ...state } })}
              slippage="123.4"
              onSlippageChange={noop}
              collateralSymbol="wstETH"
              borrowSymbol="crvUSD"
              routes={routes}
            />
          </ComponentTestWrapper>,
        )

        getHeight('borrow-health').should('equal', expectedHeight)
        getHeight('borrow-apr').should('equal', expectedHeight)
        getHeight('borrow-exchange-rate').should('equal', expectedHeight)
        getHeight('borrow-slippage').should('equal', expectedHeight)
        getHeight('estimated-tx-cost').should('equal', expectedHeight)
        getHeight('route-provider-accordion').should('equal', expectedHeight)
        getHeight('estimated-tx-cost', 'svg').should('equal', expectedIconHeight)
        getHeight('borrow-slippage', 'svg').should('equal', expectedIconHeight)
        getHeight('route-provider-accordion', 'img').should('equal', expectedIconHeight)
      })
    })
  })
})

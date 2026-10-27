import { PnlMetrics } from '@/llamalend/features/market-position-details/PnlMetrics'
import type { PositionPnl } from '@/llamalend/position-pnl.utils'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { oneDesktopViewport } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { constQ } from '@ui/features/queries/util'

const EQUITY = '[data-testid="position-equity"]'
const EQUITY_VALUE = '[data-testid="position-equity-value"]'
const PNL = '[data-testid="position-pnl"]'
const PNL_VALUE = '[data-testid="position-pnl-value"]'

// plain borrow of 10,000 crvUSD on 10 WETH at 2,000, now at 2,200
const PNL_AT_2200: PositionPnl = {
  debt: { pnl: '2000', roe: '10' },
  collateral: { pnl: '0.454545454545454545', roe: '4.545454545454545454' },
}

const mountMetrics = (pnl: PositionPnl | null, equity: Decimal = '12000') =>
  cy.mount(
    <ComponentTestWrapper>
      <PnlMetrics
        equity={constQ(equity)}
        pnl={constQ(pnl)}
        borrowSymbol="crvUSD"
        collateralSymbol="WETH"
        borrowUsdRate={constQ(1)}
        collateralUsdRate={constQ(2200)}
      />
    </ComponentTestWrapper>,
  )

const [WIDTH, HEIGHT] = oneDesktopViewport()

describe('PNL metrics', () => {
  beforeEach(() => cy.viewport(WIDTH, HEIGHT))

  it('shows the equity in the borrowed token with its USD value', () => {
    mountMetrics(PNL_AT_2200)
    cy.get(EQUITY_VALUE).should('have.attr', 'data-value', '12000').and('contain.text', 'crvUSD')
    cy.get(EQUITY).should('contain.text', 'Equity').and('contain.text', '$12k')
  })

  it('shows the PNL in the collateral token with the ROE and its USD value', () => {
    mountMetrics(PNL_AT_2200)
    cy.get(PNL_VALUE).should('have.attr', 'data-value', PNL_AT_2200.collateral!.pnl).and('contain.text', 'WETH')
    cy.get(PNL).should('contain.text', 'PNL (ROE %)').and('contain.text', '4.55%').and('contain.text', '$1k')
  })

  it('shows the debt-token PNL on hover', () => {
    mountMetrics(PNL_AT_2200)
    cy.get(PNL_VALUE).trigger('mouseover')
    cy.get('[role="tooltip"]').should('contain.text', 'In crvUSD: +2,000 crvUSD (+10%)')
  })

  it('leaves the ROE out when it is unknown', () => {
    mountMetrics({ debt: { pnl: '-500', roe: null }, collateral: { pnl: '-0.25', roe: null } })
    cy.get(PNL)
      .invoke('text')
      .then(text => expect(text.replace('PNL (ROE %)', '')).not.to.contain('%'))
    cy.get(PNL_VALUE).trigger('mouseover')
    cy.get('[role="tooltip"]').should('contain.text', 'In crvUSD: -500 crvUSD').and('not.contain.text', '(')
  })

  it('shows "-" for the PNL without position history, and still shows the equity', () => {
    mountMetrics(null)
    cy.get(PNL_VALUE).should('have.text', '-')
    cy.get(EQUITY_VALUE).should('have.attr', 'data-value', '12000')
  })
})

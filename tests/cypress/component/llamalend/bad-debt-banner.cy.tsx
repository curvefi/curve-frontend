import { BadDebtBanner } from '@/llamalend/widgets/BadDebtBanner'
import { oneInt } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { oneMarketType } from '@cy/support/helpers/llamalend/mock-market.helpers'
import { LlamaMarketType } from '@ui-kit/types/market'
import { formatPercent } from '@ui-kit/utils'

const mountBanner = ({ solvencyPercent, marketType }: { solvencyPercent: number; marketType: LlamaMarketType }) =>
  cy.mount(
    <ComponentTestWrapper>
      <BadDebtBanner solvencyPercent={solvencyPercent} marketType={marketType} />
    </ComponentTestWrapper>,
  )

const visibleCases = [
  {
    name: 'renders reduced market solvency banner',
    range: [90, 98],
    id: 'reduced',
  },
  {
    name: 'renders low market solvency banner',
    range: [80, 90],
    id: 'low',
  },
  {
    name: 'renders very low market solvency banner',
    range: [0, 80],
    id: 'insolvent',
  },
]

const BANNER_PREFIX_ID = 'bad-debt-banner-'

describe('BadDebtBanner', () => {
  it('does not render for solvent markets', () => {
    mountBanner({ solvencyPercent: oneInt(98, 101), marketType: oneMarketType() })
    cy.get(`[data-testid^=${BANNER_PREFIX_ID}]`).should('not.exist')
  })

  visibleCases.forEach(({ name, range: [min, max], id }) => {
    it(name, () => {
      const solvencyPercent = oneInt(min, max)
      const marketType = oneMarketType()

      mountBanner({ solvencyPercent, marketType })

      cy.get(`[data-testid="${BANNER_PREFIX_ID}${id}"]`).should('be.visible')
      cy.contains(formatPercent(solvencyPercent)).should('be.visible')
      cy.contains('supplied funds').should(marketType === LlamaMarketType.Lend ? 'be.visible' : 'not.exist')
    })
  })
})

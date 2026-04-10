import { BadDebtBanner } from '@/llamalend/widgets/BadDebtBanner'
import { oneMarketType } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { LlamaMarketType } from '@ui-kit/types/market'
import { formatPercent } from '@ui-kit/utils'

const randomPercent = (min: number, maxExclusive: number) => {
  const minBasisPoints = Math.round(min * 100)
  const maxBasisPoints = Math.round(maxExclusive * 100) - 1
  return Cypress._.random(minBasisPoints, maxBasisPoints) / 100
}

const mountBanner = ({ solvencyPercent, marketType }: { solvencyPercent: number; marketType: LlamaMarketType }) =>
  cy.mount(
    <ComponentTestWrapper>
      <BadDebtBanner solvencyPercent={solvencyPercent} marketType={marketType} />
    </ComponentTestWrapper>,
  )

const visibleCases = [
  {
    name: 'renders reduced market solvency banner',
    range: [90, 98] as const,
    title: 'Reduced Market Solvency',
    lendSubtitle: 'A small share of supplied funds is not fully covered.',
  },
  {
    name: 'renders low market solvency banner',
    range: [80, 90] as const,
    title: 'Low Market Solvency',
    lendSubtitle: 'Part of the supplied funds is no longer fully covered.',
  },
  {
    name: 'renders very low market solvency banner',
    range: [0, 80] as const,
    title: 'Very Low Market Solvency',
    lendSubtitle: 'A large share of supplied funds is no longer fully covered.',
  },
]

describe('BadDebtBanner', () => {
  it('does not render for solvent markets', () => {
    mountBanner({ solvencyPercent: randomPercent(98, 100.01), marketType: oneMarketType() })

    cy.contains('Reduced Market Solvency').should('not.exist')
    cy.contains('Low Market Solvency').should('not.exist')
    cy.contains('Very Low Market Solvency').should('not.exist')
  })

  visibleCases.forEach(({ name, range: [min, max], title, lendSubtitle }) => {
    it(name, () => {
      const solvencyPercent = randomPercent(min, max)
      const marketType = oneMarketType()

      mountBanner({ solvencyPercent, marketType })

      cy.contains(title).should('be.visible')
      cy.contains(`Market solvency is ${formatPercent(solvencyPercent)}.`).should('be.visible')
      cy.contains(lendSubtitle).should(marketType === LlamaMarketType.Lend ? 'be.visible' : 'not.exist')
    })
  })
})

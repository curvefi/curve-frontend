import { BadDebtBanner } from '@/llamalend/widgets/banners/BadDebtBanner'
import { oneFloat } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { formatPercent } from '@ui-kit/utils'

const mountBanner = ({ solvencyPercent }: { solvencyPercent: number }) =>
  cy.mount(
    <ComponentTestWrapper>
      <BadDebtBanner solvencyPercent={solvencyPercent} />
    </ComponentTestWrapper>,
  )

const visibleCases = [
  {
    name: 'renders low market solvency banner',
    range: [90, 99.9],
    id: 'low',
  },
  {
    name: 'renders very low market solvency banner',
    range: [0, 90],
    id: 'insolvent',
  },
]

const BANNER_PREFIX_ID = 'bad-debt-banner-'

describe('BadDebtBanner', () => {
  it('does not render for solvent markets', () => {
    mountBanner({ solvencyPercent: oneFloat(99.9, 101) })
    cy.get(`[data-testid^=${BANNER_PREFIX_ID}]`).should('not.exist')
  })

  visibleCases.forEach(({ name, range: [min, max], id }) => {
    it(name, () => {
      const solvencyPercent = oneFloat(min, max)

      mountBanner({ solvencyPercent })

      cy.get(`[data-testid="${BANNER_PREFIX_ID}${id}"]`).should('be.visible')
      cy.contains(formatPercent(solvencyPercent)).should('be.visible')
    })
  })
})

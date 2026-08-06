import { PoolColumnId } from '@/dex/features/pool-list/columns'
import { API_LOAD_TIMEOUT } from '@cy/support/ui'
import { V2_POOL_FIXTURES } from './dex-pool-list-v2-mocks'

export const DESKTOP_VIEWPORT = [1200, 800] as const
export const MOBILE_VIEWPORT = [375, 800] as const

const TOOLTIP = '[role="tooltip"]'

export type V2TooltipExpectation = {
  rows?: readonly (readonly [label: string, value: string])[]
  contains?: readonly (string | RegExp)[]
  excludes?: readonly (string | RegExp)[]
  links?: readonly { href: string; text?: string | RegExp }[]
}

type V2PoolListNetwork = 'ethereum' | 'taiko'

export const visitV2PoolList = ({
  network = 'ethereum',
  viewport = DESKTOP_VIEWPORT,
}: {
  network?: V2PoolListNetwork
  viewport?: readonly [number, number]
} = {}) => {
  const isMobile = viewport[0] < 600

  cy.viewport(viewport[0], viewport[1])
  cy.visitWithoutTestConnector(`dex/${network}/pools/`)
  cy.wait('@dex-v2-platforms', API_LOAD_TIMEOUT)
  cy.wait(['@dex-v2-prices-chains'], API_LOAD_TIMEOUT)
  cy.wait('@dex-v2-pool-chains', API_LOAD_TIMEOUT)
  cy.wait('@dex-v2-pools', API_LOAD_TIMEOUT)
  cy.wait('@dex-v2-merkl-curve', API_LOAD_TIMEOUT)

  if (!isMobile && network === 'ethereum') {
    cy.get(`[data-testid="data-table-header-${PoolColumnId.NetApy}"]`, API_LOAD_TIMEOUT).should('be.visible')
  } else {
    const { address } = network === 'taiko' ? V2_POOL_FIXTURES.lite : V2_POOL_FIXTURES.showcase
    const row = getV2PoolRow(address).should('be.visible')

    if (network === 'ethereum') row.find('[data-testid="pool-badges"]').should('be.visible')
  }
}

export const getV2PoolRow = (address: string) =>
  cy
    .get(`[data-testid="market-link-${address}"]`, API_LOAD_TIMEOUT)
    .should('exist')
    .closest('[data-testid^="data-table-row-"]')

export const getV2PoolCell = (address: string, columnId: PoolColumnId) =>
  getV2PoolRow(address).find(`[data-testid="data-table-cell-${columnId}"]`)

const normalizeText = (text: string | null | undefined) => text?.replace(/\s+/g, ' ').trim() ?? ''
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const matchesText = (actual: string, expected: string | RegExp, exact = false) => {
  if (typeof expected === 'string') return exact ? actual === expected : actual.includes(expected)

  expected.lastIndex = 0
  return expected.test(actual)
}

export const expectV2Tooltip = (
  getTrigger: () => Cypress.Chainable<JQuery<HTMLElement>>,
  expectation: V2TooltipExpectation = {},
) => {
  getTrigger().trigger('mouseover', { eventConstructor: 'MouseEvent' })
  cy.get(TOOLTIP)
    .filter(':visible')
    .should('have.length', 1)
    .should($tooltip => {
      expect($tooltip.attr('id'), 'tooltip id').to.be.a('string')
      expect($tooltip.attr('id'), 'tooltip id').not.to.equal('')
    })
    .then($tooltip => {
      const tooltipId = $tooltip.attr('id')!
      const ownedTooltip = `${TOOLTIP}[id="${tooltipId}"]`

      getTrigger().should($trigger => {
        const ownedTooltipId = $trigger.attr('aria-labelledby') ?? $trigger.attr('aria-describedby')

        expect(ownedTooltipId, 'owned tooltip id').to.equal(tooltipId)
      })

      cy.get(ownedTooltip).should($tooltip => {
        expect($tooltip).to.have.length(1)
        expect($tooltip.is(':visible')).to.equal(true)

        const tooltip = $tooltip[0]
        const tooltipText = normalizeText(tooltip.textContent)

        for (const [label, value] of expectation.rows ?? []) {
          const rowPattern = new RegExp(`${escapeRegExp(label)}\\s*${escapeRegExp(value)}`)

          expect(tooltipText, `tooltip row "${label}" with value "${value}"`).to.match(rowPattern)
        }

        for (const expected of expectation.contains ?? []) {
          expect(matchesText(tooltipText, expected), `tooltip text to include ${expected.toString()}`).to.equal(true)
        }
        for (const excluded of expectation.excludes ?? []) {
          expect(matchesText(tooltipText, excluded), `tooltip text to exclude ${excluded.toString()}`).to.equal(false)
        }

        const tooltipLinks = [...tooltip.querySelectorAll('a')]
        for (const { href, text } of expectation.links ?? []) {
          const matchingLink = tooltipLinks.find(
            link =>
              link.getAttribute('href') === href &&
              (text == null || matchesText(normalizeText(link.textContent), text, typeof text === 'string')),
          )

          expect(
            matchingLink,
            `tooltip link "${href}"${text == null ? '' : ` with text "${text.toString()}"`}`,
          ).not.to.equal(undefined)
        }
      })
      getTrigger().trigger('mouseout', { eventConstructor: 'MouseEvent' })
      cy.get(ownedTooltip).should('not.exist')
    })
}

export const showV2PoolColumns = (columnIds: readonly PoolColumnId[]) => {
  cy.get('[data-testid="btn-visibility-settings"]').click()
  for (const columnId of columnIds) {
    cy.get(`[data-testid="visibility-toggle-${columnId}"]`)
      .should('exist')
      .then($toggle => {
        const $input = $toggle.is('input') ? $toggle : $toggle.find('input')

        if (!$input.is(':checked')) cy.wrap($toggle).click()
      })
  }
  cy.get('body').click(0, 0)
}

export const getV2PoolExpandedPanel = (address: string) =>
  getV2PoolRow(address).next('tr').find('[data-testid="pool-age-value"]').should('be.visible').closest('tr')

export const expandV2PoolRow = (address: string) => {
  getV2PoolRow(address).find('[data-testid="expand-icon"]').click()
  return getV2PoolExpandedPanel(address)
}

import { MarketColumnId } from '@/llamalend/features/market-list/columns/columns.enum'
import { calculateLendMarketTvlUsd } from '@/llamalend/llama.utils'
import type { GetMarketsResponse } from '@curvefi/prices-api/llamalend'
import { oneBool, oneOf, type TokenType } from '@cy/support/generators'
import { getTableCellAssets, withFilters, withMultiSelectFilter } from '@cy/support/helpers/data-table.helpers'
import { type Chain } from '@cy/support/helpers/lending-mocks'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { assertInViewport, Breakpoint } from '@cy/support/ui'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import { median } from '@primitives/array.utils'
import { fromEntries, notFalsy, recordEntries, recordValues } from '@primitives/objects.utils'
import { serializeListFilter } from '@ui/features/tables/filters'

export function visitAndWait(
  [width, height]: [number, number],
  path = '/llamalend/ethereum/markets/',
  options?: Partial<Cypress.VisitOptions>,
) {
  cy.viewport(width, height)
  if (oneBool()) {
    cy.visit(path, { ...TIMEOUTS['ui.pageLoad'], ...options })
  } else {
    cy.visitWithoutTestConnector(path, { ...TIMEOUTS['ui.pageLoad'], ...options })
  }
  cy.get('[data-testid="data-table"]', TIMEOUTS['mock.prices.markets']).should('be.visible')
  cy.get('[data-testid="submit-error-report-button"]').should('not.exist')
}

export const clickMarketAction = (breakpoint: Breakpoint, selector: string) =>
  cy
    .get(notFalsy(breakpoint === 'mobile' && `[data-testid="expanded-panel-actions-menu"]`, selector).join(' '))
    .first()
    // On desktop, the action is not visible until hovered; Cypress does not support hovering.
    .click({ force: breakpoint === 'desktop' })

export function enableGraphColumn() {
  cy.get(`[data-testid="line-graph-${MarketRateType.Borrow}"]`).should('not.exist')
  cy.get(`[data-testid="btn-visibility-settings"]`).click()
  cy.get(`[data-testid="visibility-toggle-borrowChart"]`).click()
  cy.get(`[data-testid="line-graph-${MarketRateType.Borrow}"]`).should('exist')
  cy.get('body').click(0, 0) // close popover
}

export const typeFilterInput = (testId: string, value: number) => {
  cy.get(`[data-testid="${testId}"]`).find('input[type="text"]').as('filterInput')
  cy.get(`@filterInput`).click()
  cy.get(`@filterInput`).type('{selectAll}')
  cy.get(`@filterInput`).type(`${value}`)
  return cy.get(`@filterInput`)
}

/** Returns the median value for a column. */
const getMedianValue = <T extends Partial<Record<string, number | null>>>(data: T[], key: string) =>
  median(notFalsy(...data.map(item => item[key])))

/** Returns one random column paired with its median value. */
export const getOneColumnMedianValue = (
  vaultData: Record<Chain, GetMarketsResponse>,
  columns: readonly MarketColumnId[],
) => {
  const data = recordValues(vaultData).flatMap(({ data }) =>
    data.map(
      ({ borrowed_balance_usd, collateral_balance_usd, total_assets_usd, total_debt_usd, borrow_apr, max_ltv }) => ({
        [MarketColumnId.LiquidityUsd]: total_assets_usd - total_debt_usd,
        [MarketColumnId.Tvl]: calculateLendMarketTvlUsd({
          borrowedBalanceUsd: borrowed_balance_usd,
          collateralBalanceUsd: collateral_balance_usd,
          totalAssetsUsd: total_assets_usd,
          totalDebtUsd: total_debt_usd,
        }),
        [MarketColumnId.BorrowRate]: borrow_apr,
        [MarketColumnId.UtilizationPercent]: total_assets_usd ? (100 * total_debt_usd) / total_assets_usd : 0,
        [MarketColumnId.MaxLtv]: max_ltv,
      }),
    ),
  )
  const medianValues = fromEntries(columns.map(columnId => [columnId, getMedianValue(data, columnId)] as const))
  return oneOf(...recordEntries(medianValues))
}

export const filterByMarketType = (size: [number, number], marketType: MarketType = MarketType.Lend) => {
  const otherMarketType = oneOf(...recordValues(MarketType).filter(m => m !== marketType))
  visitAndWait(size, `/llamalend/ethereum/markets?type=${marketType}`)
  cy.url().should('include', `type=${marketType}`)
  cy.get(`[data-testid="badge-market-type-${otherMarketType}"]`).should('not.exist')
}

export function checkLineGraphColor(type: MarketRateType, color: string, height: number) {
  // the graphs are lazy loaded, so we need to scroll to them first before checking the color
  cy.get(`[data-testid="line-graph-${type}"]:visible`).first().as('rateGraph')
  cy.get('@rateGraph').scrollIntoView({ offset: { top: -height / 2, left: 0 } }) // clear of the sticky table header.
  cy.get('@rateGraph').should(assertInViewport)
  cy.get('@rateGraph')
    .find('svg path[stroke]', TIMEOUTS['mock.prices.snapshots'])
    .first()
    .should('have.attr', 'stroke', color)
}

export function checkCoinSelection(
  breakpoint: Breakpoint,
  vaultData: Record<Chain, GetMarketsResponse>,
  type: TokenType,
) {
  const symbol = oneOf(...vaultData.ethereum.data.map(d => d[`${type}_token`].symbol))
  const columnId = `assets_${type}_symbol`
  withFilters(breakpoint, () => {
    withMultiSelectFilter(
      { id: columnId },
      () => cy.get(`[data-testid="menu-${columnId}"] [value="${symbol}"]`).click(), // select the token
    )

    getTableCellAssets().find(`[data-testid^="token-icon-${symbol}"]`).should('exist') // token might be hidden behind other tokens
    cy.url().should('include', `assets_${type}_symbol=${encodeURIComponent(symbol)}`)

    return withMultiSelectFilter({ id: columnId, clearOnClose: true })
  })
  cy.url().should('not.include', `assets_${type}_symbol`)
}

/** Check if one or more chains have been selected by checking url and table cell. */
export function checkChainSelection(...chains: Chain[]) {
  cy.url().should('include', serializeListFilter(chains))
  chains.forEach(chain => void getTableCellAssets().find(`[data-testid="chain-icon-${chain}"]`).should('be.visible'))
}

/** Check the correct selection of the filter's grouped buttons by checking the url and a callback function */
export function checkTableFilterButtonGroupSelection<T extends string>(
  breakpoint: Breakpoint,
  value: T,
  type: string,
  checkCallback: (value?: T) => void,
) {
  withFilters(breakpoint, () => cy.get(`[data-testid="table-filter-btn-market-${type}-${value}"]`).click())
  cy.url().should('include', value)
  checkCallback(value)
}

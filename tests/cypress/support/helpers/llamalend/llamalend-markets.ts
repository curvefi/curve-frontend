import { LlamaMarketColumnId } from '@/llamalend/features/market-list/columns/columns.enum'
import type { GetMarketsResponse } from '@curvefi/prices-api/llamalend'
import { oneOf, type TokenType } from '@cy/support/generators'
import { getTableCellAssets, withFiltersPopover } from '@cy/support/helpers/data-table.helpers'
import { type Chain } from '@cy/support/helpers/lending-mocks'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { median } from '@primitives/array.utils'
import { fromEntries, notFalsy, recordEntries, recordValues } from '@primitives/objects.utils'
import { serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'

export function visitAndWait(
  [width, height]: [number, number],
  path = '/llamalend/ethereum/markets/',
  options?: Partial<Cypress.VisitOptions>,
) {
  cy.viewport(width, height)
  cy.visit(path, { ...LOAD_TIMEOUT, ...options })
  cy.get('[data-testid="data-table"]', LOAD_TIMEOUT).should('be.visible')
}

export function enableGraphColumn() {
  cy.get(`[data-testid="line-graph-${MarketRateType.Borrow}"]`).should('not.exist')
  cy.get(`[data-testid="btn-visibility-settings"]`).click()
  cy.get(`[data-testid="visibility-toggle-borrowChart"]`).click()
  cy.get(`[data-testid="line-graph-${MarketRateType.Borrow}"]`).should('exist')
  cy.get('body').click(0, 0) // close popover
}

export const typeFilterInput = (testId: string, value: number) =>
  cy.get(`[data-testid="${testId}"]`).find('input[type="text"]').click().type('{selectAll}').type(`${value}`)

/** Returns the median value for a column. */
const getMedianValue = <T extends Partial<Record<string, number>>>(data: T[], key: string) =>
  median(notFalsy(...data.map(item => item[key])))

/** Returns one random column paired with its median value. */
export const getOneColumnMedianValue = (
  vaultData: Record<Chain, GetMarketsResponse>,
  columns: readonly LlamaMarketColumnId[],
) => {
  const data = recordValues(vaultData).flatMap(({ data }) =>
    data.map(
      ({ borrowed_balance_usd, collateral_balance_usd, total_assets_usd, total_debt_usd, borrow_apr, max_ltv }) => ({
        [LlamaMarketColumnId.LiquidityUsd]: total_assets_usd - total_debt_usd,
        [LlamaMarketColumnId.Tvl]: borrowed_balance_usd + collateral_balance_usd + total_assets_usd - total_debt_usd,
        [LlamaMarketColumnId.BorrowRate]: borrow_apr,
        [LlamaMarketColumnId.UtilizationPercent]: total_assets_usd ? (100 * total_debt_usd) / total_assets_usd : 0,
        [LlamaMarketColumnId.MaxLtv]: max_ltv,
      }),
    ),
  )
  const medianValues = fromEntries(columns.map(columnId => [columnId, getMedianValue(data, columnId)] as const))
  return oneOf(...recordEntries(medianValues))
}

export const filterByMarketType = (size: [number, number], marketType: LlamaMarketType = LlamaMarketType.Lend) => {
  const otherMarketType = oneOf(...recordValues(LlamaMarketType).filter(m => m !== marketType))
  visitAndWait(size, `/llamalend/ethereum/markets?type=${marketType}`)
  cy.url().should('include', `type=${marketType}`)
  cy.get(`[data-testid="badge-market-type-${otherMarketType}"]`).should('not.exist')
}

export function checkLineGraphColor(type: MarketRateType, color: string) {
  // the graphs are lazy loaded, so we need to scroll to them first before checking the color
  cy.get(`[data-testid="line-graph-${type}"]:visible`).first().scrollIntoView()
  cy.get(`[data-testid="line-graph-${type}"] path`, LOAD_TIMEOUT).first().should('have.attr', 'stroke', color)
}

export function checkCoinSelection(vaultData: Record<Chain, GetMarketsResponse>, type: TokenType) {
  const symbol = oneOf(...vaultData.ethereum.data.map(d => d[`${type}_token`].symbol))
  const columnId = `assets_${type}_symbol`
  withFiltersPopover(() => {
    cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click() // open the menu
    cy.get(`[data-testid="multi-select-clear"]`).click() // deselect previously selected tokens
    cy.get(`[data-testid="menu-${columnId}"]`).should('not.exist') // clicking on clear closes the menu
    cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click() // open the menu again
    cy.get(`[data-testid="menu-${columnId}"] [value="${symbol}"]`).click() // select the token
    cy.get('body').click(0, 0) // close multi select token popover

    getTableCellAssets().find(`[data-testid^="token-icon-${symbol}"]`).should('exist') // token might be hidden behind other tokens
    cy.url().should('include', `assets_${type}_symbol=${encodeURIComponent(symbol)}`)
    cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click() // open the menu
    return cy.get(`[data-testid="multi-select-clear"]`).click() // deselect previously selected tokens
  })
  cy.url().should('not.include', `assets_${type}_symbol`)
}

/** Check if one or more chains have been selected by checking url and table cell. */
export function checkChainSelection(...chains: Chain[]) {
  cy.url().should('include', serializeListFilter(chains))
  chains.forEach(chain => getTableCellAssets().find(`[data-testid="chain-icon-${chain}"]`).should('be.visible'))
}

/** Check the correct selection of the filter's grouped buttons by checking the url and a callback function */
export function checkTableFilterButtonGroupSelection<T extends string>(
  value: T,
  type: string,
  checkCallback: (value?: T) => void,
) {
  withFiltersPopover(() => cy.get(`[data-testid="table-filter-btn-market-${type}-${value}"]`).click())
  cy.url().should('include', value)
  checkCallback(value)
}

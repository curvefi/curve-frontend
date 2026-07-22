import { YIELD_BREAKDOWN_COLUMNS } from '@/dex/features/pool-information/components/yield-breakdown/columns/columns.definitions'
import { FooterRow } from '@/dex/features/pool-information/components/yield-breakdown/FooterRow'
import { useYieldBreakdown } from '@/dex/features/pool-information/hooks/useYieldBreakdown'
import { defaultNetworks } from '@/dex/lib/networks'
import { useStore } from '@/dex/store/useStore'
import type { PoolDataCacheOrApi, RewardsApyMapper } from '@/dex/types/main.types'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import Table from '@mui/material/Table'
import TableFooter from '@mui/material/TableFooter'
import TableRow from '@mui/material/TableRow'
import type { Address } from '@primitives/address.utils'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { queryClient } from '@ui-kit/lib/api'
import { getTokenUsdRateKey } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Chain, MAINNET_CRV_ADDRESS } from '@ui-kit/utils'

const POOL_ID = 'yield-breakdown-test'
const POOL_ADDRESS = '0x1111111111111111111111111111111111111111' as Address
const NETWORKS_QUERY_KEY = ['networks'] as const
const CAMPAIGNS_QUERY_KEYS = [['campaigns-external'], ['campaigns-pools-merkl'], ['campaigns-markets-merkl']] as const
const CRV_PRICE_QUERY_KEY = getTokenUsdRateKey({ chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS })
const QUERY_KEYS = [NETWORKS_QUERY_KEY, ...CAMPAIGNS_QUERY_KEYS, CRV_PRICE_QUERY_KEY] as const
const POOL_DATA = {
  pool: { address: POOL_ADDRESS },
  gauge: { isKilled: false },
} as PoolDataCacheOrApi

const YieldBreakdownApyHarness = ({ poolDataCacheOrApi = POOL_DATA }: { poolDataCacheOrApi?: PoolDataCacheOrApi }) => {
  const { maxBoostTotal, rows, total } = useYieldBreakdown({
    chainId: Chain.Ethereum,
    poolDataCacheOrApi,
    poolId: POOL_ID,
  })
  const table = useReactTable({ data: rows, columns: YIELD_BREAKDOWN_COLUMNS, getCoreRowModel: getCoreRowModel() })

  return (
    <>
      {table.getRowModel().rows.map(row => {
        const cell = row.getVisibleCells().find(({ column }) => column.id === 'apy')
        const source = row.original.source.primary
        const testId =
          source === 'Base APY' ? 'yield-breakdown-base-apy' : source === 'CRV' ? 'yield-breakdown-crv' : undefined

        return (
          <div key={row.id} data-testid={testId}>
            {cell && flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        )
      })}
      {rows.length > 1 && (
        <Table>
          <TableFooter>
            <TableRow data-testid="yield-breakdown-footer">
              <FooterRow visibleColumns={table.getVisibleLeafColumns()} maxBoostTotal={maxBoostTotal} total={total} />
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </>
  )
}

const setCrvRewards = (crv: number[]) =>
  useStore.getState().pools.setStateByKeys({
    rewardsApyMapper: {
      [Chain.Ethereum]: {
        [POOL_ID]: {
          poolId: POOL_ID,
          base: { day: '10', week: '20' },
          other: [],
          crv,
          error: {},
        },
      },
    },
  })

const mountYieldBreakdown = (crv: number[], isKilled = false) => {
  cy.then(() => setCrvRewards(crv))
  cy.mount(
    <ComponentTestWrapper>
      <YieldBreakdownApyHarness
        poolDataCacheOrApi={{ pool: { address: POOL_ADDRESS }, gauge: { isKilled } } as PoolDataCacheOrApi}
      />
    </ComponentTestWrapper>,
  )
}

describe('yield-breakdown APY tooltips', () => {
  let previousRewardsApyMapper: Record<string, RewardsApyMapper>
  let previousQueryData: unknown[]

  beforeEach(() => {
    previousRewardsApyMapper = useStore.getState().pools.rewardsApyMapper
    previousQueryData = QUERY_KEYS.map(queryKey => queryClient.getQueryData(queryKey))
    useStore.getState().pools.setStateByKeys({
      rewardsApyMapper: {
        [Chain.Ethereum]: {
          [POOL_ID]: {
            poolId: POOL_ID,
            base: { day: '10', week: '20' },
            other: [],
            crv: [5, 12.5],
            error: {},
          },
        },
      },
    })

    queryClient.setQueryData(NETWORKS_QUERY_KEY, defaultNetworks)
    CAMPAIGNS_QUERY_KEYS.forEach(queryKey => queryClient.setQueryData(queryKey, {}))
    queryClient.setQueryData(CRV_PRICE_QUERY_KEY, 1)
  })

  afterEach(() => {
    useStore.getState().pools.setStateByKeys({ rewardsApyMapper: previousRewardsApyMapper })
    QUERY_KEYS.forEach((queryKey, index) => {
      const data = previousQueryData[index]
      if (data === undefined) queryClient.removeQueries({ queryKey, exact: true })
      else queryClient.setQueryData(queryKey, data)
    })
  })

  it('renders the shared Base and Gauge APY breakdowns with unboosted values first', () => {
    mountYieldBreakdown([5, 12.5])

    cy.get('[data-testid="yield-breakdown-base-apy"]').should('contain.text', '10.00%').trigger('mouseover')
    cy.get('[role="tooltip"]').should('be.visible').find('.MuiTypography-bodyMBold').should('have.text', 'Base APY')
    cy.get('[data-testid="pool-base-apy-tooltip-content"]')
      .should('contain.text', 'based on trading activity over the past 24 hours')
      .and('contain.text', 'intrinsic yield is included')
      .and('contain.text', 'Daily10.00%')
      .and('contain.text', 'Weekly20.00%')
    cy.get('[data-testid="yield-breakdown-base-apy"]').trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get('[data-testid="yield-breakdown-crv"] .MuiTypography-root').then($values => {
      expect($values.eq(0)).to.have.text('5.12%')
      expect($values.eq(1)).to.have.text('Max boost 13.30%')
    })
    cy.get('[data-testid="yield-breakdown-crv"]').trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Gauge APY')
      .and('contain.text', 'Unboosted5.12%')
      .and('contain.text', 'Maximum13.30%')
    cy.get('[data-testid="pool-gauge-apy-tooltip-content"] img').should('have.length', 2)
    cy.get('[data-testid="yield-breakdown-crv"]').trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get('[data-testid="yield-breakdown-footer"]')
      .should('contain.text', 'Total APY')
      .and('contain.text', '15.12%')
      .and('contain.text', 'Max boost 23.30%')
      .trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')
  })

  it('omits rich and maximum scenarios for partial, zero, missing, and killed gauges', () => {
    const assertNoGaugeTooltip = () => {
      cy.get('[data-testid="yield-breakdown-crv"]').trigger('mouseover')
      cy.get('[role="tooltip"]').should('not.exist')
      cy.get('[data-testid="yield-breakdown-footer"]').should('not.contain.text', 'Max boost')
    }

    mountYieldBreakdown([5])
    cy.get('[data-testid="yield-breakdown-crv"]').should('contain.text', '5.12%').and('not.contain.text', 'Max boost')
    cy.get('[data-testid="yield-breakdown-footer"]').should('contain.text', '15.12%')
    assertNoGaugeTooltip()

    mountYieldBreakdown([0, 0])
    cy.get('[data-testid="yield-breakdown-crv"]').should('not.exist')
    cy.get('[data-testid="yield-breakdown-footer"]').should('not.exist')

    mountYieldBreakdown([])
    cy.get('[data-testid="yield-breakdown-crv"]').should('not.exist')
    cy.get('[data-testid="yield-breakdown-footer"]').should('not.exist')

    mountYieldBreakdown([5, 12.5], true)
    cy.get('[data-testid="yield-breakdown-crv"]').should('contain.text', '-').trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')
    cy.get('[data-testid="yield-breakdown-footer"]')
      .should('contain.text', '10.00%')
      .and('not.contain.text', 'Max boost')
  })
})

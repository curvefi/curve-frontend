import { YIELD_BREAKDOWN_COLUMNS } from '@/dex/features/pool-information/components/yield-breakdown/columns/columns.definitions'
import { useYieldBreakdown } from '@/dex/features/pool-information/hooks/useYieldBreakdown'
import { defaultNetworks } from '@/dex/lib/networks'
import { useStore } from '@/dex/store/useStore'
import type { PoolDataCacheOrApi, RewardsApyMapper } from '@/dex/types/main.types'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { Address } from '@primitives/address.utils'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { queryClient } from '@ui-kit/lib/api'
import { getTokenUsdRateKey } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Chain, MAINNET_CRV_ADDRESS } from '@ui-kit/utils'

const POOL_ID = 'yield-breakdown-test'
const POOL_ADDRESS = '0x1111111111111111111111111111111111111111' as Address
const CRV_TOOLTIP = 'Max CRV APY can be reached with max boost for this pool.'
const NETWORKS_QUERY_KEY = ['networks'] as const
const CAMPAIGNS_QUERY_KEYS = [['campaigns-external'], ['campaigns-pools-merkl'], ['campaigns-markets-merkl']] as const
const CRV_PRICE_QUERY_KEY = getTokenUsdRateKey({ chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS })
const QUERY_KEYS = [NETWORKS_QUERY_KEY, ...CAMPAIGNS_QUERY_KEYS, CRV_PRICE_QUERY_KEY] as const
const POOL_DATA = {
  pool: { address: POOL_ADDRESS },
  gauge: { isKilled: false },
} as PoolDataCacheOrApi

const YieldBreakdownApyHarness = () => {
  const { rows } = useYieldBreakdown({ chainId: Chain.Ethereum, poolDataCacheOrApi: POOL_DATA, poolId: POOL_ID })
  const table = useReactTable({ data: rows, columns: YIELD_BREAKDOWN_COLUMNS, getCoreRowModel: getCoreRowModel() })

  return table.getRowModel().rows.map(row => {
    const cell = row.getVisibleCells().find(({ column }) => column.id === 'apy')
    const source = row.original.source.primary
    const testId =
      source === 'Base APY' ? 'yield-breakdown-base-apy' : source === 'CRV' ? 'yield-breakdown-crv' : undefined

    return (
      <div key={row.id} data-testid={testId}>
        {cell && flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    )
  })
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

  it('renders the hook-produced Base APY breakdown without recompounding and preserves the CRV tooltip', () => {
    cy.mount(
      <ComponentTestWrapper>
        <YieldBreakdownApyHarness />
      </ComponentTestWrapper>,
    )

    cy.get('[data-testid="yield-breakdown-base-apy"]').should('contain.text', '10.00%').trigger('mouseover')
    cy.get('[role="tooltip"]').should('be.visible').find('.MuiTypography-bodyMBold').should('have.text', 'Base APY')
    cy.get('[data-testid="pool-base-apy-tooltip-content"]')
      .should('contain.text', 'based on trading activity over the past 24 hours')
      .and('contain.text', 'intrinsic yield is included')
      .and('contain.text', 'Daily10.00%')
      .and('contain.text', 'Weekly20.00%')
    cy.get('[data-testid="yield-breakdown-base-apy"]').trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get('[data-testid="yield-breakdown-crv"]').trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('have.text', CRV_TOOLTIP)
      .find('[data-testid="pool-base-apy-tooltip-content"]')
      .should('not.exist')
  })
})

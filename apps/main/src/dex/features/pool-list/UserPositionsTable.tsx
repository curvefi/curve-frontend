import { useRef, useState } from 'react'
import { useConnection } from 'wagmi'
import type { NetworkConfig } from '@/dex/types/main.types'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { EmptyStateEvmCard } from '@evm-ui/shared/ui/EmptyStateEvmCard'
import { EvmErrorMessage } from '@evm-ui/shared/ui/EvmErrorMessage'
import { evmAddressDisplay, MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { ExpandedState } from '@tanstack/react-table'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { CenteredEmptyState } from '@ui/features/tables/CenteredEmptyState'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { TableFilters } from '@ui/features/tables/TableFilters'
import { TableHeader } from '@ui/features/tables/TableHeader'
import { TableVisibilitySettingsPopover } from '@ui/features/tables/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsTablet } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { borderStyle, directChildrenAfterFirst } from '@ui/lib/mui'
import { POOL_COLUMNS, PoolColumnId } from './columns'
import { PoolExpandedPanel } from './components/PoolExpandedPanel'
import { usePoolsGlobalFilterFn } from './hooks/usePoolsGlobalFilter'
import { usePoolsVisibility } from './hooks/usePoolsVisibility'
import { useUserPositionsTable } from './hooks/useUserPositionsTable'
import { getPoolTableMeta, createPoolTableMeta } from './table-meta'
import type { PoolRow } from './types'

const { Spacing } = SizesAndSpaces

const LOCAL_STORAGE_KEY = 'dex-user-pool-positions'
const EMPTY_POOL_ROWS: readonly PoolRow[] = []
const MAX_PAGE_SIZE = 10 as const

const UserPositionsExpandedPanel: ExpandedPanelComponent<PoolRow> = ({ row, table }) => (
  <PoolExpandedPanel
    pool={row.original}
    variant="userPositions"
    addressDisplay={getPoolTableMeta(table).addressDisplay}
    crvToken={getPoolTableMeta(table).crvToken}
  />
)

export const UserPositionsTable = ({
  network,
  Actions,
}: {
  network: NetworkConfig
  Actions: ExpandedPanelComponent<PoolRow>
}) => {
  const { address } = useConnection()
  const isTablet = useIsTablet()

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [searchText, setSearchText] = useState('')
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const { columnSettings, columnVisibility, toggleVisibility, variant } = usePoolsVisibility(LOCAL_STORAGE_KEY, {
    variant: 'userPositions',
    mobileColumn: PoolColumnId.Deposits,
  })

  const { tableQuery, totalLiquidityUsd, claimablesTotalUsd, isFetching, onReload, alerts } = useUserPositionsTable({
    network,
  })

  const globalFilterFn = usePoolsGlobalFilterFn(tableQuery.data ?? EMPTY_POOL_ROWS, searchText)

  const table = useCurveTable({
    columns: POOL_COLUMNS,
    query: tableQuery,
    meta: createPoolTableMeta({
      getRowHref: ({ url }) => url,
      variant,
      alerts,
      addressDisplay: evmAddressDisplay,
      crvToken: { address: MAINNET_CRV.address, blockchainId: MAINNET_CRV.chain },
    }),
    getRowId: row => row.address,
    state: { expanded, columnVisibility, globalFilter: searchText },
    initialState: { pagination: { pageIndex: 0, pageSize: MAX_PAGE_SIZE } },
    onExpandedChange: setExpanded,
    enableSorting: false,
    globalFilterFn,
  })
  const rowCount = table.getFilteredRowModel().rows.length

  return (
    <Stack data-testid="user-pool-positions">
      <TableHeader
        title={t`Your positions`}
        onReload={onReload}
        isLoading={isFetching}
        visibilitySettings={
          address && tableQuery.data?.length
            ? { isOpen: visibilitySettingsOpen, open: openVisibilitySettings }
            : undefined
        }
      />
      <Stack ref={anchorRef} sx={directChildrenAfterFirst({ borderTop: borderStyle })}>
        {address ? (
          tableQuery.data?.length ? (
            <>
              <MetricsGrid
                variant="fillMobile"
                sx={{
                  paddingBlock: Spacing.sm,
                  paddingInline: Spacing.md,
                  backgroundColor: t => t.design.Layer[1].Fill,
                }}
              >
                <Metric
                  category="dex.poolListSummary"
                  label={t`Total liquidity provided`}
                  value={totalLiquidityUsd}
                  valueOptions={{ unit: 'dollar' }}
                />
                <Metric
                  category="dex.poolListSummary"
                  label={t`Claimable rewards`}
                  value={claimablesTotalUsd}
                  valueOptions={{ unit: 'dollar' }}
                />
              </MetricsGrid>
              <EvmDataTable
                category="limited"
                table={table}
                viewAllLabel={t`View all ${rowCount} pool positions`}
                emptyState={{
                  title: t`No matching positions`,
                  description: t`Try another pool name, token symbol, or address.`,
                }}
                errorState={{ title: t`Could not load pool positions`, onReload }}
                expandedPanel={{ Body: UserPositionsExpandedPanel, Actions }}
                shouldStickFirstColumn={Boolean(isTablet && rowCount)}
              >
                <TableFilters
                  testIdPrefix={LOCAL_STORAGE_KEY}
                  searchText={searchText}
                  onSearch={value => {
                    setSearchText(value)
                    table.setPageIndex(0)
                  }}
                />
              </EvmDataTable>
              <TableVisibilitySettingsPopover
                anchorRef={anchorRef}
                visibilityGroups={columnSettings}
                toggleVisibility={toggleVisibility}
                open={visibilitySettingsOpen}
                onClose={closeVisibilitySettings}
              />
            </>
          ) : (
            <CenteredEmptyState>
              {tableQuery.error ? (
                <EvmErrorMessage
                  title={t`Could not load pool positions`}
                  subtitle={tableQuery.error.message}
                  error={tableQuery.error}
                  refreshData={onReload}
                />
              ) : (
                <EmptyStateEvmCard
                  isLoading={tableQuery.isLoading}
                  title={t`No active positions`}
                  description={t`Provide liquidity to a pool to see your positions here.`}
                />
              )}
            </CenteredEmptyState>
          )
        ) : (
          <CenteredEmptyState>
            <EmptyStateEvmCard button={{ type: 'connect-wallet', label: t`Connect to view positions` }} />
          </CenteredEmptyState>
        )}
      </Stack>
    </Stack>
  )
}

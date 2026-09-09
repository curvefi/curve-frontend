import { useRef, useState } from 'react'
import { useConnection } from 'wagmi'
import type { NetworkConfig } from '@/dex/types/main.types'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { TableFilters } from '@evm-ui/shared/ui/DataTable/TableFilters'
import { TableHeader } from '@evm-ui/shared/ui/DataTable/TableHeader'
import { TableVisibilitySettingsPopover } from '@evm-ui/shared/ui/DataTable/TableVisibilitySettingsPopover'
import { EmptyStateEvmCard } from '@evm-ui/shared/ui/EmptyStateEvmCard'
import { Metric } from '@evm-ui/shared/ui/Metric'
import Stack from '@mui/material/Stack'
import type { ExpandedState } from '@tanstack/react-table'
import { constQ } from '@ui/features/queries/util'
import { CenteredEmptyState } from '@ui/features/tables/CenteredEmptyState'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsTablet } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { borderStyle, directChildrenAfterFirst } from '@ui/lib/mui'
import { POOL_COLUMNS, PoolColumnId } from './columns'
import { PoolExpandedPanel } from './components/PoolExpandedPanel'
import { PoolExpandedPanelActions } from './components/PoolExpandedPanelActions'
import { usePoolsGlobalFilterFn } from './hooks/usePoolsGlobalFilter'
import { usePoolsVisibility } from './hooks/usePoolsVisibility'
import { useUserPositionsTable } from './hooks/useUserPositionsTable'
import type { PoolRow, PoolTableMeta } from './types'

const { Spacing } = SizesAndSpaces

const LOCAL_STORAGE_KEY = 'dex-user-pool-positions'
const EMPTY_POOL_ROWS: readonly PoolRow[] = []
const MAX_PAGE_SIZE = 10 as const

const UserPositionsExpandedPanel: ExpandedPanelComponent<PoolRow> = ({ row }) => (
  <PoolExpandedPanel pool={row.original} variant="userPositions" />
)

export const UserPositionsTable = ({ network }: { network: NetworkConfig }) => {
  const { address } = useConnection()
  const isTablet = useIsTablet()

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [searchText, setSearchText] = useState('')
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch(false)
  const visibilitySettingsRef = useRef<HTMLButtonElement>(null)
  const { columnSettings, columnVisibility, toggleVisibility, variant } = usePoolsVisibility(LOCAL_STORAGE_KEY, {
    variant: 'userPositions',
    mobileColumn: PoolColumnId.Deposits,
  })

  const { tableQuery, totalLiquidityUsd, isFetching, onReload } = useUserPositionsTable({ network })

  const globalFilterFn = usePoolsGlobalFilterFn(tableQuery.data ?? EMPTY_POOL_ROWS, searchText)

  const table = useCurveTable({
    columns: POOL_COLUMNS,
    query: tableQuery,
    meta: { getRowHref: ({ url }) => url, variant } as PoolTableMeta,
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
      <TableHeader title={t`Your positions`} onReload={() => void onReload()} isLoading={isFetching} />
      <Stack sx={directChildrenAfterFirst({ borderTop: borderStyle })}>
        <Stack
          sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}
        >
          <Metric
            category="dex.userLiquidityDetails"
            label={t`Total liquidity provided`}
            value={address ? totalLiquidityUsd : constQ(undefined)}
            valueOptions={{ unit: 'dollar' }}
          />
        </Stack>
        {address ? (
          <>
            <EvmDataTable
              category="limited"
              table={table}
              viewAllLabel={t`View all ${rowCount} pool positions`}
              emptyState={{
                title: searchText ? t`No matching positions` : t`No active positions`,
                description: searchText
                  ? t`Try another pool name, token symbol, or address.`
                  : t`Provide liquidity to a pool to see your positions here.`,
              }}
              errorState={{ title: t`Could not load pool positions`, onReload }}
              expandedPanel={{ Body: UserPositionsExpandedPanel, Actions: PoolExpandedPanelActions }}
              shouldStickFirstColumn={Boolean(isTablet && rowCount)}
            >
              <TableFilters
                testIdPrefix={LOCAL_STORAGE_KEY}
                visibilitySettings={{
                  anchorRef: visibilitySettingsRef,
                  open: visibilitySettingsOpen,
                  onOpen: openVisibilitySettings,
                }}
                searchText={searchText}
                onSearch={value => {
                  setSearchText(value)
                  table.setPageIndex(0)
                  setExpanded({})
                }}
                disableSearchAutoFocus
              />
            </EvmDataTable>
            <TableVisibilitySettingsPopover
              anchorRef={visibilitySettingsRef}
              visibilityGroups={columnSettings}
              toggleVisibility={toggleVisibility}
              open={visibilitySettingsOpen}
              onClose={closeVisibilitySettings}
            />
          </>
        ) : (
          <CenteredEmptyState>
            <EmptyStateEvmCard button={{ type: 'connect-wallet', label: t`Connect to view positions` }} />
          </CenteredEmptyState>
        )}
      </Stack>
    </Stack>
  )
}

import { useRef, useState } from 'react'
import { useConnection } from 'wagmi'
import type { NetworkConfig } from '@/dex/types/main.types'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { EmptyStateEvmCard } from '@evm-ui/shared/ui/EmptyStateEvmCard'
import { EvmErrorMessage } from '@evm-ui/shared/ui/EvmErrorMessage'
import { evmAddressDisplay, MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { recordEntries } from '@primitives/objects.utils'
import type { ExpandedState } from '@tanstack/react-table'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { CenteredEmptyState } from '@ui/features/tables/CenteredEmptyState'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { TableHeader } from '@ui/features/tables/TableHeader'
import { TableVisibilitySettingsPopover } from '@ui/features/tables/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsTablet } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { borderStyle, directChildrenAfterFirst } from '@ui/lib/mui'
import { POOL_COLUMNS, PoolColumnId } from './columns'
import { PoolExpandedPanel } from './components/PoolExpandedPanel'
import { usePoolsVisibility } from './hooks/usePoolsVisibility'
import { useResidualClaimsTable } from './hooks/useResidualClaimsTable'
import { useUserPositionsTable } from './hooks/useUserPositionsTable'
import { getPoolTableMeta, createPoolTableMeta } from './table-meta'
import type { PoolRow, PoolTableVariant } from './types'

const { Spacing } = SizesAndSpaces

const LOCAL_STORAGE_KEY = 'dex-user-pool-positions'
const MAX_PAGE_SIZE = 10 as const

type Variant = Extract<PoolTableVariant, 'userPositions' | 'residualClaims'>

const TABS = { userPositions: t`Your positions`, residualClaims: t`Residual rewards` } satisfies Record<Variant, string>
const MOBILE_COLUMNS = {
  userPositions: PoolColumnId.Deposits,
  residualClaims: PoolColumnId.Claimables,
} satisfies Record<Variant, PoolColumnId>

const UserPositionsExpandedPanel: ExpandedPanelComponent<PoolRow> = ({ row, table }) => (
  <PoolExpandedPanel
    pool={row.original}
    variant={getPoolTableMeta(table).variant}
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
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  const [variant, setVariant] = useState<Variant>('userPositions')
  const userPositions = useUserPositionsTable({ network }, variant === 'userPositions')
  const residualClaims = useResidualClaimsTable({ network }, variant === 'residualClaims')
  const {
    tableQuery,
    claimablesTotalUsd,
    isFetching,
    onReload,
    alerts,
    labels: { errorTitle, loading, empty },
  } = variant === 'residualClaims' ? residualClaims : userPositions

  const { columnSettings, columnVisibility, toggleVisibility } = usePoolsVisibility(LOCAL_STORAGE_KEY, {
    variant,
    mobileColumn: MOBILE_COLUMNS[variant],
  })

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
    state: { expanded, columnVisibility },
    initialState: { pagination: { pageIndex: 0, pageSize: MAX_PAGE_SIZE } },
    onExpandedChange: setExpanded,
    enableSorting: false,
  })
  const rowCount = table.getFilteredRowModel().rows.length

  return (
    <Stack data-testid="user-pool-positions">
      <TableHeader
        tabs={{
          value: variant,
          onChange: value => {
            setVariant(value)
            setExpanded({})
            table.setPageIndex(0)
            closeVisibilitySettings()
          },
          options: recordEntries(TABS).map(([value, label]) => ({ value, label })),
        }}
        onReload={onReload}
        isLoading={isFetching}
        visibilitySettings={rowCount > 0 ? { isOpen: visibilitySettingsOpen, open: openVisibilitySettings } : undefined}
      />
      <Stack ref={anchorRef} sx={directChildrenAfterFirst({ borderTop: borderStyle })}>
        {address ? (
          rowCount > 0 ? (
            <>
              <MetricsGrid
                variant="fillMobile"
                sx={{
                  paddingBlock: Spacing.sm,
                  paddingInline: Spacing.md,
                  backgroundColor: t => t.design.Layer[1].Fill,
                }}
              >
                {variant === 'userPositions' && (
                  <Metric
                    category="dex.poolListSummary"
                    label={t`Total liquidity provided`}
                    value={userPositions.totalLiquidityUsd}
                    valueOptions={{ unit: 'dollar' }}
                  />
                )}
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
                emptyState={empty}
                errorState={{ title: errorTitle, onReload }}
                expandedPanel={{ Body: UserPositionsExpandedPanel, Actions }}
                shouldStickFirstColumn={Boolean(isTablet && rowCount)}
              />
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
                  title={errorTitle}
                  subtitle={tableQuery.error.message}
                  error={tableQuery.error}
                  refreshData={onReload}
                />
              ) : (
                <EmptyStateEvmCard {...(tableQuery.isLoading ? loading : empty)} />
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

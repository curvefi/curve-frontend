import { useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { recordEntries } from '@primitives/objects.utils'
import type { ExpandedState } from '@tanstack/react-table'
import { EmptyStateCard } from '@ui/components/EmptyStateCard'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import type { ConnectionProps } from '@ui/features/connect-wallet/ConnectWalletButton'
import { ErrorMessage } from '@ui/features/errors/ErrorMessage'
import { POOL_COLUMNS, PoolColumnId } from '@ui/features/pool-list/columns'
import { PoolExpandedPanel } from '@ui/features/pool-list/components/PoolExpandedPanel'
import { usePoolsVisibility } from '@ui/features/pool-list/hooks/usePoolsVisibility'
import { getPoolTableMeta, createPoolTableMeta } from '@ui/features/pool-list/table-meta'
import type {
  PoolRow,
  PoolTableMeta,
  ResidualClaimsTableData,
  UserPositionsTableData,
  UserPositionsTableVariant,
} from '@ui/features/pool-list/types'
import { CenteredEmptyState } from '@ui/features/tables/CenteredEmptyState'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { DataTable } from '@ui/features/tables/DataTable'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { TableHeader } from '@ui/features/tables/TableHeader'
import { TableVisibilitySettingsPopover } from '@ui/features/tables/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsTablet } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { borderStyle, directChildrenAfterFirst } from '@ui/lib/mui'

const { Spacing } = SizesAndSpaces

const LOCAL_STORAGE_KEY = 'dex-user-pool-positions'
const MAX_PAGE_SIZE = 10 as const

const TABS = { userPositions: t`Your positions`, residualClaims: t`Residual rewards` } satisfies Record<
  UserPositionsTableVariant,
  string
>
const MOBILE_COLUMNS = {
  userPositions: PoolColumnId.Deposits,
  residualClaims: PoolColumnId.Claimables,
} satisfies Record<UserPositionsTableVariant, PoolColumnId>

type UserPositionsTableProps = ConnectionProps &
  Pick<PoolTableMeta, 'addressDisplay' | 'crvToken'> & {
    userAddress: Address | undefined
    onVariantChange: (variant: UserPositionsTableVariant) => void
    Actions: ExpandedPanelComponent<PoolRow>
  } & (
    (UserPositionsTableData & { variant: 'userPositions' }) | (ResidualClaimsTableData & { variant: 'residualClaims' })
  )

const UserPositionsExpandedPanel: ExpandedPanelComponent<PoolRow> = ({ row, table }) => (
  <PoolExpandedPanel pool={row.original} meta={getPoolTableMeta(table)} />
)

export const UserPositionsTable = (props: UserPositionsTableProps) => {
  const {
    userAddress,
    isConnecting,
    isConnected,
    connect,
    variant,
    onVariantChange,
    tableQuery,
    claimablesTotalUsd,
    isFetching,
    onReload,
    alerts,
    labels: { errorTitle, loading, empty },
    addressDisplay,
    crvToken,
    Actions,
  } = props
  const connectionProps = { userAddress, isConnecting, isConnected, connect }
  const isTablet = useIsTablet()

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  const { columnSettings, columnVisibility, toggleVisibility } = usePoolsVisibility(LOCAL_STORAGE_KEY, {
    variant,
    mobileColumn: MOBILE_COLUMNS[variant],
  })

  const table = useCurveTable({
    columns: POOL_COLUMNS,
    query: tableQuery,
    meta: createPoolTableMeta({ getRowHref: ({ url }) => url, variant, alerts, addressDisplay, crvToken }),
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
            onVariantChange(value)
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
        {userAddress ? (
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
                {props.variant === 'userPositions' && (
                  <Metric
                    category="dex.poolListSummary"
                    label={t`Total liquidity provided`}
                    value={props.totalLiquidityUsd}
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
              <DataTable
                {...connectionProps}
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
                <ErrorMessage
                  userAddress={userAddress}
                  title={errorTitle}
                  subtitle={tableQuery.error.message}
                  error={tableQuery.error}
                  refreshData={onReload}
                />
              ) : (
                <EmptyStateCard {...connectionProps} {...(tableQuery.isLoading ? loading : empty)} />
              )}
            </CenteredEmptyState>
          )
        ) : (
          <CenteredEmptyState>
            <EmptyStateCard
              {...connectionProps}
              button={{ type: 'connect-wallet', label: t`Connect to view positions` }}
            />
          </CenteredEmptyState>
        )}
      </Stack>
    </Stack>
  )
}

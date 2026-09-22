import { useMemo } from 'react'
import { useMarketVaultEvents } from '@/llamalend/queries/market/market-vault-events.query'
import {
  ActivityTable,
  AddressCell,
  DEFAULT_PAGE_SIZE,
  getVaultEventChange,
  LlammaTokenAmount,
  TimestampCell,
  useManualPagination,
  VaultActivityExpandedPanel,
  type VaultActivityProps,
  type VaultActivityRow,
} from '@evm-ui/features/activity-table'
import { getPageCount } from '@evm-ui/utils'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import Typography from '@mui/material/Typography'
import { recordEntries } from '@primitives/objects.utils'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { mapQuery } from '@ui/features/queries/util'
import { createAppColumnHelper, useCurveTable } from '@ui/features/tables/data-table.utils'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'

const columnHelper = createAppColumnHelper<VaultActivityRow>()

const VAULT_ACTIVITY_ACTIONS = {
  deposit: { label: t`Deposit`, color: 'success' },
  withdrawal: { label: t`Withdrawal`, color: 'error' },
} as const

const VAULT_ACTIVITY_COLUMNS = columnHelper.columns([
  columnHelper.accessor('provider', {
    header: t`Address`,
    cell: ({ row }) => (
      <AddressCell
        address={row.original.provider}
        explorerUrl={scanAddressPath(row.original.chainId, row.original.provider)}
      />
    ),
  }),
  columnHelper.display({
    id: 'action',
    header: t`Action`,
    cell: ({ row }) => {
      const action = recordEntries(VAULT_ACTIVITY_ACTIONS).find(([type]) => row.original[type])?.[1]
      return (
        <InlineTableCell>
          {action && (
            <Typography variant="tableCellMBold" color={action.color}>
              {action.label}
            </Typography>
          )}
        </InlineTableCell>
      )
    },
  }),
  columnHelper.display({
    id: 'assets',
    header: t`Assets`,
    cell: ({ row: { original: event } }) => {
      const { amounts, sign } = getVaultEventChange(event)
      return (
        <InlineTableCell sx={{ alignItems: 'end' }}>
          {amounts && (
            <LlammaTokenAmount
              amount={sign * amounts.assets}
              blockchainId={event.blockchainId}
              token={event.borrowToken}
            />
          )}
        </InlineTableCell>
      )
    },
    meta: { type: 'numeric' },
  }),
  columnHelper.display({
    id: 'shares',
    header: t`Shares`,
    cell: ({ row: { original: event } }) => {
      const { amounts, sign } = getVaultEventChange(event)
      return (
        <InlineTableCell sx={{ alignItems: 'end' }}>
          {amounts && (
            <LlammaTokenAmount
              amount={sign * amounts.shares}
              blockchainId={event.blockchainId}
              token={event.vaultToken}
            />
          )}
        </InlineTableCell>
      )
    },
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('timestamp', {
    header: t`Time`,
    cell: ({ row }) => (
      <TimestampCell
        timestamp={new Date(row.original.timestamp)}
        txUrl={scanTxPath(row.original.chainId, row.original.txHash)}
        align="end"
      />
    ),
    meta: { type: 'numeric' },
  }),
])

export const VaultActivityEventsTable = ({ chainId, blockchainId, borrowToken, vaultToken }: VaultActivityProps) => {
  const isMobile = useIsMobile()
  const columnVisibility = useMemo(
    () => (isMobile ? { assets: false, shares: false, timestamp: false } : undefined),
    [isMobile],
  )
  const { pagination, onPaginationChange, apiPage: page } = useManualPagination()
  const eventsQuery = useMarketVaultEvents({
    blockchainId,
    contractAddress: vaultToken?.address,
    page,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const table = useCurveTable({
    query: mapQuery(eventsQuery, ({ events }) =>
      events.map(event => ({ ...event, chainId, blockchainId, borrowToken, vaultToken })),
    ),
    columns: VAULT_ACTIVITY_COLUMNS,
    state: { columnVisibility, pagination },
    manualPagination: true,
    pageCount: getPageCount(eventsQuery.data?.count, DEFAULT_PAGE_SIZE),
    onPaginationChange,
  })

  return (
    <ActivityTable
      table={table}
      emptyState={{ title: t`No activity data found.` }}
      errorState={{ title: t`Could not load activity data.` }}
      expandedPanel={{ Body: VaultActivityExpandedPanel }}
    />
  )
}

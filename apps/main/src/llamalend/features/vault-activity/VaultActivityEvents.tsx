import { useMemo } from 'react'
import { useMarketVaultEvents } from '@/llamalend/queries/market/market-vault-events.query'
import type { Chain } from '@curvefi/prices-api'
import type { VaultEvent } from '@curvefi/prices-api/llamalend'
import {
  ActivityTable,
  AddressCell,
  DEFAULT_PAGE_SIZE,
  LlammaTokenAmount,
  TimestampCell,
  useManualPagination,
} from '@evm-ui/features/activity-table'
import { getPageCount } from '@evm-ui/utils'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Token } from '@primitives/address.utils'
import { shortenString } from '@primitives/string.utils'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { combineQueries } from '@ui/features/queries/combine'
import { fakeLoadingQ } from '@ui/features/queries/util'
import { createAppColumnHelper, useCurveTable } from '@ui/features/tables/data-table.utils'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export type VaultActivityProps = {
  chainId: number
  blockchainId: Chain
  borrowToken: Token | undefined
  vaultToken: Token | undefined
}

type VaultActivityRow = VaultEvent & VaultActivityProps

const columnHelper = createAppColumnHelper<VaultActivityRow>()

const getChange = ({ deposit, withdrawal }: VaultEvent) => ({ amounts: deposit ?? withdrawal, sign: deposit ? 1 : -1 })

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
      const isDeposit = !!row.original.deposit
      return (
        <InlineTableCell>
          <Typography variant="tableCellMBold" color={isDeposit ? 'success' : 'error'}>
            {isDeposit ? t`Deposit` : t`Withdrawal`}
          </Typography>
        </InlineTableCell>
      )
    },
  }),
  columnHelper.display({
    id: 'change',
    header: t`Change`,
    cell: ({ row: { original: event } }) => {
      const { amounts, sign } = getChange(event)
      return (
        <InlineTableCell>
          <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
            {amounts && (
              <>
                <LlammaTokenAmount
                  amount={sign * amounts.assets}
                  blockchainId={event.blockchainId}
                  token={event.borrowToken}
                />
                <LlammaTokenAmount
                  amount={sign * amounts.shares}
                  blockchainId={event.blockchainId}
                  token={event.vaultToken}
                />
              </>
            )}
          </Stack>
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

const VaultActivityExpandedPanel: ExpandedPanelComponent<VaultActivityRow> = ({ row: { original: event } }) => {
  const { amounts, sign } = getChange(event)
  return (
    <Stack>
      {amounts && (
        <>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="bodyMRegular" color="textSecondary">{t`Amount`}</Typography>
            <LlammaTokenAmount
              amount={sign * amounts.assets}
              blockchainId={event.blockchainId}
              token={event.borrowToken}
            />
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="bodyMRegular" color="textSecondary">{t`Shares`}</Typography>
            <LlammaTokenAmount
              amount={sign * amounts.shares}
              blockchainId={event.blockchainId}
              token={event.vaultToken}
            />
          </Stack>
        </>
      )}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
        <Typography variant="tableCellMBold">{shortenString(event.provider)}</Typography>
      </Stack>
    </Stack>
  )
}

export const VaultActivityEvents = ({ chainId, blockchainId, borrowToken, vaultToken }: VaultActivityProps) => {
  const isMobile = useIsMobile()
  const columnVisibility = useMemo(() => (isMobile ? { change: false, timestamp: false } : undefined), [isMobile])
  const { pagination, onPaginationChange, apiPage: page } = useManualPagination()
  const eventsQuery = useMarketVaultEvents({
    blockchainId,
    contractAddress: vaultToken?.address,
    page,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const query = combineQueries([eventsQuery, fakeLoadingQ(vaultToken?.address && borrowToken?.address)], ({ events }) =>
    events.map(event => ({ ...event, chainId, blockchainId, borrowToken, vaultToken })),
  )
  const table = useCurveTable({
    query,
    columns: VAULT_ACTIVITY_COLUMNS,
    state: { columnVisibility, pagination },
    manualPagination: true,
    pageCount: getPageCount(eventsQuery.data?.count, DEFAULT_PAGE_SIZE),
    onPaginationChange,
  })

  return (
    <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
      <ActivityTable
        table={table}
        emptyState={{ title: t`No activity data found.` }}
        errorState={{ title: t`Could not load activity data.` }}
        expandedPanel={{ Body: VaultActivityExpandedPanel }}
      />
    </Stack>
  )
}

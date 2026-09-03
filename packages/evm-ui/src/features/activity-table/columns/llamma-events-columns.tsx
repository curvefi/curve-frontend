import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import { TimestampCell, AddressCell, LlammaEventActionCell, LlammaEventChangeCell } from '../cells'
import type { MarketEventRow } from '../types'

export enum LlammaEventsColumnId {
  Action = 'action',
  Change = 'change',
  User = 'provider',
  Time = 'timestamp',
}

const columnHelper = createAppColumnHelper<MarketEventRow>()

export const LLAMMA_EVENTS_COLUMNS = columnHelper.columns([
  columnHelper.accessor('provider', {
    id: LlammaEventsColumnId.User,
    header: t`Address`,
    cell: ({ row }) => (
      <AddressCell
        address={row.original.provider}
        explorerUrl={scanAddressPath(row.original.chainId, row.original.provider)}
      />
    ),
  }),
  columnHelper.display({
    id: LlammaEventsColumnId.Action,
    header: t`Action`,
    cell: ({ row }) => <LlammaEventActionCell event={row.original} />,
  }),
  columnHelper.display({
    id: LlammaEventsColumnId.Change,
    header: t`Change`,
    cell: ({ row }) => (
      <LlammaEventChangeCell
        event={row.original}
        chain={row.original.blockchainId}
        collateralToken={row.original.collateralToken}
        borrowToken={row.original.borrowToken}
      />
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('timestamp', {
    id: LlammaEventsColumnId.Time,
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

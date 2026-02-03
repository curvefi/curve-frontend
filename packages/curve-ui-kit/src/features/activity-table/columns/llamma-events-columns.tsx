import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { TimestampCell, AddressCell, LlammaEventActionCell, LlammaEventChangeCell } from '../cells'
import type { LlammaEventRow } from '../types'

export enum LlammaEventsColumnId {
  Action = 'action',
  Change = 'change',
  User = 'provider',
  Time = 'timestamp',
}

const columnHelper = createColumnHelper<LlammaEventRow>()

export const LLAMMA_EVENTS_COLUMNS = [
  columnHelper.accessor('provider', {
    id: LlammaEventsColumnId.User,
    header: t`Address`,
    cell: ({ getValue }) => <AddressCell address={getValue()} />,
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
        chain={row.original.network}
        collateralToken={row.original.collateralToken}
        borrowToken={row.original.borrowToken}
      />
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('timestamp', {
    id: LlammaEventsColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => <TimestampCell timestamp={row.original.timestamp} txUrl={row.original.txUrl} />,
    meta: { type: 'numeric' },
  }),
]

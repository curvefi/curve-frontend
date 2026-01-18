import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { TimestampCell, AddressCell } from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { EventActionCell } from '../cells/EventActionCell'
import { EventChangeCell } from '../cells/EventChangeCell'
import type { EventRow } from '../hooks/useLlammaActivity'
import { EventsColumnId } from './columns.enum'

const columnHelper = createColumnHelper<EventRow>()

export const createEventsColumns = (): ColumnDef<EventRow, unknown>[] => [
  columnHelper.display({
    id: EventsColumnId.Action,
    header: t`Action`,
    cell: ({ row }) => <EventActionCell event={row.original} />,
  }) as ColumnDef<EventRow, unknown>,
  columnHelper.display({
    id: EventsColumnId.Change,
    header: t`Change`,
    cell: ({ row }) => <EventChangeCell event={row.original} chain={row.original.network} collateralToken={row.original.collateralToken} borrowToken={row.original.borrowToken} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<EventRow, unknown>,
  columnHelper.accessor('provider', {
    id: EventsColumnId.User,
    header: t`User`,
    cell: ({ getValue }) => <AddressCell address={getValue()} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<EventRow, unknown>,
  columnHelper.accessor('timestamp', {
    id: EventsColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => <TimestampCell timestamp={row.original.timestamp} txUrl={row.original.url} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<EventRow, unknown>,
]

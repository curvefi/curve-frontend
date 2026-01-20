import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { TimestampCell, AddressCell, PoolLiquidityAmountsCell } from '../cells'
import { PoolLiquidityActionCell } from '../cells/PoolLiquidityActionCell'
import type { PoolLiquidityRow } from '../types'

export enum PoolLiquidityColumnId {
  Action = 'eventType',
  Amounts = 'tokenAmounts',
  User = 'provider',
  Time = 'time',
}

const columnHelper = createColumnHelper<PoolLiquidityRow>()

export const createPoolLiquidityColumns = (): ColumnDef<PoolLiquidityRow, unknown>[] => [
  columnHelper.display({
    id: PoolLiquidityColumnId.Action,
    header: t`Action`,
    cell: ({ row }) => <PoolLiquidityActionCell event={row.original} />,
  }) as ColumnDef<PoolLiquidityRow, unknown>,
  columnHelper.accessor('tokenAmounts', {
    id: PoolLiquidityColumnId.Amounts,
    header: t`Amounts`,
    cell: ({ row }) => <PoolLiquidityAmountsCell event={row.original} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<PoolLiquidityRow, unknown>,
  columnHelper.accessor('provider', {
    id: PoolLiquidityColumnId.User,
    header: t`Address`,
    cell: ({ getValue }) => <AddressCell address={getValue()} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<PoolLiquidityRow, unknown>,
  columnHelper.accessor('time', {
    id: PoolLiquidityColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => <TimestampCell timestamp={row.original.time} txUrl={row.original.url} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<PoolLiquidityRow, unknown>,
]

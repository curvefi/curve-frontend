import type { Address } from '@primitives/address.utils'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { AddressCell, TimestampCell } from '@ui-kit/shared/ui/DataTable/inline-cells'
import { AmountCell } from '../cells/AmountCell'
import { getTokenAmountColumnId, RecentRefuelsColumnId } from './columns.enum'

export type RecentRefuelsToken = {
  symbol: string
  address: Address
  decimals: number
}

export type RecentRefuelRow = TableItem & {
  timestamp: number
  donor?: Address | null
  lpSharesMinted?: number | null
  usdValue?: number | null
  tokenAmounts?: number[] | null
  txHash?: string | null
  txUrl?: string | null
}

const columnHelper = createColumnHelper<RecentRefuelRow>()

const headers = {
  [RecentRefuelsColumnId.Time]: t`Time`,
  [RecentRefuelsColumnId.Refueler]: t`Refueler`,
  [RecentRefuelsColumnId.LpShares]: t`LP shares`,
} as const

const getTokenAmountHeader = (token: RecentRefuelsToken) =>
  token.symbol ? `${token.symbol} ${t`amount`}` : t`Token amount`

export const createRecentRefuelsColumns = (tokens: RecentRefuelsToken[]) => [
  columnHelper.accessor('timestamp', {
    id: RecentRefuelsColumnId.Time,
    header: headers[RecentRefuelsColumnId.Time],
    cell: ({ getValue, row }) => <TimestampCell timestamp={new Date(getValue())} txUrl={row.original.txUrl} />,
    enableSorting: false,
  }),
  columnHelper.accessor('donor', {
    id: RecentRefuelsColumnId.Refueler,
    header: headers[RecentRefuelsColumnId.Refueler],
    cell: ({ getValue }) => <AddressCell address={getValue() ?? ''} />,
    enableSorting: false,
  }),
  columnHelper.accessor('lpSharesMinted', {
    id: RecentRefuelsColumnId.LpShares,
    header: headers[RecentRefuelsColumnId.LpShares],
    cell: ({ row }) => <AmountCell amount={row.original.lpSharesMinted} usdAmount={row.original.usdValue} />,
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  ...tokens.map((token, index) =>
    columnHelper.display({
      id: getTokenAmountColumnId(index),
      header: getTokenAmountHeader(token),
      cell: ({ row }) => <AmountCell amount={row.original.tokenAmounts?.[index]} usdAmount={undefined} />,
      enableSorting: false,
      meta: { type: 'numeric' },
    }),
  ),
]

import { TokenAmount } from '@/llamalend/widgets/TokenAmount'
import { UNAVAILABLE_NOTATION } from '@/llamalend/widgets/tooltips/tooltip.utils'
import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { AddressCell } from '@evm-ui/shared/ui/DataTable/inline-cells'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import type { ColumnVisibilityState } from '@tanstack/react-table'
import { Health, Percentage, type BorrowerRow, type SupplierRow } from './market-participants.utils'

enum BorrowerColumnId {
  Address = 'address',
  Collateral = 'collateral',
  Loan = 'debt',
  Health = 'health',
  Share = 'percentOfTotalDebt',
}

enum SupplierColumnId {
  Address = 'address',
  Supply = 'assets',
  Share = 'percentOfTotalShares',
}

const borrowerColumnHelper = createAppColumnHelper<BorrowerRow>()
const supplierColumnHelper = createAppColumnHelper<SupplierRow>()

export const BORROWER_COLUMNS = borrowerColumnHelper.columns([
  borrowerColumnHelper.accessor('address', {
    id: BorrowerColumnId.Address,
    header: t`Borrower`,
    cell: ({ row }) => <AddressCell address={row.original.address} explorerUrl={row.original.explorerUrl} />,
    enableSorting: false,
  }),
  borrowerColumnHelper.accessor('collateral', {
    id: BorrowerColumnId.Collateral,
    header: t`Collateral`,
    cell: ({ row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <TokenAmount
          amount={row.original.collateral}
          amountUsd={row.original.collateralUsd}
          blockchainId={row.original.network}
          tokenAddress={row.original.collateralToken?.address}
          abbreviate={false}
          iconSize="mui-sm"
        />
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  borrowerColumnHelper.accessor('debt', {
    id: BorrowerColumnId.Loan,
    header: t`Loan`,
    cell: ({ row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <TokenAmount
          amount={row.original.debt}
          amountUsd={row.original.debtUsd}
          blockchainId={row.original.network}
          tokenAddress={row.original.borrowToken?.address}
          abbreviate={false}
          iconSize="mui-sm"
        />
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  borrowerColumnHelper.accessor('health', {
    id: BorrowerColumnId.Health,
    header: t`Health`,
    cell: ({ row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <Health health={row.original.health} />
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  borrowerColumnHelper.accessor('percentOfTotalDebt', {
    id: BorrowerColumnId.Share,
    header: t`Borrow Share`,
    cell: ({ getValue }) => <Percentage value={getValue()} />,
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
])

export const getSupplierColumns = (borrowSymbol: string | undefined) =>
  supplierColumnHelper.columns([
    supplierColumnHelper.accessor('address', {
      id: SupplierColumnId.Address,
      header: t`Supplier`,
      cell: ({ row }) => <AddressCell address={row.original.address} explorerUrl={row.original.explorerUrl} />,
      enableSorting: false,
    }),
    supplierColumnHelper.accessor('assets', {
      id: SupplierColumnId.Supply,
      header: t`Supply (${borrowSymbol ?? UNAVAILABLE_NOTATION})`,
      cell: ({ row }) => (
        <InlineTableCell sx={{ alignItems: 'end' }}>
          <TokenAmount
            amount={row.original.assets}
            amountUsd={row.original.assetsUsd}
            blockchainId={row.original.network}
            tokenAddress={row.original.borrowToken?.address}
            abbreviate={false}
            iconSize="mui-sm"
          />
        </InlineTableCell>
      ),
      enableSorting: false,
      meta: { type: 'numeric' },
    }),
    supplierColumnHelper.accessor('percentOfTotalShares', {
      id: SupplierColumnId.Share,
      header: t`Supply Share`,
      cell: ({ getValue }) => <Percentage value={getValue()} />,
      enableSorting: false,
      meta: { type: 'numeric' },
    }),
  ])

export const mobileBorrowerVisibility: ColumnVisibilityState = {
  [BorrowerColumnId.Address]: true,
  [BorrowerColumnId.Collateral]: false,
  [BorrowerColumnId.Loan]: false,
  [BorrowerColumnId.Health]: false,
  [BorrowerColumnId.Share]: true,
}

export const mobileSupplierVisibility: ColumnVisibilityState = {
  [SupplierColumnId.Address]: true,
  [SupplierColumnId.Supply]: false,
  [SupplierColumnId.Share]: true,
}

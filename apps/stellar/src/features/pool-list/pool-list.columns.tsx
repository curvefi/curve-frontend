import { PoolTitleCell } from '@/stellar/features/pool-list/PoolTitleCell'
import type { Pool } from '@/stellar/features/pool-list/usePoolList'
import { formatNumber } from '@primitives/number.utils'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'

const columnHelper = createAppColumnHelper<Pool>()

export const POOL_LIST_COLUMNS = columnHelper.columns([
  columnHelper.accessor('address', {
    header: t`Pool`,
    cell: ({ row: { original } }) => <PoolTitleCell pool={original} />,
  }),
  columnHelper.accessor('tvl', {
    header: t`TVL`,
    cell: ({ row: { original } }) => formatNumber(original.tvl, 'usd.notional'),
  }),
])

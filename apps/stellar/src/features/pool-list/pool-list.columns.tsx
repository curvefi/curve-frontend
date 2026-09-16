import { shortenAddress } from '@/stellar/features/connect-wallet/address'
import { PoolTitleCell } from '@/stellar/features/pool-list/PoolTitleCell'
import Typography from '@mui/material/Typography'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import type { FactoryPoolData } from './useFactoryPoolData'

const columnHelper = createAppColumnHelper<FactoryPoolData>()

export const POOL_LIST_COLUMNS = columnHelper.columns([
  columnHelper.accessor('pool', {
    header: t`Pool`,
    cell: ({ row: { original } }) => <PoolTitleCell pool={original} />,
  }),
  columnHelper.accessor('factory', {
    header: t`Factory`,
    cell: ({ getValue }) => (
      <Typography title={getValue()} variant="inherit">
        {shortenAddress(getValue())}
      </Typography>
    ),
  }),
])

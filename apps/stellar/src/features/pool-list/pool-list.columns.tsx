import { shortenAddress } from '@/stellar/features/connect-wallet/address'
import { PoolTitleCell } from '@/stellar/features/pool-list/PoolTitleCell'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { FactoryPoolData } from './useFactoryPoolData'

const columnHelper = createAppColumnHelper<FactoryPoolData>()
const { Spacing } = SizesAndSpaces

export const POOL_LIST_COLUMNS = columnHelper.columns([
  columnHelper.accessor('pool', {
    header: t`Pool`,
    cell: ({ row: { original } }) => <PoolTitleCell pool={original} />,
    enableSorting: false,
  }),
  columnHelper.accessor('coins', {
    header: t`Tokens`,
    cell: ({ getValue }) => (
      <Stack
        direction="row"
        sx={{ flexWrap: 'wrap', columnGap: Spacing.sm, rowGap: Spacing.xs, paddingBlock: Spacing.xs }}
      >
        {getValue().map(coin => (
          <Typography key={coin} variant="inherit">
            {shortenAddress(coin)}
          </Typography>
        ))}
      </Stack>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('factory', {
    header: t`Factory`,
    cell: ({ getValue }) => <Typography variant="inherit">{shortenAddress(getValue())}</Typography>,
    enableSorting: false,
  }),
])

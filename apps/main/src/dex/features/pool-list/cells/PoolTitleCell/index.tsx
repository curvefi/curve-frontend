import { t } from '@evm-ui/lib/i18n'
import { TableRowTitle } from '@evm-ui/shared/ui/DataTable/TableRowTitle'
import { UserPositionIndicator } from '@evm-ui/shared/ui/DataTable/UserPositionIndicator'
import { TokenIcons } from '@evm-ui/shared/ui/TokenIcons'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import type { PoolRow } from '../../types'
import { PoolBadges } from './PoolBadges'

const { Spacing, Height } = SizesAndSpaces

export const PoolTitleCell = ({ row: { original: pool } }: CellContext<PoolRow, string>) => (
  <Stack direction="row" sx={{ height: Height.row }}>
    {pool.hasPosition && <UserPositionIndicator tooltipTitle={t`You have a balance in this pool`} />}
    <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
      <TokenIcons blockchainId={pool.network} tokens={pool.tradeableCoins} />
      <Stack direction="column" sx={{ justifyContent: 'center', gap: Spacing.xxs }}>
        <TableRowTitle id={pool.address} url={pool.url} title={pool.name} />
        <PoolBadges pool={pool} />
      </Stack>
    </Stack>
  </Stack>
)

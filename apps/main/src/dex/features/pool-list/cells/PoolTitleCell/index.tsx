import { memo } from 'react'
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
  <PoolListTitle pool={pool} />
)

// Memoization avoids repeating token icon and badge rendering for unchanged rows.
// eslint-disable-next-line local/no-single-line-named-functions
const PoolListTitle = memo(function PoolListTitle({ pool }: { pool: PoolRow }) {
  return (
    <Stack direction="row" sx={{ height: Height.row }}>
      {pool.hasPosition && <UserPositionIndicator tooltipTitle={t`You have a balance in this pool`} />}
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <TokenIcons blockchainId={pool.network} tokens={pool.tradeableCoins} />
        <Stack direction="column" sx={{ justifyContent: 'center', gap: Spacing.xxs }}>
          <TableRowTitle url={pool.url} address={pool.address} title={pool.name} addressLabel={t`pool`} />
          <PoolBadges pool={pool} />
        </Stack>
      </Stack>
    </Stack>
  )
})

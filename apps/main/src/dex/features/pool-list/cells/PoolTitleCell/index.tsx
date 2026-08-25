import { t } from '@evm-ui/lib/i18n'
import { TableRowTitle } from '@evm-ui/shared/ui/DataTable/TableRowTitle'
import { UserPositionIndicator } from '@evm-ui/shared/ui/DataTable/UserPositionIndicator'
import { TokenIcons } from '@evm-ui/shared/ui/TokenIcons'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import type { PoolRow } from '../../types'
import { PoolBadges } from './PoolBadges'
import { PoolTooltipContent } from './PoolTooltipContent'

const { Spacing, Height } = SizesAndSpaces

export const PoolTitleCell = ({ row: { original: pool } }: CellContext<PoolRow, string>) => (
  <Stack direction="row" sx={{ height: Height.row }}>
    {pool.hasPosition && <UserPositionIndicator tooltipTitle={t`You have a balance in this pool`} />}
    <Tooltip clickable title={pool.name} body={<PoolTooltipContent pool={pool} />} placement="top">
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <TokenIcons blockchainId={pool.network} tokens={pool.tradeableCoins} showTooltips={false} />
        <Stack direction="column" sx={{ justifyContent: 'center', gap: Spacing.xxs }}>
          <TableRowTitle url={pool.url} title={pool.name} testId={pool.address} />
          <PoolBadges pool={pool} />
        </Stack>
      </Stack>
    </Tooltip>
  </Stack>
)

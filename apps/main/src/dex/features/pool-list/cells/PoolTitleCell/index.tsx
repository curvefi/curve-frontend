import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { TableRowTitle } from '@evm-ui/shared/ui/DataTable/TableRowTitle'
import { UserPositionIndicator } from '@evm-ui/shared/ui/DataTable/UserPositionIndicator'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { TokenIcons } from '@ui/components/TokenIcons'
import { Tooltip } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { PoolRow } from '../../types'
import { PoolBadges } from './PoolBadges'
import { PoolTooltipContent } from './PoolTooltipContent'

const { Spacing, Height } = SizesAndSpaces

export const PoolTitleCell = ({ row: { original: pool } }: CellContext<CurveTableFeatures, PoolRow, string>) => (
  <Stack direction="row" sx={{ height: Height.row }}>
    {pool.hasPosition && <UserPositionIndicator tooltipTitle={t`You have a balance in this pool`} />}
    <Tooltip clickable title={pool.name} body={<PoolTooltipContent pool={pool} />} placement="top">
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <TokenIcons blockchainId={pool.blockchainId} tokens={pool.tradeableCoins} showTooltips={false} />
        <Stack direction="column" sx={{ justifyContent: 'center', gap: Spacing.xxs }}>
          <TableRowTitle url={pool.url} title={pool.name} testId={pool.address} />
          <PoolBadges pool={pool} />
        </Stack>
      </Stack>
    </Tooltip>
  </Stack>
)

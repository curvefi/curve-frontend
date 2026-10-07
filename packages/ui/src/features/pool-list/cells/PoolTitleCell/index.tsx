import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { TokenIcons } from '@ui/components/TokenIcons'
import { Tooltip } from '@ui/components/Tooltip'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { TableRowTitle } from '@ui/features/tables/TableRowTitle'
import { UserPositionIndicator } from '@ui/features/tables/UserPositionIndicator'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getPoolTableMeta } from '../../table-meta'
import type { PoolRow } from '../../types'
import { PoolBadges } from './PoolBadges'
import { PoolTooltipContent } from './PoolTooltipContent'

const { Spacing, Height } = SizesAndSpaces

export const PoolTitleCell = ({ row: { original: pool }, table }: CellContext<CurveTableFeatures, PoolRow, string>) => (
  <Stack direction="row" sx={{ height: Height.row }}>
    {getPoolTableMeta(table).variant !== 'userPositions' && pool.userPosition && +pool.userPosition.lpBalance > 0 && (
      <UserPositionIndicator tooltipTitle={t`You have a balance in this pool`} />
    )}
    <Tooltip
      clickable
      title={pool.name}
      body={<PoolTooltipContent pool={pool} addressDisplay={getPoolTableMeta(table).addressDisplay} />}
      placement="top"
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <TokenIcons blockchainId={pool.blockchainId} tokens={pool.tradeableCoins} showTooltips={false} />
        <Stack direction="column" sx={{ justifyContent: 'center', gap: Spacing.xxs }}>
          <TableRowTitle url={pool.url} title={pool.name} testId={pool.address} />
          <PoolBadges pool={pool} alerts={getPoolTableMeta(table).alerts} />
        </Stack>
      </Stack>
    </Tooltip>
  </Stack>
)

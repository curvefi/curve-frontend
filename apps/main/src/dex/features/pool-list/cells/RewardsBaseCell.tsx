import ChipVolatileBaseApy from '@/dex/components/PagePoolList/components/ChipVolatileBaseApy'
import TooltipBaseApy from '@/dex/components/PagePoolList/components/TooltipBaseApy'
import { LARGE_APY } from '@/dex/constants'
import type { RewardBase } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { PoolListItem } from '../types'

export const RewardsBaseCell = ({ table, row, getValue, column }: CellContext<PoolListItem, RewardBase>) => {
  const { original: poolData } = row
  const base = getValue()
  const failedFetching24hOldVprice =
    poolData && 'failedFetching24hOldVprice' in poolData && poolData.failedFetching24hOldVprice
  const isHighlight = isSortedBy(table, column)
  return failedFetching24hOldVprice ? (
    <span>
      -<IconTooltip>Not available currently</IconTooltip>
    </span>
  ) : (
    base &&
      (+base.day > LARGE_APY ? (
        <ChipVolatileBaseApy isBold={isHighlight} />
      ) : (
        <Chip
          isBold={isHighlight}
          size="md"
          tooltip={base ? <TooltipBaseApy poolData={poolData} baseApy={base} /> : null}
          tooltipProps={{
            placement: 'bottom-end',
            textAlign: 'left',
            ...(base && Number(base.day) < 0 ? { minWidth: '200px' } : {}),
          }}
        >
          {formatNumber(base.day, FORMAT_OPTIONS.PERCENT)}
        </Chip>
      ))
  )
}

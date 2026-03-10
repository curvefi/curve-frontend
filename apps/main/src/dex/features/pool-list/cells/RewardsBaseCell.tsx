import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { TooltipBaseApy } from '@/dex/components/TooltipBaseApy'
import { LARGE_APY } from '@/dex/constants'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatPercent } from '@ui-kit/utils'
import type { PoolListItem } from '../types'

export const RewardsBaseCell = ({ table, row, getValue, column }: CellContext<PoolListItem, number | null>) => {
  const { original: poolData } = row
  const { failedFetching24hOldVprice: failed, rewards } = poolData

  const isHighlight = isSortedBy(table, column.id)
  const day = getValue()
  return failed ? (
    <span>
      -<IconTooltip>Not available currently</IconTooltip>
    </span>
  ) : (
    day != null &&
      (day > LARGE_APY ? (
        <ChipVolatileBaseApy isBold={isHighlight} />
      ) : (
        <Tooltip title={rewards?.base && <TooltipBaseApy poolData={poolData} baseApy={rewards.base} />}>
          <Stack>{formatPercent(day)}</Stack>
        </Tooltip>
      ))
  )
}

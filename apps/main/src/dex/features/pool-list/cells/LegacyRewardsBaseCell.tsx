import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { LegacyTooltipBaseApy } from '@/dex/components/LegacyTooltipBaseApy'
import { LARGE_APY } from '@/dex/constants'
import { TooltipIcon as IconTooltip } from '@legacy-ui/Tooltip/TooltipIcon'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { isSortedBy } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { formatNumber } from '@evm-ui/utils'
import type { LegacyPoolRow } from '../types'

export const LegacyRewardsBaseCell = ({ table, row, getValue, column }: CellContext<LegacyPoolRow, number | null>) => {
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
        <Tooltip title={rewards?.base && <LegacyTooltipBaseApy poolData={poolData} baseApy={rewards.base} />}>
          <Stack>{formatNumber(day, 'percent.rate')}</Stack>
        </Tooltip>
      ))
  )
}

import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { LegacyTooltipBaseApy } from '@/dex/components/LegacyTooltipBaseApy'
import { LARGE_APY } from '@/dex/constants'
import { isSortedBy, type CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@evm-ui/utils'
import { TooltipIcon as IconTooltip } from '@legacy-ui/Tooltip/TooltipIcon'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import type { LegacyPoolRow } from '../types'

export const LegacyRewardsBaseCell = ({
  table,
  row,
  getValue,
  column,
}: CellContext<CurveTableFeatures, LegacyPoolRow, number | null>) => {
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

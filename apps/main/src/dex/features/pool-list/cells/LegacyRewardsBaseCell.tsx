import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { LegacyTooltipBaseApy } from '@/dex/components/LegacyTooltipBaseApy'
import { LARGE_RATE } from '@/dex/constants'
import { isSortedBy, type CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
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
  const { rewards } = poolData

  const isHighlight = isSortedBy(table, column.id)
  const day = getValue()
  return (
    day != null &&
    (day > LARGE_RATE ? (
      <ChipVolatileBaseApy isBold={isHighlight} />
    ) : (
      <Tooltip title={rewards?.base && <LegacyTooltipBaseApy poolData={poolData} baseApy={rewards.base} />}>
        <Stack>{formatNumber(day, 'percent.rate')}</Stack>
      </Tooltip>
    ))
  )
}

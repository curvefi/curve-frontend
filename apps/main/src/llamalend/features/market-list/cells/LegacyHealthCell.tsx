import { getPositionStatusContent } from '@/llamalend/position-status-content'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { Stack } from '@mui/material'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipDescription } from '@ui/components/TooltipComponents'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { LegacyHealthBar } from '../../market-position-details/health/LegacyHealthBar'

const { Spacing } = SizesAndSpaces

export const LegacyHealthCell = ({
  getValue,
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { assets } = row.original
  const { legacyStatus } = row.original.positionQueries.stats.data ?? {}
  const legacyHealth = getValue()
  const content = legacyStatus
    ? getPositionStatusContent(assets.collateral.symbol, assets.borrowed.symbol)[legacyStatus]
    : null

  return maybe(legacyHealth, legacyHealth => (
    <Tooltip
      title={content?.title ?? t`Position active`}
      body={<TooltipDescription text={content?.description ?? t`You have an active position in this market.`} />}
      placement="top"
    >
      <Stack sx={{ gap: Spacing.xs }}>
        {formatNumber(legacyHealth, 'percent.value')}
        <LegacyHealthBar small health={legacyHealth} softLiquidation={legacyStatus === 'softLiquidation'} />
      </Stack>
    </Tooltip>
  ))
}

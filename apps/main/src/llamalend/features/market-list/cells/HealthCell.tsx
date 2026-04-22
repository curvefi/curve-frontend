import { HealthBar } from '@/llamalend/features/market-position-details'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Stack } from '@mui/material'
import { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { LlamaMarketColumnId } from '../columns'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const HealthCell = ({ row }: CellContext<LlamaMarket, number>) => {
  const { assets } = row.original
  const { data, error } = useUserMarketStats(row.original, LlamaMarketColumnId.UserHealth)
  const { health, status } = data ?? {}
  const softLiquidation = status === 'softLiquidation'
  const content = status ? getPositionStatusContent(assets.collateral.symbol, assets.borrowed.symbol)[status] : null
  return health == null ? (
    error && <ErrorCell error={error} />
  ) : (
    <Tooltip
      title={content?.title ?? t`Position active`}
      body={<TooltipDescription text={content?.description ?? t`You have an active position in this market.`} />}
      placement="top"
    >
      <Stack gap={Spacing.xs}>
        {formatNumber(health, { unit: 'percentage', abbreviate: false })}
        <HealthBar small health={health} softLiquidation={softLiquidation} />
      </Stack>
    </Tooltip>
  )
}

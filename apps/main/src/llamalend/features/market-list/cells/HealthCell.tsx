import { HealthBar } from '@/llamalend/features/market-position-details'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { Stack } from '@mui/material'
import { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { MarketColumnId } from '../columns'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const HealthCell = ({ row }: CellContext<LlamaMarket, number>) => {
  const { assets } = row.original
  const { data, error } = useUserMarketStats(row.original, MarketColumnId.UserHealth)
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
      <Stack sx={{ gap: Spacing.xs }}>
        {formatNumber(health, 'percent.value')}
        <HealthBar small health={health} softLiquidation={softLiquidation} />
      </Stack>
    </Tooltip>
  )
}

import { HealthBar } from '@/llamalend/features/market-position-details'
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
  const { data, error } = useUserMarketStats(row.original, LlamaMarketColumnId.UserHealth)
  const { health, softLiquidation } = data ?? {}
  return health == null ? (
    error && <ErrorCell error={error} />
  ) : (
    <Tooltip
      title={softLiquidation ? 'Liquidation Protection On' : 'Position active'}
      body={<HealthTooltipContent softLiquidation={!!softLiquidation} />}
      placement="top"
    >
      <Stack gap={Spacing.xs}>
        {formatNumber(health, { unit: 'percentage', abbreviate: false })}
        <HealthBar small health={health} softLiquidation={softLiquidation} />
      </Stack>
    </Tooltip>
  )
}

const HealthTooltipContent = ({ softLiquidation }: { softLiquidation: boolean }) => (
  <>
    {softLiquidation ? (
      <>
        <TooltipDescription text={t`Liquidation protection enabled.`} />
        <TooltipDescription
          text={[
            t`This position is protected against full liquidation.`,
            t`Soft-liquidation still applies, and collateral may still be partially converted within the liquidation band.`,
          ].join(' ')}
        />
      </>
    ) : (
      <TooltipDescription text={t`You have an active position in this market.`} />
    )}
  </>
)

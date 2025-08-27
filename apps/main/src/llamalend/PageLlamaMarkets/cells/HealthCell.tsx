import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import { Stack } from '@mui/material'
import { CellContext } from '@tanstack/react-table'
import { HealthBar } from '@ui-kit/features/market-position-details'
import { t } from '@ui-kit/lib/i18n.ts'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents.tsx'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces.ts'
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
      body={<HealthTooltipContent softLiquidation={softLiquidation} />}
      placement="top"
    >
      <Stack gap={Spacing.xs}>
        {health.toFixed(2)}
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

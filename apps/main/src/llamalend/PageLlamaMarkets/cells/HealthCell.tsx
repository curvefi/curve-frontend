import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { HealthBar } from '@ui-kit/features/market-position-details'
import { t } from '@ui-kit/lib/i18n.ts'
import { Tooltip, TooltipContent } from '@ui-kit/shared/ui/Tooltip'
import { ErrorCell } from './ErrorCell'

export const HealthCell = ({ row }: CellContext<LlamaMarket, number>) => {
  const { data, error } = useUserMarketStats(row.original, LlamaMarketColumnId.UserHealth)
  const { health, softLiquidation } = data ?? {}
  return health == null ? (
    error && <ErrorCell error={error} />
  ) : (
    <Tooltip title={<HealthTooltip softLiquidation={softLiquidation} />} placement="top">
      <HealthBar small health={health} />
    </Tooltip>
  )
}

const HealthTooltip = ({ softLiquidation }: { softLiquidation: boolean }) => (
  <TooltipContent title={softLiquidation ? 'Position active' : 'Liquidation Protection On'}>
    {softLiquidation ? (
      <Typography>t`You have an active position in this market.`</Typography>
    ) : (
      <Stack>
        <Typography>{t`Liquidation protection enabled.`}</Typography>
        <Typography>
          {t`This position is protected against full liquidation.`}
          {t`Soft-liquidation still applies, and collateral may still be partially converted within the liquidation band.`}
        </Typography>
      </Stack>
    )}
  </TooltipContent>
)

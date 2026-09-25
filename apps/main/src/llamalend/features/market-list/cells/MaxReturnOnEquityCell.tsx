import { MARKET_TITLES } from '@/llamalend/features/market-list/columns/column.titles'
import { MarketColumnId } from '@/llamalend/features/market-list/columns/columns.enum'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { maxRoeAtMaxLeverageApr } from '@/llamalend/rates.utils'
import { MaxReturnOnEquityTooltipContent } from '@/llamalend/widgets/tooltips'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'

export const MaxReturnOnEquityCell = ({
  getValue,
  row: { original: market },
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const beta = useNewLlamalendHealth()
  const apr = beta ? maxRoeAtMaxLeverageApr(market) : undefined
  const text = beta
    ? apr?.status === 'value'
      ? formatNumber(apr.aprPercent, 'percent.rate')
      : apr?.status === 'not-applicable'
        ? t`Not applicable`
        : t`Unavailable`
    : formatNumber(getValue(), 'percent.rate')
  return (
    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
      <Tooltip
        title={beta ? t`ROE at max leverage` : MARKET_TITLES[MarketColumnId.MaxReturnOnEquity]}
        body={<MaxReturnOnEquityTooltipContent market={market} />}
        clickable
        mobileDrawer
      >
        <Typography variant="tableCellMBold">{text}</Typography>
      </Tooltip>
    </Box>
  )
}

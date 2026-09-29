import { MARKET_TITLES } from '@/llamalend/features/market-list/columns/column.titles'
import { MarketColumnId } from '@/llamalend/features/market-list/columns/columns.enum'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { maxRoeAtMaxLeverageApr, type MaxRoeApr } from '@/llamalend/rates.utils'
import { MaxReturnOnEquityTooltipContent } from '@/llamalend/widgets/tooltips'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'

const maxRoeText = (apr: MaxRoeApr | undefined, legacy: number | undefined) => {
  if (apr == null) return formatNumber(legacy, 'percent.rate')
  if (apr.status === 'value') return formatNumber(apr.aprPercent, 'percent.rate')
  if (apr.status === 'not-applicable') return t`Not applicable`
  return t`Unavailable`
}

export const MaxReturnOnEquityCell = ({
  getValue,
  row: { original: market },
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const beta = useNewLlamalendHealth()
  return (
    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
      <Tooltip
        title={MARKET_TITLES[MarketColumnId.MaxReturnOnEquity]}
        body={<MaxReturnOnEquityTooltipContent market={market} />}
        clickable
        mobileDrawer
      >
        <Typography variant="tableCellMBold">
          {maxRoeText(beta ? maxRoeAtMaxLeverageApr(market) : undefined, getValue())}
        </Typography>
      </Tooltip>
    </Box>
  )
}

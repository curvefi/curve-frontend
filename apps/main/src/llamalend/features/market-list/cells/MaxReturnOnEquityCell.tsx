import { MARKET_TITLES } from '@/llamalend/features/market-list/columns/column.titles'
import { MarketColumnId } from '@/llamalend/features/market-list/columns/columns.enum'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { MaxReturnOnEquityTooltipContent } from '@/llamalend/widgets/tooltips'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { CurveTableFeatures } from '@ui/features/tables/data-table.utils'

export const MaxReturnOnEquityCell = ({
  getValue,
  row: { original: market },
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => (
  <Box sx={{ display: 'flex', justifyContent: 'end' }}>
    <Tooltip
      title={MARKET_TITLES[MarketColumnId.MaxReturnOnEquity]}
      body={<MaxReturnOnEquityTooltipContent market={market} />}
      clickable
      mobileDrawer
    >
      <Typography variant="tableCellMBold">{formatNumber(getValue(), 'percent.rate')}</Typography>
    </Tooltip>
  </Box>
)

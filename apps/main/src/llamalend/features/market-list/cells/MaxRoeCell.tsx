import { MARKET_TITLES } from '@/llamalend/features/market-list/columns/column.titles'
import { MarketColumnId } from '@/llamalend/features/market-list/columns/columns.enum'
import { getMaxRoE } from '@/llamalend/llama.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip, type TooltipProps } from '@ui/components/Tooltip'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const MaxRoeTooltipContent = ({ market }: { market?: LlamaMarket }) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`The Maximum Return on Equity is an estimated annualized return on your own capital at maximum leverage, after borrowing costs.`}
    />
    <TooltipDescription text={t`Max RoE = M × C − (M − 1) × B`} />
    <TooltipItems secondary>
      <TooltipItem title={t`Max multiplier (M)`}>
        {market && formatNumber(market.leverage, { unit: 'multiplier', abbreviate: false, fallback: '-' })}
      </TooltipItem>
      <TooltipItem title={t`Collateral APY (C)`}>
        {market && formatNumber(market.assets.collateral.rebasingYield, 'percent.rate')}
      </TooltipItem>
      <TooltipItem title={t`Borrow APY (B)`}>
        {market && formatNumber(market.rates.borrowApy, 'percent.rate')}
      </TooltipItem>
    </TooltipItems>
  </TooltipWrapper>
)

export const MaxRoeCell = ({
  getValue,
  row: { original: market },
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => (
  <Box sx={{ display: 'flex', justifyContent: 'end' }}>
    <Tooltip
      title={MARKET_TITLES[MarketColumnId.MaxRoe]}
      body={<MaxRoeTooltipContent market={market} />}
      clickable
      mobileDrawer
    >
      <Typography variant="tableCellMBold">{formatNumber(getValue(), 'percent.rate')}</Typography>
    </Tooltip>
  </Box>
)

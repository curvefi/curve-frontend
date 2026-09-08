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
import { getMaxRoe } from '../max-roe.utils'

export const MaxRoeTooltipContent = ({ market }: { market?: LlamaMarket }) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Estimated annualized return on your own capital at maximum leverage, after borrowing costs.`}
    />
    {market && (
      <TooltipItems secondary>
        <TooltipItem title={t`Max LTV`}>{formatNumber(market.maxLtv, 'percent.value')}</TooltipItem>
        <TooltipItem title={t`Max multiplier (M)`}>
          {formatNumber(market.leverage, { unit: 'multiplier', abbreviate: false, fallback: '-' })}
        </TooltipItem>
        <TooltipItem title={t`Collateral APY (S)`}>
          {formatNumber(market.assets.collateral.rebasingYield, 'percent.rate')}
        </TooltipItem>
        <TooltipItem title={t`Borrow APY (B)`}>{formatNumber(market.rates.borrowApy, 'percent.rate')}</TooltipItem>
      </TooltipItems>
    )}
    <TooltipDescription text={t`Max ROE = M × S − (M − 1) × B`} />
    {!market && <TooltipDescription text={t`M is the maximum multiplier, S is collateral APY and B is borrow APY.`} />}
    {market && (
      <TooltipItems>
        <TooltipItem variant="primary" title={t`Max ROE`}>
          {formatNumber(getMaxRoe(market), 'percent.rate')}
        </TooltipItem>
      </TooltipItems>
    )}
    <TooltipDescription
      text={t`Rates can change. Excludes price changes, fees, slippage, liquidation losses and incentives. “Max” refers to the multiplier, not the best return. A dash means an input is unavailable.`}
    />
  </TooltipWrapper>
)

export const MaxRoeTooltip = ({ market, children }: { market: LlamaMarket; children: TooltipProps['children'] }) => (
  <Tooltip
    title={t`Max ROE`}
    body={<MaxRoeTooltipContent market={market} />}
    placement="top"
    clickable
    mobileDrawer
    slotProps={{
      popper: { modifiers: [{ name: 'preventOverflow', options: { altAxis: true, padding: 8 } }] },
      tooltip: { sx: { maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto' } },
    }}
  >
    {children}
  </Tooltip>
)

export const MaxRoeCell = ({
  getValue,
  row: { original: market },
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => (
  <Box sx={{ display: 'flex', justifyContent: 'end' }}>
    <MaxRoeTooltip market={market}>
      <Typography variant="tableCellMBold" color="textPrimary">
        {formatNumber(getValue(), 'percent.rate')}
      </Typography>
    </MaxRoeTooltip>
  </Box>
)

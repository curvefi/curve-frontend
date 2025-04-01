import { ErrorCell } from '@/loan/components/PageLlamaMarkets/cells/ErrorCell'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { useUserMarketStats } from '@/loan/entities/llama-market-stats'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

export const PriceCell = ({ getValue, row, column }: CellContext<LlamaMarket, number>) => {
  const { data: stats, error: statsError } = useUserMarketStats(row.original, column.id as LlamaMarketColumnId)
  const value =
    {
      [LlamaMarketColumnId.UserBorrowed]: stats?.borrowed,
      [LlamaMarketColumnId.UserEarnings]: stats?.earnings,
      [LlamaMarketColumnId.UserDeposited]: stats?.deposited,
    }[column.id] ?? getValue()
  if (!value) {
    return statsError && <ErrorCell error={statsError} />
  }
  const { usdPrice, chain, address, symbol } =
    row.original.assets[column.id === LlamaMarketColumnId.UserBorrowed ? 'borrowed' : 'collateral']
  const usdValue = usdPrice != null && formatNumber(value * usdPrice, { currency: 'USD', notation: 'compact' })
  const usdTooltip =
    usdPrice != null && formatNumber(value * usdPrice, { currency: 'USD', showAllFractionDigits: true })
  return (
    <Stack direction="column" spacing={1} alignItems="end">
      <Tooltip title={`${formatNumber(value, { showAllFractionDigits: true })} ${symbol}`}>
        <Stack direction="row" spacing={1} alignItems="center" whiteSpace="nowrap">
          <Typography variant="tableCellMBold">{formatNumber(value, { notation: 'compact' })}</Typography>
          <TokenIcon blockchainId={chain} address={address} tooltip={symbol} size="mui-md" />
        </Stack>
      </Tooltip>
      <Tooltip title={usdTooltip}>
        <Typography variant="bodySRegular" color="text.secondary">
          {usdValue}
        </Typography>
      </Tooltip>
    </Stack>
  )
}

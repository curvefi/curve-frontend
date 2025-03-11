import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { useUserMarketStats } from '@/loan/entities/llama-market-stats'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'

export const PriceCell = ({ getValue, row, column }: CellContext<LlamaMarket, number>) => {
  const { data: stats, error: statsError } = useUserMarketStats(row.original, column.id as LlamaMarketColumnId)
  const value =
    {
      [LlamaMarketColumnId.UserBorrowed]: stats?.borrowed,
      [LlamaMarketColumnId.UserEarnings]: stats?.earnings,
      [LlamaMarketColumnId.UserDeposited]: stats?.deposited,
    }[column.id] ?? getValue()
  if (!value) {
    if (statsError) {
      return (
        <Tooltip title={statsError.toString()}>
          <Box>?</Box>
        </Tooltip>
      )
    }
    return '-'
  }
  const { assets, type } = row.original
  const { usdPrice, chain, address, symbol } = { Lend: assets.collateral, Mint: assets.borrowed }[type]
  const usdValue = usdPrice ? formatNumber(value * usdPrice, { currency: 'USD', notation: 'compact' }) : '-'
  const usdTooltip = usdPrice ? formatNumber(value * usdPrice, { currency: 'USD', showAllFractionDigits: true }) : '-'
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

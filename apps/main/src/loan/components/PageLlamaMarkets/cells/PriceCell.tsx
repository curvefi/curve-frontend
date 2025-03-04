import { LlamaMarket } from '@/loan/entities/llama-markets'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'

export const PriceCell = ({ getValue, row }: CellContext<LlamaMarket, number>) => {
  const value = getValue()
  if (!value) {
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
          <TokenIcon blockchainId={chain} address={address} symbol={symbol} size="mui-md" />
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

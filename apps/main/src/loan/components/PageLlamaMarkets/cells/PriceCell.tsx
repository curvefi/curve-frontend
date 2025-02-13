import { LlamaMarket } from '@/loan/entities/llama-markets'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber, getImageBaseUrl } from '@ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TokenIcon from '@/loan/components/TokenIcon'
import Tooltip from '@mui/material/Tooltip'

export const PriceCell = ({ getValue, row }: CellContext<LlamaMarket, number>) => {
  const value = getValue()
  if (!value) {
    return '-'
  }
  const { usdPrice, chain, address, symbol } = row.original.assets.borrowed
  const usdValue = usdPrice ? formatNumber(value / usdPrice, { currency: 'USD', notation: 'compact' }) : '-'
  const usdTooltip = usdPrice ? formatNumber(value / usdPrice, { currency: 'USD' }) : '-'
  return (
    <Stack direction="column" spacing={1} alignItems="end">
      <Tooltip title={`${formatNumber(value, { showAllFractionDigits: true })} ${symbol}`}>
        <Stack direction="row" spacing={1} alignItems="center" whiteSpace="nowrap">
          <Typography variant="tableCellMBold">{formatNumber(value, { notation: 'compact' })}</Typography>
          <TokenIcon imageBaseUrl={getImageBaseUrl(chain)} address={address} token={symbol} size="mui-md" />
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

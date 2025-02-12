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
  const usdValue =
    usdPrice && !isNaN(usdPrice) ? formatNumber(value / usdPrice, { currency: 'USD', notation: 'compact' }) : '-'
  const usdTooltip = usdPrice && !isNaN(usdPrice) ? formatNumber(value / usdPrice, { currency: 'USD' }) : '-'
  const valueStr = formatNumber(value, { notation: 'compact' })
  const valueTooltip = formatNumber(value, { currency: symbol })
  return (
    <Stack direction="column" spacing={1} alignItems="end">
      <Tooltip title={valueTooltip}>
        <Stack direction="row" spacing={1} alignItems="center" whiteSpace="nowrap">
          <Typography variant="tableCellMBold">{valueStr}</Typography>
          <TokenIcon imageBaseUrl={getImageBaseUrl(chain)} address={address} token={symbol} />
        </Stack>
      </Tooltip>
      <Tooltip title={usdTooltip}>
        <Typography variant="bodySRegular">{usdValue}</Typography>
      </Tooltip>
    </Stack>
  )
}

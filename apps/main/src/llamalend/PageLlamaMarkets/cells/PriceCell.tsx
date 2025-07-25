import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { ErrorCell } from '@/llamalend/PageLlamaMarkets/cells/ErrorCell'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

export const PriceCell = ({ getValue, row, column }: CellContext<LlamaMarket, number>) => {
  const market = row.original
  const { assets } = market
  const columnId = column.id as LlamaMarketColumnId
  const { data: stats, error: statsError } = useUserMarketStats(market, columnId)
  const { borrowed, earnings: earningsData } = stats ?? {}
  const value =
    {
      [LlamaMarketColumnId.UserBorrowed]: borrowed,
      [LlamaMarketColumnId.UserEarnings]: earningsData?.earnings, // todo: handle other claimable rewards
      [LlamaMarketColumnId.UserDeposited]: earningsData?.totalCurrentAssets,
    }[column.id] ?? getValue()
  if (!value) {
    return statsError && <ErrorCell error={statsError} />
  }
  const { usdPrice, chain, address, symbol } = assets.borrowed // todo: earnings are usually crv

  const usdValue = usdPrice != null && formatNumber(value * usdPrice, { currency: 'USD', notation: 'compact' })
  const usdTooltip =
    usdPrice != null && formatNumber(value * usdPrice, { currency: 'USD', showAllFractionDigits: true })
  return (
    <Stack direction="column" spacing={1} alignItems="end">
      <Tooltip title={`${formatNumber(value)} ${symbol}`}>
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

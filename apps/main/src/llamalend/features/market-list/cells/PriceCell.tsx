import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useTokenUsdPrice } from '@/llamalend/entities/usd-prices'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { LlamaMarketColumnId } from '../columns.enum'
import { ErrorCell } from './ErrorCell'

export const PriceCell = ({ getValue, row, column }: CellContext<LlamaMarket, number>) => {
  const market = row.original
  const { assets } = market
  const columnId = column.id as LlamaMarketColumnId

  const assetInfo = columnId === LlamaMarketColumnId.UserCollateral ? assets.collateral : assets.borrowed
  const { chain, address, symbol } = assetInfo // todo: earnings are usually crv
  const { data: stats, error: statsError, isLoading } = useUserMarketStats(market, columnId)
  const { data: usdPrice, isLoading: isUsdRateLoading } = useTokenUsdPrice({
    blockchainId: chain,
    contractAddress: address,
  })
  const { borrowed, earnings: earningsData } = stats ?? {}
  const value =
    {
      [LlamaMarketColumnId.UserBorrowed]: borrowed,
      [LlamaMarketColumnId.UserCollateral]: stats?.collateral?.amount,
      [LlamaMarketColumnId.UserEarnings]: earningsData?.earnings, // todo: handle other claimable rewards
      [LlamaMarketColumnId.UserDeposited]: earningsData?.totalCurrentAssets,
    }[column.id] ?? getValue()
  if (!value) {
    return statsError && <ErrorCell error={statsError} />
  }

  const shouldUseCustomTooltip =
    columnId === LlamaMarketColumnId.UserBorrowed || columnId === LlamaMarketColumnId.UserCollateral
  const tooltipTitle = shouldUseCustomTooltip
    ? {
        [LlamaMarketColumnId.UserBorrowed]: t`Borrowed`,
        [LlamaMarketColumnId.UserCollateral]: t`Collateral`,
      }[columnId]
    : `${formatNumber(value, { decimals: 5 })} ${symbol}`

  const tooltipBody = shouldUseCustomTooltip
    ? {
        [LlamaMarketColumnId.UserBorrowed]: <TotalDebtTooltipContent />,
        [LlamaMarketColumnId.UserCollateral]: (
          <CollateralMetricTooltipContent
            collateralValue={{
              collateral: { value: stats?.collateral?.amount, usdRate: stats?.collateral?.usdRate, symbol },
              borrow: {
                value: stats?.borrowToken?.amount,
                usdRate: stats?.borrowToken?.usdRate,
                symbol: stats?.borrowToken?.symbol,
              },
              totalValue:
                (stats?.collateral?.amount ?? 0) * (stats?.collateral?.usdRate ?? 0) +
                (stats?.borrowToken?.amount ?? 0) * (stats?.borrowToken?.usdRate ?? 0),
              loading: isLoading,
            }}
          />
        ),
      }[columnId]
    : undefined

  const usdValue = usdPrice && value * usdPrice
  return (
    <Stack direction="column" spacing={1} alignItems="end">
      <Tooltip title={tooltipTitle} body={tooltipBody}>
        <Stack direction="row" spacing={1} alignItems="center" whiteSpace="nowrap">
          <WithSkeleton loading={isLoading}>
            <Typography variant="tableCellMBold">{formatNumber(value, { notation: 'compact' })}</Typography>
            <TokenIcon blockchainId={chain} address={address} size="mui-md" />
          </WithSkeleton>
        </Stack>
      </Tooltip>
      <Tooltip title={formatNumber(usdValue, { currency: 'USD', decimals: 5 })}>
        <Typography variant="bodySRegular" color="text.secondary">
          <WithSkeleton
            loading={isLoading || isUsdRateLoading}
            sx={{ transform: 'unset' /* other mui will scale the text down */ }}
          >
            {formatNumber(usdValue, { currency: 'USD', notation: 'compact' })}
          </WithSkeleton>
        </Typography>
      </Tooltip>
    </Stack>
  )
}

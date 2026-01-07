import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import { AssetDetails, LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdPrice } from '@ui-kit/lib/model/entities/token-usd-prices'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { LlamaMarketColumnId } from '../columns'
import { ErrorCell } from './ErrorCell'

/**
 * Maps a column ID to the corresponding asset details from a market.
 * @param columnId - The column identifier to determine which asset to retrieve
 * @param assets - The market's assets containing collateral and borrowed token details
 */
const getAsset = (columnId: LlamaMarketColumnId, assets: LlamaMarket['assets']) =>
  (
    ({
      [LlamaMarketColumnId.UserCollateral]: assets.collateral,
      [LlamaMarketColumnId.UserBorrowed]: assets.borrowed,
      [LlamaMarketColumnId.UserEarnings]: assets.borrowed,
      [LlamaMarketColumnId.UserDeposited]: assets.borrowed,
    }) as Partial<Record<LlamaMarketColumnId, AssetDetails>>
  )[columnId]

/**
 * Maps a column ID to the corresponding value from user market stats.
 * @param columnId - The column identifier to determine which value to retrieve
 * @param stats - The user's market statistics containing borrowed, collateral, and earnings data
 *
 */
const getAssetValue = (columnId: LlamaMarketColumnId, stats: ReturnType<typeof useUserMarketStats>['data']) =>
  (
    ({
      [LlamaMarketColumnId.UserCollateral]: stats?.collateral?.amount,
      [LlamaMarketColumnId.UserBorrowed]: stats?.borrowed,
      [LlamaMarketColumnId.UserEarnings]: stats?.earnings?.earnings,
      [LlamaMarketColumnId.UserDeposited]: stats?.earnings?.totalCurrentAssets,
    }) as Partial<Record<LlamaMarketColumnId, number>>
  )[columnId]

/** Gets the tooltip title for a given column. */
const getTooltipTitle = (columnId: LlamaMarketColumnId) =>
  (
    ({
      [LlamaMarketColumnId.UserBorrowed]: t`Borrowed`,
      [LlamaMarketColumnId.UserCollateral]: t`Collateral`,
    }) as Partial<Record<LlamaMarketColumnId, string>>
  )[columnId]

/**
 * Gets the tooltip body content for columns that require detailed breakdowns.
 * @param columnId - The column identifier
 * @param stats - The user's market statistics
 * @param isLoading - Whether the stats are still loading
 * @returns The tooltip body React element, or undefined for simple tooltips
 */
const getTooltipBody = (
  columnId: LlamaMarketColumnId,
  stats: ReturnType<typeof useUserMarketStats>['data'],
  isLoading: boolean,
): React.ReactNode | undefined => {
  if (columnId === LlamaMarketColumnId.UserBorrowed) {
    return <TotalDebtTooltipContent />
  }

  if (columnId === LlamaMarketColumnId.UserCollateral) {
    return (
      <CollateralMetricTooltipContent
        collateralValue={{
          collateral: {
            value: stats?.collateral?.amount,
            usdRate: stats?.collateral?.usdRate,
            symbol: stats?.collateral?.symbol,
          },
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
        collateralLoss={
          stats?.collateralLoss && {
            ...stats.collateralLoss,
            loading: isLoading,
          }
        }
      />
    )
  }

  return undefined
}

export const PriceCell = ({ getValue, row, column }: CellContext<LlamaMarket, number>) => {
  const market = row.original
  const { assets } = market
  const columnId = column.id as LlamaMarketColumnId

  const { chain, address, symbol } = getAsset(columnId, assets) ?? assets.borrowed

  const { data: stats, error: statsError, isLoading } = useUserMarketStats(market, columnId)
  const value = getAssetValue(columnId, stats) ?? getValue()

  const { data: usdPrice, isLoading: isUsdRateLoading } = useTokenUsdPrice({
    blockchainId: chain,
    contractAddress: address,
  })

  if (!value) {
    return statsError && <ErrorCell error={statsError} />
  }

  const tooltipTitle = getTooltipTitle(columnId) ?? `${formatNumber(value, { decimals: 5 })} ${symbol}`
  const tooltipBody = getTooltipBody(columnId, stats, isLoading)
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

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
 * Maps a column ID to the corresponding assets of interest from a market.
 * Returns a tuple of [primary asset, secondary asset] where secondary may be undefined.
 *
 * @param columnId - The column identifier to determine which assets to retrieve
 * @param assets - The market's assets containing collateral and borrowed token details
 */
const getAssets = (columnId: LlamaMarketColumnId, assets: LlamaMarket['assets']) =>
  (
    ({
      [LlamaMarketColumnId.UserCollateral]: [assets.collateral, assets.borrowed],
      [LlamaMarketColumnId.UserBorrowed]: [assets.borrowed, undefined],
      [LlamaMarketColumnId.UserEarnings]: [assets.borrowed, undefined],
      [LlamaMarketColumnId.UserDeposited]: [assets.borrowed, undefined],
    }) as Partial<Record<LlamaMarketColumnId, [AssetDetails, AssetDetails | undefined]>>
  )[columnId]

/**
 * Maps a column ID to the corresponding values from user market stats.
 * Returns a tuple of [primary value, secondary value] where secondary may be undefined.
 *
 * @param columnId - The column identifier to determine which values to retrieve
 * @param stats - The user's market statistics containing borrowed, collateral, and earnings data
 */
const getAssetValues = (columnId: LlamaMarketColumnId, stats: ReturnType<typeof useUserMarketStats>['data']) =>
  (
    ({
      [LlamaMarketColumnId.UserCollateral]: [stats?.collateral?.amount, stats?.borrowToken?.amount],
      [LlamaMarketColumnId.UserBorrowed]: [stats?.borrowed, undefined],
      [LlamaMarketColumnId.UserEarnings]: [stats?.earnings?.earnings, undefined],
      [LlamaMarketColumnId.UserDeposited]: [stats?.earnings?.totalCurrentAssets, undefined],
    }) as Partial<Record<LlamaMarketColumnId, [number, number | undefined]>>
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
 *
 * @param columnId - The column identifier
 * @param stats - The user's market statistics
 * @param isLoading - Whether the stats are still loading
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

/**
 * Displays a price cell with primary and optional secondary asset values.
 * Helper functions use a 2-sized tuple as it's easier to work with than an object with named properties.
 * I've also asked around, and lending markets won't support more than 2 collateral tokens,
 * so it's safe and easier to work with a 2-sized tuple than a dynamically sized array.
 *
 * Some columns display a single asset (e.g., UserBorrowed shows just the borrowed token),
 * while others display two assets (e.g., UserCollateral shows both the collateral token
 * and the borrowed token when the user has debt tokens in their collateral position due to soft liq).
 *
 * The secondary asset, when present, is rendered first so that the primary asset
 * (real collateral) aligns consistently across all rows in the table.
 */
export const PriceCell = ({ getValue, row, column }: CellContext<LlamaMarket, number>) => {
  const market = row.original
  const { assets } = market
  const columnId = column.id as LlamaMarketColumnId

  const { data: stats, error: statsError, isLoading } = useUserMarketStats(market, columnId)

  const [primaryAsset, secondaryAsset] = getAssets(columnId, assets) ?? [assets.borrowed, undefined]
  const [primaryValue, secondaryValue] = getAssetValues(columnId, stats) ?? [getValue(), undefined]

  const { data: primaryPrice, isLoading: isPrimaryPriceLoading } = useTokenUsdPrice({
    blockchainId: primaryAsset.chain,
    contractAddress: primaryAsset.address,
  })

  const { data: secondaryPrice, isLoading: isSecondaryPriceLoading } = useTokenUsdPrice(
    {
      blockchainId: secondaryAsset?.chain,
      contractAddress: secondaryAsset?.address,
    },
    secondaryAsset && !!secondaryValue,
  )

  if (statsError) {
    return <ErrorCell error={statsError} />
  }

  const tooltipTitle =
    getTooltipTitle(columnId) ?? `${formatNumber(primaryValue, { decimals: 5 })} ${primaryAsset.symbol}`
  const tooltipBody = getTooltipBody(columnId, stats, isLoading)

  const collateralUsdValue = (primaryPrice && primaryValue * primaryPrice) ?? 0
  const borrowedUsdValue = (secondaryPrice && secondaryValue && secondaryValue * secondaryPrice) ?? 0
  const usdValue = collateralUsdValue + borrowedUsdValue

  return (
    <Stack direction="column" spacing={1} alignItems="end">
      <Tooltip title={tooltipTitle} body={tooltipBody}>
        <Stack direction="row" spacing={1} alignItems="center" whiteSpace="nowrap">
          <WithSkeleton loading={isLoading}>
            {secondaryAsset && !!secondaryValue && (
              <>
                <Typography variant="tableCellMBold">
                  {formatNumber(secondaryValue, { notation: 'compact' })}
                </Typography>
                <TokenIcon blockchainId={secondaryAsset.chain} address={secondaryAsset.address} size="mui-md" />
                &nbsp; {/** Easier than adding another Stack with gap */}
              </>
            )}
            <Typography variant="tableCellMBold">{formatNumber(primaryValue, { notation: 'compact' })}</Typography>
            <TokenIcon blockchainId={primaryAsset.chain} address={primaryAsset.address} size="mui-md" />
          </WithSkeleton>
        </Stack>
      </Tooltip>
      <Tooltip title={formatNumber(usdValue, { currency: 'USD', decimals: 5 })}>
        <Typography variant="bodySRegular" color="text.secondary">
          <WithSkeleton
            loading={isLoading || isPrimaryPriceLoading || isSecondaryPriceLoading}
            sx={{ transform: 'unset' /* other mui will scale the text down */ }}
          >
            {formatNumber(usdValue, { currency: 'USD', notation: 'compact' })}
          </WithSkeleton>
        </Typography>
      </Tooltip>
    </Stack>
  )
}

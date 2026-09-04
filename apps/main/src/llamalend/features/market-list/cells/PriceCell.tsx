import type { ReactNode } from 'react'
import type { LendingPosition } from '@/llamalend/queries/market-list/lending-vaults'
import { type LlamaMarketRow, type MarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import { AssetDetails, LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { TokenAmount } from '@/llamalend/widgets/TokenAmount'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { decimal, decimalMultiply, formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes, notFalsyArray } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { MarketColumnId } from '../columns'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

/**
 * Maps a column ID to the corresponding assets of interest from a market.
 * Returns a tuple of [primary asset, secondary asset] where secondary may be undefined.
 *
 * @param columnId - The column identifier to determine which assets to retrieve
 * @param assets - The market's assets containing collateral and borrowed token details
 */
const getAssets = (columnId: MarketColumnId, assets: LlamaMarket['assets']) =>
  (
    ({
      [MarketColumnId.UserCollateral]: [assets.collateral, assets.borrowed],
      [MarketColumnId.UserBorrowed]: [assets.borrowed, undefined],
      [MarketColumnId.UserEarnings]: [assets.borrowed, undefined],
      [MarketColumnId.UserDeposited]: [assets.borrowed, undefined],
    }) as Partial<Record<MarketColumnId, [AssetDetails, AssetDetails | undefined]>>
  )[columnId]

/**
 * Maps a column ID to the corresponding values from user market stats.
 * Returns a tuple of [primary value, secondary value] where secondary may be undefined.
 */
const getAssetValues = (
  columnId: MarketColumnId,
  stats: MarketStats | undefined,
  lendingPosition: LendingPosition | undefined,
) =>
  (
    ({
      [MarketColumnId.UserCollateral]: [stats?.collateral, stats?.borrowToken],
      [MarketColumnId.UserBorrowed]: [stats?.borrowed, undefined],
      [MarketColumnId.UserEarnings]: [lendingPosition?.earnings, undefined],
      [MarketColumnId.UserDeposited]: [lendingPosition?.supplied, undefined],
    }) as Partial<Record<MarketColumnId, [number, number | undefined]>>
  )[columnId]

/** Gets the tooltip title for a given column. */
const getTooltipTitle = (columnId: MarketColumnId) =>
  (
    ({
      [MarketColumnId.UserBorrowed]: t`Borrowed`,
      [MarketColumnId.UserCollateral]: t`Collateral`,
    }) as Partial<Record<MarketColumnId, string>>
  )[columnId]

/**
 * Gets the tooltip body content for columns that require detailed breakdowns.
 *
 * @param columnId - The column identifier
 * @param stats - The user's market statistics
 */
const getTooltipBody = (
  columnId: MarketColumnId,
  stats: MarketStats | undefined,
  market: LlamaMarket,
  totalValue: Decimal | undefined,
  totalValueUsd: QueryProp<Decimal>,
): ReactNode | undefined => {
  if (columnId === MarketColumnId.UserBorrowed) {
    return <TotalDebtTooltipContent />
  }

  if (columnId === MarketColumnId.UserCollateral) {
    return (
      <CollateralMetricTooltipContent
        {...{
          collateral: {
            value: decimal(stats?.collateral),
            conversionRate: market.oraclePrice,
            symbol: market.assets.collateral.symbol,
          },
          borrow: {
            value: decimal(stats?.borrowToken),
            symbol: market.assets.borrowed.symbol,
          },
          totalValue,
          totalValueUsd,
        }}
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
 * Layout uses CSS Grid with explicit `gridRow` placement:
 * - Single asset (1 column, 2 rows): Value in row 1, USD in row 2
 * - Two assets (2 columns, 2 rows): Each row shows [USD | Value] for each asset
 * This behaviour is easier to achieve with a vanilla CSS grid compared to MUI's Grid component.
 */
export const PriceCell = ({
  getValue,
  row,
  column,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const market = row.original
  const { assets, lendingPosition } = market
  const columnId = column.id as MarketColumnId

  const { stats: statsQuery, prices } = market.positionQueries
  const { data: stats, error: statsError, isLoading: isLoadingStats } = statsQuery
  const usesBorrowStats = columnId === MarketColumnId.UserBorrowed || columnId === MarketColumnId.UserCollateral
  const [primaryAsset, secondaryAsset] = getAssets(columnId, assets) ?? [assets.borrowed, undefined]
  const [primaryValue, secondaryValue] = getAssetValues(columnId, stats, lendingPosition) ?? [getValue(), undefined]
  const primaryPriceQuery = columnId === MarketColumnId.UserCollateral ? prices.collateral : prices.borrowed
  const { data: primaryPrice, isLoading: isPrimaryPriceLoading } = primaryPriceQuery
  const { data: secondaryPrice, isLoading: isSecondaryPriceLoading } = prices.borrowed

  if (usesBorrowStats && statsError) {
    return <ErrorCell error={statsError} />
  }

  const tooltipTitle =
    getTooltipTitle(columnId) ??
    `${formatNumber(primaryValue, { decimals: 5, abbreviate: false })} ${primaryAsset.symbol}`
  const totalValue = maybe(market.oraclePrice, oraclePrice =>
    decimal((stats?.collateral ?? 0) * oraclePrice + (stats?.borrowToken ?? 0)),
  )
  const totalValueUsd = mapQuery(prices.borrowed, borrowUsdRate =>
    maybe(totalValue, value => decimalMultiply(value, borrowUsdRate)),
  )
  const tooltipBody = getTooltipBody(columnId, stats, market, totalValue, totalValueUsd)

  const primaryUsdValue = maybes([primaryPrice, primaryValue], (price, value) => value * price)
  const secondaryUsdValue = maybes([secondaryPrice, secondaryValue], (price, value) => value * price)

  const hasSecondaryAsset = secondaryAsset && !!secondaryValue

  const gridAssets = [
    { asset: primaryAsset, value: primaryValue, usdValue: primaryUsdValue, isPriceLoading: isPrimaryPriceLoading },
    ...notFalsyArray(
      hasSecondaryAsset && [
        {
          asset: secondaryAsset,
          value: secondaryValue,
          usdValue: secondaryUsdValue,
          isPriceLoading: isSecondaryPriceLoading,
        },
      ],
    ),
  ]

  return (
    <Stack sx={{ gap: hasSecondaryAsset ? Spacing.xs : 0 }}>
      {gridAssets.map(({ asset, value, usdValue, isPriceLoading }) => (
        <TokenAmount
          key={asset.address}
          amount={value}
          amountUsd={usdValue}
          blockchainId={asset.chain}
          tokenAddress={asset.address}
          amountLoading={usesBorrowStats && isLoadingStats}
          usdLoading={isPriceLoading}
          tooltipTitle={tooltipTitle}
          tooltipBody={tooltipBody}
          horizontal={!!hasSecondaryAsset}
        />
      ))}
    </Stack>
  )
}

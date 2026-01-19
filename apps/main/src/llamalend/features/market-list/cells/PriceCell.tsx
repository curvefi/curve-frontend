import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import { AssetDetails, LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdPrice } from '@ui-kit/lib/model/entities/token-usd-prices'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../columns'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

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

/** Displays an asset value with its token icon, wrapped in a tooltip. */
const AssetValue = ({
  asset,
  value,
  isValueLoading,
  tooltipTitle,
  tooltipBody,
}: {
  asset: AssetDetails
  value: number | undefined
  isValueLoading: boolean
  tooltipTitle: string
  tooltipBody: React.ReactNode
}) => (
  <WithSkeleton loading={isValueLoading}>
    <Tooltip title={tooltipTitle} body={tooltipBody}>
      <Stack direction="row" spacing={Spacing.xs} alignItems="center">
        <Typography variant="tableCellMBold">{formatNumber(value, { notation: 'compact' })}</Typography>
        <TokenIcon blockchainId={asset.chain} address={asset.address} size="mui-md" />
      </Stack>
    </Tooltip>
  </WithSkeleton>
)

/** Displays a USD value with a tooltip showing the full precision value. */
const AssetUsdValue = ({
  usdValue,
  isPriceLoading,
}: {
  usdValue: number | null | undefined
  isPriceLoading: boolean
}) => (
  <WithSkeleton loading={isPriceLoading}>
    <Tooltip title={formatNumber(usdValue, { currency: 'USD', decimals: 5 })}>
      <Typography variant="bodySRegular" color="text.secondary">
        {formatNumber(usdValue, { currency: 'USD', notation: 'compact' })}
      </Typography>
    </Tooltip>
  </WithSkeleton>
)

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
export const PriceCell = ({ getValue, row, column }: CellContext<LlamaMarket, number>) => {
  const market = row.original
  const { assets } = market
  const columnId = column.id as LlamaMarketColumnId

  const { data: stats, error: statsError, isLoading: isLoadingStats } = useUserMarketStats(market, columnId)

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
  const tooltipBody = getTooltipBody(columnId, stats, isLoadingStats)

  const primaryUsdValue = primaryPrice && primaryValue * primaryPrice
  const secondaryUsdValue = secondaryPrice && secondaryValue && secondaryValue * secondaryPrice

  const hasSecondaryAsset = secondaryAsset && !!secondaryValue

  const gridAssets = [
    { asset: primaryAsset, value: primaryValue, usdValue: primaryUsdValue, isPriceLoading: isPrimaryPriceLoading },
    ...(hasSecondaryAsset
      ? [
          {
            asset: secondaryAsset,
            value: secondaryValue,
            usdValue: secondaryUsdValue,
            isPriceLoading: isSecondaryPriceLoading,
          },
        ]
      : []),
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: hasSecondaryAsset ? '1fr 1fr' : '1fr',
        rowGap: Spacing.xs,
        columnGap: Spacing.md,
        justifyItems: 'end',
        alignItems: 'center',
      }}
    >
      {gridAssets.flatMap(({ asset, value, usdValue, isPriceLoading }) => [
        <Box key={`${asset.address}-usd`} sx={{ gridRow: hasSecondaryAsset ? 'auto' : 2 }}>
          <AssetUsdValue usdValue={usdValue} isPriceLoading={isPriceLoading} />
        </Box>,
        <Box key={`${asset.address}-value`} sx={{ gridRow: hasSecondaryAsset ? 'auto' : 1 }}>
          <AssetValue
            asset={asset}
            value={value}
            isValueLoading={isLoadingStats}
            tooltipTitle={tooltipTitle}
            tooltipBody={tooltipBody}
          />
        </Box>,
      ])}
    </Box>
  )
}

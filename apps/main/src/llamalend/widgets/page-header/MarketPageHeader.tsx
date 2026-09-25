import { useConnection } from 'wagmi'
import { useMarketContext } from '@/llamalend/features/market-context'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { getInternalUrl, LLAMALEND_ROUTES } from '@evm-ui/shared/routes'
import { MarketAssetsType, MarketType, MarketRateType } from '@evm-ui/types/market'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { Badge } from '@ui/components/Badge'
import { PageHeader } from '@ui/components/PageHeader'
import { TokenIcons } from '@ui/components/TokenIcons'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { WithWrapper } from '@ui/components/WithWrapper'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ChainIcon } from '@ui/icons/ChainIcon'
import { ReloadIcon } from '@ui/icons/ReloadIcon'
import { IS_DEVELOPMENT } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'
import { usePageHeader } from './hooks/usePageHeader'
import { LegacyMetricsRow } from './LegacyMetricsRow'
import { MetricsRow } from './MetricsRow'

const { Spacing } = SizesAndSpaces

export const MarketPageHeader = ({ isLoading, rateType }: { isLoading: boolean; rateType: MarketRateType }) => {
  const { address: userAddress } = useConnection()
  const {
    chainId,
    blockchainId,
    marketId,
    controllerAddress,
    marketType,
    tokens: { collateralToken, borrowToken },
  } = useMarketContext()
  const { borrowRate, supplyRate, availableLiquidity } = usePageHeader()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()

  const title = (collateralToken && borrowToken && `${collateralToken.symbol} • ${borrowToken.symbol}`) ?? t`Market`

  const subtitle =
    collateralToken &&
    borrowToken &&
    t`Use ${collateralToken.symbol} to borrow ${marketType === MarketType.Mint ? t`and mint ` : ''}${borrowToken.symbol}`

  const MetricComponent = isNewLlamaMarketDetailPage ? MetricsRow : LegacyMetricsRow
  const metrics = (
    <MetricComponent
      borrowRate={borrowRate}
      supplyRate={supplyRate}
      availableLiquidity={availableLiquidity}
      marketType={marketType}
      collateral={collateralToken}
      borrowToken={borrowToken}
      rateType={rateType}
    />
  )

  return (
    <WithWrapper shouldWrap={isNewLlamaMarketDetailPage} Wrapper={Stack}>
      <PageHeader
        backHref={getInternalUrl('llamalend', blockchainId, LLAMALEND_ROUTES.PAGE_MARKETS)}
        title={title}
        subtitle={subtitle}
        titleLoading={isLoading}
        subtitleLoading={isLoading}
        disableUpperCase
        icon={
          <WithSkeleton loading={isLoading} variant="rectangular" width={35} height={35}>
            {collateralToken && borrowToken && (
              <TokenIcons blockchainId={blockchainId} tokens={[collateralToken, borrowToken]} overflowMode="stack" />
            )}
          </WithSkeleton>
        }
        titleItems={
          <>
            <WithSkeleton loading={isLoading} width={24}>
              <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
                <ChainIcon blockchainId={blockchainId} />
                <Badge size="extraSmall" label={t`${marketType}`} />
                <CategoryBadge chainId={chainId} controllerAddress={controllerAddress} />
              </Stack>
            </WithSkeleton>

            {IS_DEVELOPMENT && marketId && controllerAddress && userAddress && (
              <IconButton
                size="extraSmall"
                onClick={() =>
                  void invalidateAllUserMarketDetails({
                    chainId,
                    marketId,
                    userAddress,
                    blockchainId,
                    contractAddress: controllerAddress,
                  })
                }
              >
                <ReloadIcon />
              </IconButton>
            )}
          </>
        }
        {...(!isNewLlamaMarketDetailPage && { rightItems: metrics })}
      />
      {isNewLlamaMarketDetailPage && metrics}
    </WithWrapper>
  )
}

const CATEGORY_LABEL: Record<MarketAssetsType, string> = {
  [MarketAssetsType.Correlated]: 'Correlated',
  [MarketAssetsType.BlueChip]: 'Blue-chip',
  [MarketAssetsType.LongTail]: 'Long-tail',
}

const CategoryBadge = ({ chainId, controllerAddress }: { chainId: number; controllerAddress: Address | undefined }) => {
  const category = getMarketAssetsType(chainId, controllerAddress)
  const label = category ? CATEGORY_LABEL[category] : 'Category unavailable'
  return (
    <Tooltip title={t`Market category: ${label}. Position warnings use thresholds for this category. These thresholds are provisional.`}>
      <Badge size="extraSmall" label={label} data-testid="market-category-badge" />
    </Tooltip>
  )
}

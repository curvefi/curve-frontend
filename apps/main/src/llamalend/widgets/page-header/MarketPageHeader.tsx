import { useConnection } from 'wagmi'
import { useMarketContext } from '@/llamalend/features/market-context'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useNewLlamaMarketDetailPage } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketType, MarketRateType } from '@ui-kit/types/market'
import { IS_DEVELOPMENT } from '@ui-kit/utils'
import { PageHeader } from '@ui-kit/widgets/PageHeader'
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
    <WithWrapper
      shouldWrap={isNewLlamaMarketDetailPage}
      Wrapper={Stack}
      sx={{ gap: Spacing.sm, paddingBlockEnd: Spacing.md }}
    >
      <PageHeader
        backHref={getInternalUrl('llamalend', blockchainId, LLAMALEND_ROUTES.PAGE_MARKETS)}
        title={title}
        subtitle={subtitle}
        titleLoading={isLoading}
        subtitleLoading={isLoading}
        titleSx={{ textTransform: 'none' }}
        icon={
          <WithSkeleton loading={isLoading} variant="rectangular" width={35} height={35}>
            {collateralToken && borrowToken && (
              <TokenPair
                chain={blockchainId}
                assets={{ primary: collateralToken, secondary: borrowToken }}
                hideChainIcon
              />
            )}
          </WithSkeleton>
        }
        titleItems={
          <>
            <WithSkeleton loading={isLoading} width={24}>
              <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
                <ChainIcon blockchainId={blockchainId} />
                <Badge size="extraSmall" label={t`${marketType}`} />
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
        titleComponent="h1"
        {...(!isNewLlamaMarketDetailPage && { rightItems: metrics })}
      />
      {isNewLlamaMarketDetailPage && metrics}
    </WithWrapper>
  )
}

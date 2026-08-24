import { useConnection } from 'wagmi'
import { useMarketContext } from '@/llamalend/features/market-context'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { t } from '@evm-ui/lib/i18n'
import { ChainIcon } from '@evm-ui/shared/icons/ChainIcon'
import { ReloadIcon } from '@evm-ui/shared/icons/ReloadIcon'
import { getInternalUrl, LLAMALEND_ROUTES } from '@evm-ui/shared/routes'
import { Badge } from '@evm-ui/shared/ui/Badge'
import { TokenIcons } from '@evm-ui/shared/ui/TokenIcons'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import { IS_DEVELOPMENT } from '@evm-ui/utils'
import { PageHeader } from '@evm-ui/widgets/PageHeader'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
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
    <WithWrapper shouldWrap={isNewLlamaMarketDetailPage} Wrapper={Stack} sx={{ gap: Spacing.sm }}>
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

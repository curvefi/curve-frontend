import { useConnection } from 'wagmi'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Chain } from '@curvefi/prices-api'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'
import { isDevelopment } from '@ui-kit/utils'
import { PageHeader } from '@ui-kit/widgets/PageHeader'
import { usePageHeader } from './hooks/usePageHeader'
import { MetricsRow } from './'

const { Spacing } = SizesAndSpaces

export const MarketPageHeader = ({
  blockchainId,
  chainId,
  isLoading,
  market,
  marketType,
  apiMarket,
}: {
  blockchainId: Chain
  chainId: number
  isLoading: boolean
  market: LlamaMarketTemplate | undefined
  marketType: LlamaMarketType
  apiMarket: QueryProp<LlamaMarket>
}) => {
  const { address: userAddress } = useConnection()
  const { borrowRate, supplyRate, availableLiquidity } = usePageHeader({
    chainId,
    market,
    blockchainId,
    apiMarket,
    marketType,
  })
  const { collateralToken, borrowToken } =
    maybe(market, getTokens) ??
    maybe(apiMarket.data, ({ assets }) => ({ collateralToken: assets.collateral, borrowToken: assets.borrowed })) ??
    {}

  const title =
    (collateralToken &&
      borrowToken &&
      `${collateralToken.symbol.toUpperCase()} • ${borrowToken.symbol.toUpperCase()}`) ??
    t`Market`

  const subtitle =
    collateralToken &&
    borrowToken &&
    t`Use ${collateralToken.symbol} to borrow ${marketType === LlamaMarketType.Mint ? t`and mint ` : ''}${borrowToken.symbol}`

  return (
    <PageHeader
      backHref={getInternalUrl('llamalend', blockchainId, LLAMALEND_ROUTES.PAGE_MARKETS)}
      title={title}
      subtitle={subtitle}
      titleLoading={isLoading}
      subtitleLoading={isLoading}
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

          {isDevelopment && market && userAddress && (
            <IconButton
              size="extraSmall"
              onClick={() =>
                void invalidateAllUserMarketDetails({
                  chainId: chainId as IChainId,
                  marketId: market.id,
                  userAddress,
                  blockchainId,
                  contractAddress: getControllerAddress(market),
                })
              }
            >
              <ReloadIcon />
            </IconButton>
          )}
        </>
      }
      rightItems={
        <MetricsRow
          borrowRate={borrowRate}
          supplyRate={supplyRate}
          availableLiquidity={availableLiquidity}
          marketType={marketType}
          collateral={collateralToken}
        />
      }
    />
  )
}

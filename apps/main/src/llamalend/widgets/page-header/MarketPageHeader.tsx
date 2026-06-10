import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { type Chain } from '@curvefi/prices-api'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { isDevelopment } from '@ui-kit/utils'
import { PageHeader } from '@ui-kit/widgets/PageHeader'
import { usePageHeader } from './hooks/usePageHeader'
import { MetricsRow } from './'

const { Spacing } = SizesAndSpaces

const generateSubtitle = (
  collateralSymbol: string | undefined,
  borrowedSymbol: string | undefined,
  type: LlamaMarketType,
) =>
  collateralSymbol && borrowedSymbol && type === LlamaMarketType.Mint
    ? t`Use ${collateralSymbol} to borrow and mint ${borrowedSymbol}`
    : t`Use ${collateralSymbol} to borrow ${borrowedSymbol}`

const generateMarketTitle = (collateralSymbol: string | undefined, borrowedSymbol: string | undefined) =>
  (collateralSymbol && borrowedSymbol && `${collateralSymbol.toUpperCase()} • ${borrowedSymbol.toUpperCase()}`) ??
  t`Market`

export const MarketPageHeader = ({
  chainId,
  marketId,
  isLoading,
  market,
  blockchainId,
}: {
  chainId: number
  marketId: string
  isLoading: boolean
  market: LlamaMarketTemplate | undefined
  blockchainId: Chain
}) => {
  const { borrowRate, supplyRate, availableLiquidity } = usePageHeader({ chainId, marketId, market, blockchainId })
  const marketType = market instanceof MintMarketTemplate ? LlamaMarketType.Mint : LlamaMarketType.Lend
  const { collateralToken, borrowToken } = market
    ? getTokens(market)
    : { collateralToken: undefined, borrowToken: undefined }
  const title = generateMarketTitle(collateralToken?.symbol, borrowToken?.symbol)
  const subtitle = generateSubtitle(collateralToken?.symbol, borrowToken?.symbol, marketType)

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

          {isDevelopment && market && (
            <IconButton
              size="extraSmall"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
              onClick={() => {
                const { chainId, signerAddress } = market.getLlamalend()
                return invalidateAllUserMarketDetails({
                  chainId,
                  marketId: market.id,
                  userAddress: signerAddress as Address,
                  blockchainId,
                  contractAddress: getControllerAddress(market),
                })
              }}
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

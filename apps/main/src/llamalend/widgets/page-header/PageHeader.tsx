import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
import type { BorrowRate, SupplyRate } from '@/llamalend/rates.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { type Chain } from '@curvefi/prices-api'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { useGoBack } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ArrowLeft } from '@ui-kit/shared/icons/ArrowLeft'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'
import { isDevelopment } from '@ui-kit/utils'
import { type AvailableLiquidity, usePageHeader } from './hooks/usePageHeader'
import { generateMarketTitle, generateSubtitle, MetricsRow } from './'

const { Spacing } = SizesAndSpaces

export const PageHeader = ({
  chainId,
  marketId,
  isLoading,
  market,
  blockchainId,
}: {
  chainId: number
  marketId: string | undefined
  isLoading: boolean
  market: LlamaMarketTemplate | undefined
  blockchainId: Chain
}) => {
  const { borrowRate, supplyRate, availableLiquidity } = usePageHeader({ chainId, marketId, market, blockchainId })
  return (
    <PageHeaderView
      isLoading={isLoading}
      market={market}
      blockchainId={blockchainId}
      borrowRate={borrowRate}
      supplyRate={supplyRate}
      availableLiquidity={availableLiquidity}
    />
  )
}

/** Separate view component in order to generate a good storybook example */
export const PageHeaderView = ({
  isLoading,
  market,
  blockchainId,
  borrowRate,
  supplyRate,
  availableLiquidity,
}: {
  isLoading: boolean
  market: LlamaMarketTemplate | undefined
  blockchainId: Chain
  borrowRate: QueryProp<BorrowRate>
  supplyRate?: QueryProp<SupplyRate>
  availableLiquidity: QueryProp<AvailableLiquidity>
}) => {
  const marketType = market instanceof MintMarketTemplate ? LlamaMarketType.Mint : LlamaMarketType.Lend
  const { collateralToken, borrowToken } = market
    ? getTokens(market)
    : { collateralToken: undefined, borrowToken: undefined }
  const title = generateMarketTitle(collateralToken?.symbol, borrowToken?.symbol)
  const subtitle = generateSubtitle(collateralToken?.symbol, borrowToken?.symbol, marketType)

  return (
    <Stack
      direction={{ mobile: 'column', tablet: 'row' }}
      sx={{
        flexWrap: { tablet: 'wrap' },
        justifyContent: { tablet: 'space-between' },
        gap: Spacing.md,
        paddingBlock: Spacing.sm,
      }}
    >
      <Stack direction="row">
        <IconButton
          size="small"
          component={RouterLink}
          href={getInternalUrl('llamalend', blockchainId, LLAMALEND_ROUTES.PAGE_MARKETS)}
          onClick={useGoBack()}
          sx={{ alignSelf: 'center' }}
        >
          <ArrowLeft />
        </IconButton>
        <Stack direction="row" sx={{ gap: Spacing.sm }}>
          <Box sx={{ alignSelf: 'center' }}>
            <WithSkeleton loading={isLoading} variant="rectangular" width={35} height={35}>
              {collateralToken && borrowToken && (
                <TokenPair
                  chain={blockchainId}
                  assets={{ primary: collateralToken, secondary: borrowToken }}
                  hideChainIcon
                />
              )}
            </WithSkeleton>
          </Box>
          <Stack sx={{ justifyContent: { mobile: 'center', tablet: 'flex-start' } }}>
            <WithSkeleton loading={isLoading} width={80} height={12}>
              <Typography variant="bodyXsRegular">{subtitle}</Typography>
            </WithSkeleton>
            <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <WithSkeleton loading={isLoading} width={140} height={24}>
                <Typography variant="headingSBold">{title}</Typography>
              </WithSkeleton>
              <WithSkeleton loading={isLoading} width={24} height={24}>
                {/* 3px custom padding bottom to align with text baseline */}
                <Stack direction="row" sx={{ gap: Spacing.xs, paddingBottom: '0.1875rem', alignItems: 'flex-end' }}>
                  <ChainIcon blockchainId={blockchainId} />
                  <Badge size="extraSmall" color="default" label={t`${marketType}`} />
                </Stack>
              </WithSkeleton>
            </Stack>
          </Stack>
        </Stack>
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
            sx={{ alignSelf: 'center' }}
          >
            <ReloadIcon />
          </IconButton>
        )}
      </Stack>
      <MetricsRow
        borrowRate={borrowRate}
        supplyRate={supplyRate}
        availableLiquidity={availableLiquidity}
        marketType={marketType}
        collateral={collateralToken}
      />
    </Stack>
  )
}

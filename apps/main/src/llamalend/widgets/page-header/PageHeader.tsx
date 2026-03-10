import { getTokens } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { BorrowRate, SupplyRate } from '@/llamalend/rates.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { type Chain } from '@curvefi/prices-api'
import { Typography } from '@mui/material'
import { IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack, { StackProps } from '@mui/material/Stack'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ArrowLeft } from '@ui-kit/shared/icons/ArrowLeft'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { pageMargins } from '@ui-kit/widgets/DetailPageLayout/constants'
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
  marketId: string
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

const PADDING_BLOCK = Spacing.sm

/**
 * CSS rules for making the page header sticky.
 *
 * There is a gap between the navbar and the page title where scrolled content can briefly become visible. To prevent this,
 * a negative margin is applied and the same value is added as top padding so the header remains visually fixed in the intended position.
 *
 * An alternative approach would be using a ::before pseudo-element to mask the scrolling content.
 */
const stickySx = (navHeight: number): StackProps['sx'] => ({
  position: { tablet: 'sticky' },
  top: { tablet: `${navHeight}px` },
  marginBlockStart: { tablet: `calc(${pageMargins.marginBlockStart.tablet} * -1)` },
  zIndex: (t) => t.zIndex.appBar - 1,
  backgroundColor: (t) => t.palette.background.default,
  paddingBlockStart: {
    mobile: PADDING_BLOCK.mobile,
    tablet: pageMargins.marginBlockStart.tablet,
  },
})

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
  borrowRate: BorrowRate
  supplyRate?: SupplyRate
  availableLiquidity: AvailableLiquidity
}) => {
  const push = useNavigate()
  const navHeight = useLayoutStore((state) => state.navHeight)

  const marketType = market instanceof MintMarketTemplate ? LlamaMarketType.Mint : LlamaMarketType.Lend
  const { collateralToken, borrowToken } = market
    ? getTokens(market)
    : { collateralToken: undefined, borrowToken: undefined }
  const title = generateMarketTitle(collateralToken?.symbol, borrowToken?.symbol)
  const subtitle = generateSubtitle(collateralToken?.symbol, borrowToken?.symbol, marketType)

  return (
    <Stack
      direction={{ mobile: 'column', tablet: 'row' }}
      flexWrap={{ tablet: 'wrap' }}
      justifyContent={{ tablet: 'space-between' }}
      gap={Spacing.md}
      paddingBlockEnd={PADDING_BLOCK}
      sx={stickySx(navHeight)}
    >
      <Stack direction="row">
        <IconButton
          size="small"
          onClick={() => push(getInternalUrl('llamalend', blockchainId, LLAMALEND_ROUTES.PAGE_MARKETS))}
          sx={{ alignSelf: 'center' }}
        >
          <ArrowLeft />
        </IconButton>
        <Stack direction="row" gap={Spacing.sm}>
          <Box alignSelf="center">
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
          <Stack justifyContent={{ mobile: 'center', tablet: 'flex-start' }}>
            <WithSkeleton loading={isLoading} width={80} height={12}>
              <Typography variant="bodyXsRegular">{subtitle}</Typography>
            </WithSkeleton>
            <Stack direction="row" gap={Spacing.xs} alignItems="flex-end" flexWrap="wrap">
              <WithSkeleton loading={isLoading} width={140} height={24}>
                <Typography variant="headingSBold">{title}</Typography>
              </WithSkeleton>
              <WithSkeleton loading={isLoading} width={24} height={24}>
                {/* 3px custom padding bottom to align with text baseline */}
                <Stack direction="row" gap={Spacing.xs} paddingBottom="0.1875rem" alignItems="flex-end">
                  <ChainIcon size="sm" blockchainId={blockchainId} />
                  <Chip size="extraSmall" color="default" label={t`${marketType}`} />
                </Stack>
              </WithSkeleton>
            </Stack>
          </Stack>
        </Stack>
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

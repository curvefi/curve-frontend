import { BorrowRate, SupplyRate, AvailableLiquidity } from '@/llamalend/features/market-details'
import { getTokens } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { type Chain } from '@curvefi/prices-api'
import { Typography } from '@mui/material'
import { IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ArrowLeft } from '@ui-kit/shared/icons/ArrowLeft'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { generateMarketTitle, generateSubtitle, MetricsRow } from './'

const { Spacing } = SizesAndSpaces

type PageHeaderProps = {
  isLoading: boolean
  market: LlamaMarketTemplate | undefined
  blockchainId: Chain
  borrowRate: BorrowRate
  supplyRate?: SupplyRate
  availableLiquidity: AvailableLiquidity
}

export const PageHeader = ({
  isLoading,
  market,
  blockchainId,
  borrowRate,
  supplyRate,
  availableLiquidity,
}: PageHeaderProps) => {
  const push = useNavigate()

  const marketType = market instanceof MintMarketTemplate ? LlamaMarketType.Mint : LlamaMarketType.Lend
  const { collateralToken, borrowToken } = market
    ? getTokens(market)
    : { collateralToken: undefined, borrowToken: undefined }
  const title = generateMarketTitle(collateralToken?.symbol, borrowToken?.symbol)
  const subtitle = generateSubtitle(collateralToken?.symbol, borrowToken?.symbol, marketType)

  return (
    <Stack
      direction={{ mobile: 'column', tablet: 'row' }}
      justifyContent={{ tablet: 'space-between' }}
      gap={Spacing.md}
      paddingBlock={Spacing.sm}
      paddingInline={Spacing.md}
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

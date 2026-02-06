import { type Chain } from '@curvefi/prices-api'
import { Typography } from '@mui/material'
import { IconButton } from '@mui/material'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@ui-kit/hooks/router'
import { ArrowLeft } from '@ui-kit/shared/icons/ArrowLeft'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'

const { Spacing } = SizesAndSpaces

type Asset = {
  symbol: string
  address: string
}

type PageHeaderProps = {
  isLoading: boolean
  title: string | undefined
  subtitle: string | undefined
  collateral: Asset | undefined
  borrowed: Asset | undefined
  pageType: LlamaMarketType
  chain: Chain
}

export const PageHeader = ({ isLoading, pageType, chain, collateral, borrowed, title, subtitle }: PageHeaderProps) => {
  const push = useNavigate()

  return (
    <Stack
      direction="row"
      alignItems="center"
      paddingBlock={Spacing.sm}
      paddingInline={Spacing.md}
      sx={{ borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}` }}
    >
      <IconButton
        size="small"
        sx={{ backgroundColor: 'transparent', '&:hover': { backgroundColor: 'transparent' } }}
        onClick={() => push(getInternalUrl('llamalend', chain, LLAMALEND_ROUTES.PAGE_MARKETS))}
      >
        <ArrowLeft />
      </IconButton>
      <Stack direction="row" gap={Spacing.sm}>
        <WithSkeleton loading={isLoading} variant="rectangular" width={46} height={46}>
          {collateral && borrowed && (
            <TokenPair chain={chain} assets={{ primary: collateral, secondary: borrowed }} hideChainIcon />
          )}
        </WithSkeleton>
        <Stack>
          <Stack direction="row" gap={Spacing.xs} alignItems="top">
            <WithSkeleton loading={isLoading} variant="text" width={120} height={24}>
              <Typography variant="headingSBold">{title}</Typography>
            </WithSkeleton>
            <WithSkeleton loading={isLoading} variant="text" width={24} height={24}>
              <Chip size="extraSmall" color="default" label={pageType} />
              <ChainIcon size="sm" blockchainId={chain} />
            </WithSkeleton>
          </Stack>
          <WithSkeleton loading={isLoading} width={100} height={14}>
            <Typography variant="bodySRegular">{subtitle}</Typography>
          </WithSkeleton>
        </Stack>
      </Stack>
    </Stack>
  )
}

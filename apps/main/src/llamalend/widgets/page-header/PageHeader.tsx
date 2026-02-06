import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
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
import { generateMarketTitle, generateSubtitle, extractPropsFromMarket } from './page-header.utils'

const { Spacing } = SizesAndSpaces

type PageHeaderProps = {
  isLoading: boolean
  market: LlamaMarketTemplate | undefined
  pageType: LlamaMarketType
  chain: Chain
  metrics?: React.ReactNode[]
}

export const PageHeader = ({ isLoading, market, pageType, chain, metrics }: PageHeaderProps) => {
  const push = useNavigate()

  const { collateral, borrowed } = extractPropsFromMarket(market)
  const title = generateMarketTitle(collateral?.symbol, borrowed?.symbol)
  const subtitle = generateSubtitle(collateral?.symbol, borrowed?.symbol, pageType)

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      paddingBlock={Spacing.sm}
      paddingInline={Spacing.md}
      sx={{ borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}` }}
    >
      <Stack direction="row">
        <IconButton
          size="small"
          sx={{ backgroundColor: 'transparent', '&:hover': { backgroundColor: 'transparent' } }}
          onClick={() => push(getInternalUrl('llamalend', chain, LLAMALEND_ROUTES.PAGE_MARKETS))}
        >
          <ArrowLeft />
        </IconButton>
        <Stack direction="row" gap={Spacing.sm}>
          <WithSkeleton loading={isLoading} variant="rectangular" width={40} height={40}>
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
      {metrics &&
        metrics.map((metric, index) => (
          <Stack direction="row" key={index} gap={Spacing.sm}>
            {metric}
          </Stack>
        ))}
    </Stack>
  )
}

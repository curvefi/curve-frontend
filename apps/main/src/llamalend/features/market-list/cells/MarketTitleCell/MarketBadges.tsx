import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Badge, BadgeProps } from '@ui-kit/shared/ui/Badge'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType, LlamaMarketVersion } from '@ui-kit/types/market'
import { FavoriteMarketButton } from '../../chips/FavoriteMarketButton'

const { Spacing, Sizing } = SizesAndSpaces

const marketTypeDetails: Record<LlamaMarketType, { label: string; description: string }> = {
  [LlamaMarketType.Lend]: {
    label: t`Lend`,
    description: t`Lending markets let users earn by lending assets or borrow using collateral.`,
  },
  [LlamaMarketType.Mint]: {
    label: t`Mint`,
    description: t`Mint markets lets users borrow by minting crvUSD against collateral.`,
  },
}

const marketVersionLabel: Record<LlamaMarketVersion, string> = {
  [LlamaMarketVersion.v1]: t`V1`,
  [LlamaMarketVersion.v2]: t`V2`,
}

const MarketBadge = ({ ...props }: Omit<BadgeProps, 'size'>) => <Badge size="extraSmall" {...props} />

/** Displays badges for a market, such as the chain icon and market type. */
export const MarketBadges = ({ market, isMobile }: { market: LlamaMarket; isMobile: boolean }) => {
  const { favoriteKey, type, leverage, deprecatedMessage, chain, version } = market
  const isSmall = useMediaQuery('(max-width:1250px)')
  return (
    <Stack
      direction="row"
      {...(isMobile && { height: Sizing.md.mobile })}
      sx={{ gap: Spacing.xs, alignItems: 'center' }}
    >
      <ChainIcon blockchainId={chain} />
      {useLLv2() && (
        <MarketBadge label={marketVersionLabel[version]} data-testid={`market-version-${type.toLowerCase()}`} />
      )}
      <Tooltip title={marketTypeDetails[type].description}>
        <MarketBadge label={marketTypeDetails[type].label} data-testid={`market-type-${type.toLowerCase()}`} />
      </Tooltip>
      {leverage && isMobile && <Typography variant="bodyXsBold">🔥</Typography>}
      {deprecatedMessage && (
        <Tooltip title={deprecatedMessage}>
          <Typography variant="bodyXsRegular" color="warning" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ExclamationTriangleIcon fontSize="small" />
            {!isSmall && t`Deprecated`}
          </Typography>
        </Tooltip>
      )}
      <FavoriteMarketButton address={favoriteKey} desktopOnly />
    </Stack>
  )
}

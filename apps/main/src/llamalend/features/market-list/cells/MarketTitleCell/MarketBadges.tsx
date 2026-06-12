import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Stack from '@mui/material/Stack'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
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
  const { favoriteKey, type, deprecatedMessage, chain, version } = market
  return (
    <Stack
      direction="row"
      sx={{ gap: Spacing.xs, alignItems: 'center', ...(isMobile && { height: Sizing.md.mobile }) }}
    >
      <ChainIcon blockchainId={chain} />
      {useLLv2() && <MarketBadge label={marketVersionLabel[version]} data-testid={`badge-market-version-${version}`} />}
      <Tooltip title={marketTypeDetails[type].description}>
        <MarketBadge label={marketTypeDetails[type].label} data-testid={`badge-market-type-${type}`} />
      </Tooltip>
      {deprecatedMessage && (
        <Tooltip title={deprecatedMessage}>
          <MarketBadge label={t`Deprecated`} color="warning" />
        </Tooltip>
      )}
      {!isMobile && <FavoriteMarketButton address={favoriteKey} desktopOnly />}
    </Stack>
  )
}

import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Stack from '@mui/material/Stack'
import { t } from '@evm-ui/lib/i18n'
import { ChainIcon } from '@evm-ui/shared/icons/ChainIcon'
import { Badge, BadgeProps } from '@evm-ui/shared/ui/Badge'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MarketType, MarketVersion } from '@evm-ui/types/market'
import { FavoriteMarketButton } from '../../chips/FavoriteMarketButton'

const { Spacing, Sizing } = SizesAndSpaces

const marketTypeDetails: Record<MarketType, { label: string; description: string }> = {
  [MarketType.Lend]: {
    label: t`Lend`,
    description: t`Lending markets let users earn by lending assets or borrow using collateral.`,
  },
  [MarketType.Mint]: {
    label: t`Mint`,
    description: t`Mint markets lets users borrow by minting crvUSD against collateral.`,
  },
}

const marketVersionLabel: Record<MarketVersion, string> = {
  [MarketVersion.v1]: t`V1`,
  [MarketVersion.v2]: t`V2`,
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
      <MarketBadge label={marketVersionLabel[version]} data-testid={`badge-market-version-${version}`} />
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

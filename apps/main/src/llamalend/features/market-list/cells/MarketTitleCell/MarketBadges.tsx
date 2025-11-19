import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { FavoriteMarketButton } from '../../chips/FavoriteMarketButton'

const { Spacing, Sizing } = SizesAndSpaces

const poolTypeNames: Record<LlamaMarketType, () => string> = {
  [LlamaMarketType.Lend]: () => t`Lend`,
  [LlamaMarketType.Mint]: () => t`Mint`,
}

const poolTypeTooltips: Record<LlamaMarketType, () => string> = {
  [LlamaMarketType.Lend]: () => t`Lending markets let users earn by lending assets or borrow using collateral.`,
  [LlamaMarketType.Mint]: () => t`Mint markets lets users borrow by minting crvUSD against collateral.`,
}

/** Displays badges for a pool, such as the chain icon and the pool type. */
export const MarketBadges = ({ market, isMobile }: { market: LlamaMarket; isMobile: boolean }) => {
  const { address, type, leverage, deprecatedMessage } = market
  const isSmall = useMediaQuery('(max-width:1250px)')
  const { isCollateralEroded } = useUserMarketStats(market)?.data ?? {}
  return (
    <Stack direction="row" gap={Spacing.sm} alignItems="center" {...(isMobile && { height: Sizing.md.mobile })}>
      <Tooltip title={poolTypeTooltips[type]()}>
        <Chip
          size="extraSmall"
          color="default"
          label={poolTypeNames[type]()}
          data-testid={`pool-type-${type.toLowerCase()}`}
        />
      </Tooltip>

      {leverage > 0 && (
        <Tooltip title={t`How much you can leverage your position`}>
          {isMobile ? (
            <Typography variant="bodyXsRegular">🔥</Typography>
          ) : (
            <Chip
              size="extraSmall"
              color="highlight"
              label={t`🔥 ${leverage.toPrecision(2)}x ${isSmall ? '' : t`leverage`}`}
            />
          )}
        </Tooltip>
      )}

      {deprecatedMessage && (
        <Tooltip title={deprecatedMessage}>
          <Typography variant="bodyXsRegular" color="warning" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isSmall && t`Deprecated`}
            <ExclamationTriangleIcon />
          </Typography>
        </Tooltip>
      )}

      {isCollateralEroded && (
        <Tooltip title={t`Your position is eroded`}>
          <Chip label={t`Collateral erosion`} color="alert" size="extraSmall" />
        </Tooltip>
      )}

      <FavoriteMarketButton address={address} desktopOnly />
    </Stack>
  )
}

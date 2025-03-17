import RouterLink from 'next/link'
import { MarketBadges } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/MarketBadges'
import { MarketWarnings } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/MarketWarnings'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import MuiLink from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { ClickableInRowClass, DesktopOnlyHoverClass } from '@ui-kit/shared/ui/DataTable'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const MarketTitleCell = ({ row: { original: market } }: CellContext<LlamaMarket, LlamaMarket['assets']>) => (
  <Stack direction="row" gap={Spacing.sm} alignItems="center">
    <TokenPair chain={market.chain} assets={market.assets} />
    <Stack direction="column" gap={Spacing.xs}>
      <MarketBadges market={market} />
      <Typography component={Stack} variant="tableCellL" direction="row" gap={2}>
        <MuiLink
          color="inherit"
          underline="none"
          href={market.url}
          {...(!market.url.startsWith('http') && { component: RouterLink })}
          className={ClickableInRowClass}
          data-testid={`market-link-${market.address}`}
        >
          {market.assets.collateral.symbol} - {market.assets.borrowed.symbol}
        </MuiLink>
        <CopyIconButton
          className={`${DesktopOnlyHoverClass} ${ClickableInRowClass}`}
          label={t`Copy market address`}
          copyText={market.address}
          confirmationText={t`Market address copied`}
          data-testid={`copy-market-address-${market.address}`}
        />
      </Typography>
      <MarketWarnings market={market} />
    </Stack>
  </Stack>
)

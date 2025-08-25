import { MouseEvent } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { ClickableInRowClass, DesktopOnlyHoverClass } from '@ui-kit/shared/ui/DataTable'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketBadges } from './MarketBadges'

const { Spacing } = SizesAndSpaces

export const MarketTitleCell = ({ row: { original: market } }: CellContext<LlamaMarket, LlamaMarket['assets']>) => {
  const isMobile = useIsMobile()
  return (
    <Stack direction="row" gap={Spacing.sm} alignItems="center" sx={{ height: Sizing[700] }}>
      <TokenPair
        chain={market.chain}
        assets={{ primary: market.assets.collateral, secondary: market.assets.borrowed }}
      />
      <Stack direction="column" justifyContent="center" gap={Spacing.xxs}>
        <Typography
          component={Stack}
          alignItems="center"
          variant={isMobile ? 'tableCellMBold' : 'tableCellL'}
          direction="row"
          gap={2}
        >
          <RouterLink
            color="inherit"
            underline="none"
            href={market.url}
            className={ClickableInRowClass}
            data-testid={`market-link-${market.address}`}
            {...(isMobile && {
              // cancel click on mobile so the panel can open, there is a separate button for navigating
              onClick: (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
            })}
            sx={{
              // for very small screens, truncate the text and limit to a maximum width
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '40vw', // make sure the other column will fit in small screens
              paddingBlock: { mobile: '5px', tablet: 0 },
            }}
          >
            {market.assets.collateral.symbol} &bull; {market.assets.borrowed.symbol}
          </RouterLink>
          <CopyIconButton
            className={`${DesktopOnlyHoverClass} ${ClickableInRowClass}`}
            label={t`Copy market address`}
            copyText={market.address}
            confirmationText={t`Market address copied`}
            data-testid={`copy-market-address-${market.address}`}
            sx={{ display: { mobile: 'none', tablet: 'flex' } }}
          />
        </Typography>
        <MarketBadges market={market} isMobile={isMobile} />
      </Stack>
    </Stack>
  )
}

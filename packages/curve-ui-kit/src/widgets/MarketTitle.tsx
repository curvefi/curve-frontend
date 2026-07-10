import { MouseEvent, type ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { CopyIconButton } from '../shared/ui/CopyIconButton'
import { CLICKABLE_IN_ROW_CLASS, DESKTOP_ONLY_HOVER_CLASS } from '../shared/ui/DataTable/data-table.utils'
import { RouterLink } from '../shared/ui/RouterLink'
import { responsiveTitleEllipsisSx } from '../shared/ui/titleTruncate'

export function MarketTitle({
  address,
  title,
  url,
  addressLabel = t`Market`,
}: {
  address: Address
  title: ReactNode
  url: string
  addressLabel?: string
}) {
  const isMobile = useIsMobile()
  return (
    <Typography
      component={Stack}
      variant={isMobile ? 'tableCellMBold' : 'tableCellL'}
      direction="row"
      sx={{ alignItems: 'center', gap: 2 }}
    >
      <RouterLink
        color="inherit"
        underline="none"
        href={url}
        className={CLICKABLE_IN_ROW_CLASS}
        data-testid={`market-link-${address}`}
        {...(isMobile && {
          // cancel click on mobile so the panel can open, there is a separate button for navigating
          onClick: (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        })}
        sx={{
          // for very small screens, truncate the text and limit to a maximum width
          ...responsiveTitleEllipsisSx,
          paddingBlock: { mobile: '5px', tablet: 0 },
        }}
      >
        {title}
      </RouterLink>
      <CopyIconButton
        className={`${DESKTOP_ONLY_HOVER_CLASS} ${CLICKABLE_IN_ROW_CLASS}`}
        label={t`Copy ${addressLabel} address`}
        copyText={address}
        confirmationText={t`${addressLabel} address copied`}
        data-testid={`copy-market-address-${address}`}
        sx={{ display: { mobile: 'none', tablet: 'flex' } }}
      />
    </Typography>
  )
}

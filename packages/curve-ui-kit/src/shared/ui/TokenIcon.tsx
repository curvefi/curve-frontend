import type { ImgHTMLAttributes } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getImageBaseUrl } from '@ui/utils/utilsConstants'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'

const DEFAULT_IMAGE = '/images/default-crypto.png'

const { Spacing, IconSize } = SizesAndSpaces

type Size = 'sm' | 'mui-sm' | 'mui-md' | 'xl'
const LABEL_SPACING = {
  sm: 'xs',
  'mui-sm': 'xs',
  'mui-md': 'xs',
  xl: 'sm',
} satisfies Record<Size, keyof typeof Spacing>

export interface TokenIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  blockchainId?: string
  tooltip?: string
  address?: string | null
  size?: 'sm' | 'mui-sm' | 'mui-md' | 'xl'
  label?: string
  sx?: SxProps
}

export const TokenIcon = ({
  className = '',
  blockchainId = '',
  tooltip = '',
  size = 'sm',
  address,
  label,
  sx,
}: TokenIconProps) => (
  <Stack direction="row" gap={Spacing[LABEL_SPACING[size]]} alignItems="center">
    <Tooltip title={tooltip} placement="top">
      <Box
        component="img"
        data-testid={`token-icon-${tooltip}`}
        className={`${className}`}
        alt={tooltip}
        onError={({ currentTarget }) => {
          currentTarget.src = DEFAULT_IMAGE
        }}
        src={address ? `${getImageBaseUrl(blockchainId ?? '')}${address.toLowerCase()}.png` : DEFAULT_IMAGE}
        loading="lazy"
        sx={(theme) => ({
          borderRadius: '50%',
          // The original 'sm' size with a 400 breakpoint is a remainder from legacy code.
          // I didn't want to break the existing interface as it's used everywhere.
          ...(size === 'sm' && {
            width: '1.75rem',
            height: '1.75rem',
            [theme.breakpoints.down(400)]: {
              width: '1.5rem',
              height: '1.5rem',
            },
          }),
          ...(size === 'mui-sm' && handleBreakpoints({ width: IconSize['sm'], height: IconSize['sm'] })),
          ...(size === 'mui-md' && handleBreakpoints({ width: IconSize['md'], height: IconSize['md'] })),
          ...(size === 'xl' && handleBreakpoints({ width: IconSize['xl'], height: IconSize['xl'] })),
          ...applySxProps(sx, theme),
        })}
      />
    </Tooltip>

    {label && (
      // Lineheight is unset, as setting the line height to a certain size (as is default ehavior for Typography)
      // causes the text not to be perfectly centered vertically for unknown reason. Setting the 'vertical-align'
      // property to 'middle' does not appear to fix it, only unsetting the lineheight does.
      <Typography variant="bodyMBold" sx={{ '&': { lineHeight: 'unset' } }}>
        {label}
      </Typography>
    )}
  </Stack>
)

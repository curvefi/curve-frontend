import type { ImgHTMLAttributes } from 'react'
import Box from '@mui/material/Box'
import type { SystemStyleObject, Theme } from '@mui/system' // Can't use SxProps for some reason inside an sx *function*
import { getImageBaseUrl } from '@ui/utils/utilsConstants'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const DEFAULT_IMAGE = '/images/default-crypto.png'

const { IconSize } = SizesAndSpaces

export interface TokenIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  blockchainId?: string
  tooltip?: string
  address?: string | null
  size?: 'sm' | 'mui-sm' | 'mui-md' | 'xl'
  sx?: SystemStyleObject<Theme>
}

export const TokenIcon = ({
  className = '',
  blockchainId = '',
  tooltip = '',
  size = 'sm',
  address,
  sx,
}: TokenIconProps) => (
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
        border: '1px solid transparent',
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
        ...sx,
      })}
    />
  </Tooltip>
)

import type { ImgHTMLAttributes } from 'react'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import type { SystemStyleObject, Theme } from '@mui/system' // Can't use SxProps for some reason inside an sx *function*
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getImageBaseUrl } from '@ui/utils/utilsConstants'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'

const DEFAULT_IMAGE = '/images/default-crypto.png'

const { IconSize } = SizesAndSpaces

const getResponsiveSize = (t: Theme, size: 'sm' | 'md' | 400) => {
  // The original "400" is a remainder from legacy code.
  // I didn't want to break the existing interface as it's used everywhere.
  if (size === 400) {
    return {
      width: '1.75rem',
      height: '1.75rem',
      [t.breakpoints.down(400)]: {
        width: '1.5rem',
        height: '1.5rem',
      },
    }
  }

  return handleBreakpoints({ width: IconSize[size], height: IconSize[size] })
}

export interface TokenIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  blockchainId: string
  symbol: string
  address?: string | null
  size?: 'sm' | 'mui-sm' | 'mui-md' | ''
  sx?: SystemStyleObject<Theme>
}

export const TokenIcon = ({ className = '', blockchainId, symbol, size = 'sm', address, sx }: TokenIconProps) => (
  <Tooltip
    title={symbol}
    placement="top"
    PopperProps={{
      sx: {
        userSelect: 'none',
        pointerEvents: 'none',
      },
    }}
  >
    <Box
      component="img"
      data-testid={`token-icon-${symbol}`}
      className={`${className} ${size}`}
      alt={symbol}
      onError={({ currentTarget }) => {
        currentTarget.src = DEFAULT_IMAGE
      }}
      src={address ? `${getImageBaseUrl(blockchainId ?? '')}${address.toLowerCase()}.png` : DEFAULT_IMAGE}
      loading="lazy"
      sx={(theme) => ({
        border: '1px solid transparent',
        borderRadius: '50%',
        height: '1.625rem',
        width: '1.625rem',
        '&.sm': getResponsiveSize(theme, 400),
        '&.mui-sm': getResponsiveSize(theme, 'sm'),
        '&.mui-md': getResponsiveSize(theme, 'md'),
        ...sx,
      })}
    />
  </Tooltip>
)

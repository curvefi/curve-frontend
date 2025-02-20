import type { ImgHTMLAttributes } from 'react'
import { Box, type Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getImageBaseUrl } from '@ui/utils/utilsConstants'

const DEFAULT_IMAGE = '/images/default-crypto.png'

const { IconSize } = SizesAndSpaces

const getResponsiveSize = (t: Theme, size: 'sm' | 'md' | 400) => {
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

  return {
    width: IconSize[size].mobile,
    height: IconSize[size].mobile,
    [t.breakpoints.up('tablet')]: {
      width: IconSize[size].tablet,
      height: IconSize[size].tablet,
    },
    [t.breakpoints.up('desktop')]: {
      width: IconSize[size].desktop,
      height: IconSize[size].desktop,
    },
  }
}

export interface TokenIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  blockchainId: string
  token: string
  address?: string | null
  size?: 'sm' | 'mui-sm' | 'mui-md' | ''
  sx?: SystemStyleObject<Theme>
}

export function TokenIcon({ className = '', blockchainId, token, size = 'sm', address, sx }: TokenIconProps) {
  const src = address ? `${getImageBaseUrl(blockchainId ?? '')}${address.toLowerCase()}.png` : DEFAULT_IMAGE

  return (
    <Box
      component="img"
      data-testid={`token-icon-${token}`}
      className={`${className} ${size}`}
      alt={token}
      onError={({ currentTarget }) => {
        currentTarget.src = DEFAULT_IMAGE
      }}
      src={src}
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
  )
}

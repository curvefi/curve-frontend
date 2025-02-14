import type { ImgHTMLAttributes } from 'react'
import { Box, type Theme } from '@mui/material'
import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'

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
  imageBaseUrl: string | null
  token: string
  address?: string | null
  size?: 'sm' | 'mui-sm' | 'mui-md' | ''
}

export function TokenIcon({ className = '', imageBaseUrl, token, size = 'sm', address }: TokenIconProps) {
  const src = address && imageBaseUrl ? `${imageBaseUrl}${address.toLowerCase()}.png` : DEFAULT_IMAGE

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
      sx={(t) => ({
        border: '1px solid transparent',
        borderRadius: '50%',
        height: '1.625rem',
        width: '1.625rem',
        '&.sm': getResponsiveSize(t, 400),
        '&.mui-sm': getResponsiveSize(t, 'sm'),
        '&.mui-md': getResponsiveSize(t, 'md'),
      })}
    />
  )
}

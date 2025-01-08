import type { ImgHTMLAttributes } from 'react'

import React, { useMemo } from 'react'
import Image from 'next/image'
import styled from 'styled-components'
import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { basicMuiTheme } from 'curve-ui-kit/src/themes/basic-theme'

type Size = 'sm' | 'mui-sm' | 'mui-md' | ''

export interface TokenIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  imageBaseUrl: string | null
  token: string
  address?: string | null
  size?: Size
  storedSrc?: string | null
  setTokenImage: (tokenAddress: string, src: string | null) => void
}

const DEFAULT_IMAGE = '/images/default-crypto.png'

function TokenIcon({
  className = '',
  imageBaseUrl,
  token,
  size = 'sm',
  address,
  storedSrc,
  setTokenImage,
}: TokenIconProps) {
  const img = useMemo(() => {
    if (!address || !imageBaseUrl) return { src: DEFAULT_IMAGE, address: '' }

    let src = storedSrc
    if (src === null) src = DEFAULT_IMAGE // if null, it means the image src is bad
    if (src === undefined) src = `${imageBaseUrl}${address?.toLowerCase()}.png`

    return { address, src }
  }, [address, imageBaseUrl, storedSrc])

  const handleOnError = (evt: React.SyntheticEvent<HTMLImageElement, Event>, address: string) => {
    ;(evt.target as HTMLImageElement).src = DEFAULT_IMAGE
    setTokenImage(address, null)
  }

  return (
    <Icon
      data-testid={`token-icon-${token}`}
      className={`${className} ${size}`}
      alt={token}
      onError={(evt) => setTimeout(() => handleOnError(evt, img.address), 0)}
      src={img.src}
      loading="lazy"
      width="26"
      height="26"
    />
  )
}

const { IconSize } = SizesAndSpaces

const Icon = styled(Image)`
  height: 1.625rem;
  width: 1.625rem;

  border: 1px solid transparent;
  border-radius: 50%;

  &.sm {
    width: 1.75rem;
    height: 1.75rem;
  }

  @media (max-width: 400px) {
    &.sm {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  &.mui-sm {
    width: ${IconSize.sm.mobile};
    height: ${IconSize.sm.mobile};
  }
  &.mui-md {
    width: ${IconSize.md.mobile};
    height: ${IconSize.md.mobile};
  }
  ${basicMuiTheme.breakpoints.up('tablet')} {
    &.mui-sm {
      width: ${IconSize.sm.tablet};
      height: ${IconSize.sm.tablet};
    }
    &.mui-md {
      width: ${IconSize.md.tablet};
      height: ${IconSize.md.tablet};
    }
  }
  ${basicMuiTheme.breakpoints.up('desktop')} {
    &.mui-sm {
      width: ${IconSize.sm.desktop};
      height: ${IconSize.sm.desktop};
    }
    &.mui-md {
      width: ${IconSize.md.desktop};
      height: ${IconSize.md.desktop};
    }
  }
`

export default TokenIcon

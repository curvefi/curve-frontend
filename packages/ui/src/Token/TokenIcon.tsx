import type { ImgHTMLAttributes } from 'react'

import React, { useMemo } from 'react'
import Image from 'next/image'
import styled from 'styled-components'

type Size = 'sm' | ''

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

const Icon = styled(Image)`
  height: 1.625rem;
  width: 1.625rem;

  border: 1px solid transparent;
  border-radius: 50%;

  &.sm {
    height: 1.75rem;
    width: 1.75rem;
  }

  @media (max-width: 400px) {
    &.sm {
      height: 1.5rem;
      width: 1.5rem;
    }
  }
`

export default TokenIcon

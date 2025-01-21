import type { ImgHTMLAttributes } from 'react'

import React, { useMemo } from 'react'
import styled from 'styled-components'
import useStore from '@dao/store/useStore'
import Image from 'next/image'

type Size = 'sm'

interface TokenIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  imageBaseUrl: string | null
  token: string
  address?: string
  size?: Size
}

const DEFAULT_IMAGE = '/images/default-crypto.png'

function TokenIcon({ className = '', imageBaseUrl, token, size, address }: TokenIconProps) {
  const storedSrc = useStore((state) => state.tokens.tokensImage[address ?? ''])
  const setTokenImage = useStore((state) => state.tokens.setTokenImage)

  const img = useMemo(() => {
    let parsedImg = { src: DEFAULT_IMAGE, address: '' }

    if (address && imageBaseUrl) {
      parsedImg.address = address
      if (typeof storedSrc !== 'undefined') {
        parsedImg.src = storedSrc === null ? DEFAULT_IMAGE : storedSrc
      } else {
        parsedImg.src = `${imageBaseUrl}${address?.toLowerCase()}.png`
      }
    }
    return parsedImg
  }, [address, imageBaseUrl, storedSrc])

  const handleOnError = (evt: React.SyntheticEvent<HTMLImageElement, Event>, address: string) => {
    ;(evt.target as HTMLImageElement).src = DEFAULT_IMAGE
    setTokenImage(address, null)
  }

  return (
    <Icon
      className={`${className} ${size || ''}`}
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

  /* || MODIFIERS */

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

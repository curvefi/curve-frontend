import Image from 'next/image'
import { SyntheticEvent, useState } from 'react'
import styled from 'styled-components'

export type Props = {
  label: string
  src: string
  fallbackSrc: string
}

const SelectNetworkItem = ({ label, src, fallbackSrc }: Props) => {
  const [errorOccurred, setErrorOccurred] = useState(false)

  const handleOnError = (evt: SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string) => {
    if (errorOccurred) return

    setErrorOccurred(true)
    ;(evt.target as HTMLImageElement).src = fallbackSrc
  }

  return (
    <IconWrapper>
      <Image
        alt={label}
        onError={(evt) => handleOnError(evt, fallbackSrc)}
        src={src}
        loading="lazy"
        width="18"
        height="18"
      />
    </IconWrapper>
  )
}

const IconWrapper = styled.span`
  align-items: center;
  display: flex;
  margin-right: 0.25rem;
`

SelectNetworkItem.displayName = 'SelectNetworkItem'
export default SelectNetworkItem

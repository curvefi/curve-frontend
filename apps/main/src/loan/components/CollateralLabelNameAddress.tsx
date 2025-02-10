import type { AriaButtonProps } from 'react-aria'

import { useButton } from 'react-aria'
import { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils/responsive'
import { copyToClipboard, shortenTokenAddress } from '@/loan/utils/helpers'

import Icon from '@ui/Icon'

interface ButtonProps extends AriaButtonProps {
  className?: string
}

const Button = ({ className, ...props }: ButtonProps) => {
  let ref = useRef(null)
  let { buttonProps, isPressed } = useButton(props, ref)
  let { children } = props

  return (
    <ChipPoolCopyButton className={`${className} ${isPressed ? 'isPressed' : ''}`} {...buttonProps} ref={ref}>
      {children}
    </ChipPoolCopyButton>
  )
}

const ChipPoolCopyButton = styled.button`
  margin-right: 2px;
  color: inherit;
  background: transparent;
  cursor: pointer;

  &.isPressed {
    color: white;
    background-color: var(--primary-400);
  }
`

interface ChipPoolProps extends AriaButtonProps {
  className?: string
  displayName: string
  displayAddress: string
  isHighlightName?: boolean // highlight name if it is part of pool list search result
  isHighlightAddress?: boolean
  amount?: string
  showUsdAmount?: boolean // display amount instead of token name
}

const CollateralLabelNameAddress = ({
  className,
  isHighlightName,
  isHighlightAddress,
  displayName,
  displayAddress,
  ...props
}: ChipPoolProps) => {
  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
    console.log(`Copied ${address}`)
  }

  const parsedName = useMemo(() => {
    if (displayName && displayName.length > 24) {
      return `${displayName.slice(0, 18)}...`
    }
    return displayName
  }, [displayName])

  const parsedAddress = useMemo(() => {
    if (displayAddress) {
      return `${shortenTokenAddress(displayAddress)}`
    }
    return displayAddress
  }, [displayAddress])

  return (
    <ChipWrapper className={className}>
      <ChipName>{isHighlightName || isHighlightAddress ? <mark>{parsedName}</mark> : parsedName} </ChipName>
      <ChipAdditionalInfo>
        <Button {...props} onPress={() => handleCopyClick(displayAddress)}>
          <ChipAddress>{isHighlightAddress ? <mark>{parsedAddress}</mark> : parsedAddress}</ChipAddress>
          <ChipCopyButtonIcon name="Copy" size={16} />
        </Button>
      </ChipAdditionalInfo>
    </ChipWrapper>
  )
}

const ChipAdditionalInfo = styled.span`
  align-items: center;
  display: inline-flex;
  max-width: 0;
  transition: max-width 1s;
  white-space: nowrap;
  overflow: hidden;
`

const ChipWrapper = styled.span`
  min-height: 21px;
  border: 1px solid transparent;

  &:hover {
    border-color: lightgray;

    ${ChipAdditionalInfo} {
      max-width: 18.75rem; // 300px
    }
  }
`

const ChipAddress = styled.span`
  margin-right: 2px;
  font-family: var(--font-mono);
  font-size: var(--font-size-2);
`

const ChipName = styled.span`
  font-size: var(--font-size-4);
  font-weight: bold;

  @media (min-width: ${breakpoints.sm}rem) {
    font-size: 1.25rem; // 20px
  }
`

const ChipCopyButtonIcon = styled(Icon)`
  position: relative;
  top: 2px;
`

export default CollateralLabelNameAddress

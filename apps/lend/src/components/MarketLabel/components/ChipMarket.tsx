import type { AriaButtonProps } from 'react-aria'

import { useButton } from 'react-aria'
import { useRef } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { copyToClipboard, shortenTokenAddress } from '@/utils/helpers'

import Icon from '@/ui/Icon'
import TextEllipsis from '@/ui/TextEllipsis'

const CopyButton = ({
  className = '',
  ...props
}: AriaButtonProps & {
  className?: string
}) => {
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

const ChipMarket = ({
  className,
  isMobile,
  isHighlightLabelName,
  isHighlightLabelAddress,
  label,
  labelAddress,
  ...props
}: AriaButtonProps & {
  className?: string
  isMobile?: boolean
  isHighlightLabelName?: boolean // highlight name if it is part of pool list search result
  isHighlightLabelAddress?: boolean
  amount?: string
  showUsdAmount?: boolean // display amount instead of token name
  label: string | React.ReactNode
  labelAddress: string
}) => {
  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
    console.log(`Copied ${address}`)
  }

  const shortenLabelAddress = shortenTokenAddress(labelAddress)

  return (
    <Wrapper className={className} isMobile={isMobile}>
      <Label isMobile={isMobile}>
        {isHighlightLabelName || isHighlightLabelAddress ? <mark>{label}</mark> : label}
      </Label>
      {!isMobile && (
        <HoveredContent>
          <CopyButton {...props} onPress={() => handleCopyClick(labelAddress)}>
            <MarketAddress>
              {isHighlightLabelAddress ? <mark>{shortenLabelAddress}</mark> : shortenLabelAddress}
            </MarketAddress>
            <CopyButtonIcon name="Copy" size={16} />
          </CopyButton>
        </HoveredContent>
      )}
    </Wrapper>
  )
}

const HoveredContent = styled.span`
  align-items: center;
  display: inline-flex;
  max-width: 0;
  transition: max-width 1s;
  white-space: nowrap;
  overflow: hidden;
`

const Wrapper = styled.span<{ isMobile?: boolean }>`
  display: inherit;
  min-height: 25px;
  border: 1px solid transparent;

  ${({ isMobile }) => {
    if (!isMobile) {
      return `
        :hover {
          border-color: lightgray;
      
          ${HoveredContent} {
            max-width: 18.75rem; // 300px
          }
        }
      `
    }
  }}
`

const MarketAddress = styled.span`
  margin-right: 2px;
  font-family: var(--font-mono);
  font-size: var(--font-size-2);
`

const Label = styled(TextEllipsis)<{ isMobile?: boolean }>`
  font-size: var(--font-size-4);
  font-weight: bold;
  ${({ isMobile }) => isMobile && `max-width: 11.875rem;`}; // 190px

  @media (min-width: ${breakpoints.sm}rem) {
    font-size: 1.25rem; // 20px
    max-width: 13.75rem; // 220px
  }
  @media (min-width: ${breakpoints.lg}rem) {
    max-width: 13.125rem; // 210px
  }
`

const CopyButtonIcon = styled(Icon)`
  position: relative;
  top: 2px;
`

export default ChipMarket

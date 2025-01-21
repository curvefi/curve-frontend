import type { AriaButtonProps } from 'react-aria'

import { useButton } from 'react-aria'
import { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils/responsive'
import { copyToClipboard, shortenTokenAddress } from '@lend/utils/helpers'
import Icon from '@ui/Icon'

interface ButtonProps extends AriaButtonProps {
  className?: string
}

const Button = ({ className = '', ...props }: ButtonProps) => {
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
  isHighlightPoolName?: boolean // highlight name if it is part of pool list search result
  isHighlightPoolAddress?: boolean
  amount?: string
  showUsdAmount?: boolean // display amount instead of token name
  poolName: string
  poolAddress: string
}

const ChipCollateral = ({
  className,
  isHighlightPoolName,
  isHighlightPoolAddress,
  poolName,
  poolAddress,
  ...props
}: ChipPoolProps) => {
  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
    console.log(`Copied ${address}`)
  }

  const parsedPoolName = useMemo(() => {
    if (poolName && poolName.length > 24) {
      return `${poolName.slice(0, 18)}...`
    }
    return poolName
  }, [poolName])

  const parsedPoolAddress = useMemo(() => {
    if (poolAddress) {
      return `${shortenTokenAddress(poolAddress)}`
    }
    return poolAddress
  }, [poolAddress])

  return (
    <ChipPoolWrapper className={className}>
      <ChipPoolName>
        {isHighlightPoolName || isHighlightPoolAddress ? <mark>{parsedPoolName}</mark> : parsedPoolName}{' '}
      </ChipPoolName>
      <ChipPoolAdditionalInfo>
        <Button {...props} onPress={() => handleCopyClick(poolAddress)}>
          <ChipPoolAddress>
            {isHighlightPoolAddress ? <mark>{parsedPoolAddress}</mark> : parsedPoolAddress}
          </ChipPoolAddress>
          <ChipPoolCopyButtonIcon name="Copy" size={16} />
        </Button>
      </ChipPoolAdditionalInfo>
    </ChipPoolWrapper>
  )
}

const ChipPoolAdditionalInfo = styled.span`
  align-items: center;
  display: inline-flex;
  max-width: 0;
  transition: max-width 1s;
  white-space: nowrap;
  overflow: hidden;
`

const ChipPoolWrapper = styled.span`
  min-height: 21px;
  border: 1px solid transparent;

  :hover {
    border-color: lightgray;

    ${ChipPoolAdditionalInfo} {
      max-width: 18.75rem; // 300px
    }
  }
`

const ChipPoolAddress = styled.span`
  margin-right: 2px;
  font-family: var(--font-mono);
  font-size: var(--font-size-2);
`

const ChipPoolName = styled.span`
  font-size: var(--font-size-4);
  font-weight: bold;

  @media (min-width: ${breakpoints.sm}rem) {
    font-size: 1.25rem; // 20px
  }
`

const ChipPoolCopyButtonIcon = styled(Icon)`
  position: relative;
  top: 2px;
`

export default ChipCollateral

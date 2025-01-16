import type { AriaButtonProps } from 'react-aria'

import { useButton } from 'react-aria'
import { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { copyToClipboard } from '@/dex/lib/utils'
import { shortenTokenAddress } from '@/dex/utils'

import Icon from '@/ui/Icon'
import TextEllipsis from '@/ui/TextEllipsis'

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
  isHighlightPoolName?: boolean // highlight name if it is part of pool list search result
  isHighlightPoolAddress?: boolean
  amount?: string
  showUsdAmount?: boolean // display amount instead of token name
  poolName: string
  poolAddress: string
}

const ChipPool = ({
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

  const parsedPoolAddress = useMemo(() => {
    if (poolAddress) {
      return `${shortenTokenAddress(poolAddress)}`
    }
    return poolAddress
  }, [poolAddress])

  return (
    <ChipPoolWrapper className={className}>
      <ChipPoolName>
        {isHighlightPoolName || isHighlightPoolAddress ? <strong>{poolName}</strong> : poolName}{' '}
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
  display: inherit;
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

const ChipPoolName = styled(TextEllipsis)`
  font-size: var(--font-size-4);

  @media (min-width: ${breakpoints.sm}rem) {
    font-size: 1.25rem; // 20px
    max-width: 13.75rem; // 220px
  }
  @media (min-width: ${breakpoints.lg}rem) {
    max-width: 13.125rem; // 210px
  }
`

const ChipPoolCopyButtonIcon = styled(Icon)`
  position: relative;
  top: 2px;
`

export default ChipPool

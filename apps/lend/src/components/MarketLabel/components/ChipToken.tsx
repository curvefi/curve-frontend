import Icon from '@/ui/Icon'
import Spinner from '@/ui/Spinner'
import { formatNumberUsdRate } from '@/ui/utils'
import { useMemo, useRef } from 'react'
import type { AriaButtonProps } from 'react-aria'

import { useButton } from 'react-aria'
import styled from 'styled-components'
import useStore from '@/store/useStore'

import { copyToClipboard } from '@/utils/helpers'


const Button = ({
  className = '',
  ...props
}: AriaButtonProps & {
  className?: string
}) => {
  let ref = useRef(null)
  let { buttonProps, isPressed } = useButton(props, ref)
  let { children } = props

  return (
    <ChipTokenCopyButton className={`${className} ${isPressed ? 'isPressed' : ''}`} {...buttonProps} ref={ref}>
      {children}
    </ChipTokenCopyButton>
  )
}

const ChipTokenCopyButton = styled.button`
  margin-left: 2px;
  color: inherit;
  background: transparent;
  cursor: pointer;

  &.isPressed {
    color: white;
    background-color: var(--primary-400);
  }
`

const ChipToken = ({
  className,
  isHighlight,
  tokenName,
  tokenAddress,
  ...props
}: AriaButtonProps & {
  className?: string
  isHighlight?: boolean // highlight name if it is part of pool list search result
  amount?: string
  showUsdAmount?: boolean // display amount instead of token name
  tokenName: string
  tokenAddress: string
}) => {
  const api = useStore((state) => state.api)
  const usdRate = useStore((state) => state.usdRates.tokens[tokenAddress])
  const fetchUsdRateByToken = useStore((state) => state.usdRates.fetchUsdRateByToken)
  const parsedUsdRate = formatNumberUsdRate(usdRate)

  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
    console.log(`Copied ${address}`)
  }

  const handleMouseEnter = (foundUsdRate?: string) => {
    if (!foundUsdRate && api) {
      fetchUsdRateByToken(api, tokenAddress)
    }
  }

  const parsedTokenName = useMemo(() => {
    if (tokenName && tokenName.length > 10) {
      return `${tokenName.slice(0, 5)}...`
    }
    return tokenName
  }, [tokenName])

  return (
    <ChipTokenWrapper className={className} onMouseEnter={() => handleMouseEnter(parsedUsdRate)}>
      <span>{isHighlight ? <mark>{parsedTokenName}</mark> : parsedTokenName} </span>
      <ChipTokenAdditionalInfo>
        <Button {...props} onPress={() => handleCopyClick(tokenAddress)}>
          <ChipTokenUsdRate>{typeof usdRate === 'undefined' ? <Spinner size={10} /> : parsedUsdRate}</ChipTokenUsdRate>
          <ChipTokenCopyButtonIcon name="Copy" size={16} />
        </Button>
      </ChipTokenAdditionalInfo>
    </ChipTokenWrapper>
  )
}

const ChipTokenAdditionalInfo = styled.span`
  align-items: center;
  max-width: 0;
  transition: max-width 1s;
  white-space: nowrap;
  overflow: hidden;
`

const ChipTokenWrapper = styled.span`
  align-items: center;
  display: inline-flex;
  min-height: 24px;
  padding: 0 1px;
  border: 1px solid transparent;
  font-size: var(--font-size-2);

  :hover {
    margin-right: 4px;
    border-color: lightgray;

    ${ChipTokenAdditionalInfo} {
      max-width: 18.75rem; // 300px
    }
  }
`

const ChipTokenUsdRate = styled.span`
  margin: 0 2px;
  position: relative;
  top: -2px;
  font-size: var(--font-size-1);
  font-weight: bold;
`

const ChipTokenCopyButtonIcon = styled(Icon)`
  position: relative;
  top: 1px;
  margin: 0 2px;
`

ChipToken.defaultProps = {
  className: '',
}

export default ChipToken

import { useCallback, useMemo, useRef, useState } from 'react'
import type { AriaButtonProps } from 'react-aria'
import { useButton } from 'react-aria'
import { styled } from 'styled-components'
import { useChainId } from 'wagmi'
import Icon from '@ui/Icon'
import Spinner from '@ui/Spinner'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { fetchTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { copyToClipboard } from '@ui-kit/utils'

interface ButtonProps extends AriaButtonProps {
  className?: string
}

const Button = ({ className, ...props }: ButtonProps) => {
  const ref = useRef(null)
  const { buttonProps, isPressed } = useButton(props, ref)
  const { children } = props
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

interface ChipTokenProps extends AriaButtonProps {
  className?: string
  isHighlight?: boolean // highlight name if it is part of pool list search result
  amount?: string
  showUsdAmount?: boolean // display amount instead of token name
  tokenName: string
  tokenAddress: string
}

const ChipToken = ({ className, isHighlight, tokenName, tokenAddress, ...props }: ChipTokenProps) => {
  const chainId = useChainId()
  const [usdRate, setUsdRate] = useState<number | undefined>(undefined)
  const parsedUsdRate = formatNumber(usdRate, { ...FORMAT_OPTIONS.USD, defaultValue: '-' })

  const handleMouseEnter = useCallback(() => {
    if (typeof usdRate === 'undefined') {
      void fetchTokenUsdRate({ chainId, tokenAddress }).then(setUsdRate)
    }
  }, [usdRate, chainId, tokenAddress])

  const parsedTokenName = useMemo(() => {
    if (tokenName && tokenName.length > 10) {
      return `${tokenName.slice(0, 5)}...`
    }
    return tokenName
  }, [tokenName])

  return (
    <ChipTokenWrapper className={className} onMouseEnter={handleMouseEnter}>
      <span>{isHighlight ? <strong>{parsedTokenName}</strong> : parsedTokenName} </span>
      <ChipTokenAdditionalInfo>
        <Button {...props} onPress={() => copyToClipboard(tokenAddress)}>
          <ChipTokenUsdRate>
            {typeof usdRate === 'undefined' ? <ChipTokenUsdRateSpinner size={10} /> : parsedUsdRate}
          </ChipTokenUsdRate>
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

  &:hover {
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
const ChipTokenUsdRateSpinner = styled(Spinner)`
  position: relative;
  top: 2px;
`

const ChipTokenCopyButtonIcon = styled(Icon)`
  position: relative;
  top: 1px;
  margin: 0 2px;
`

export default ChipToken

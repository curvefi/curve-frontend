import { useCallback, useMemo, useRef, useState } from 'react'
import type { AriaButtonProps } from 'react-aria'
import { useButton } from 'react-aria'
import { styled } from 'styled-components'
import { useChainId } from 'wagmi'
import { Icon } from '@ui/Icon'
import { Spinner } from '@ui/Spinner'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { fetchTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { copyToClipboard, shortenAddress } from '@ui-kit/utils'

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

export const ChipToken = ({ className, isHighlight, tokenName, tokenAddress, ...props }: ChipTokenProps) => {
  const chainId = useChainId()
  const [usdRate, setUsdRate] = useState<number | undefined>(undefined)
  const parsedUsdRate = formatNumber(usdRate, { ...FORMAT_OPTIONS.USD, defaultValue: '-' })

  const handleMouseEnter = useCallback(() => {
    if (usdRate == null) {
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
          <AlignmentWrapper>
            <ChipTokenUsdRate>
              {usdRate == null ? <ChipTokenUsdRateSpinner size={10} /> : parsedUsdRate}
            </ChipTokenUsdRate>
            <ChipTokenAddress>{shortenAddress(tokenAddress)}</ChipTokenAddress>
            <ChipTokenCopyButtonIcon name="Copy" size={16} />
          </AlignmentWrapper>
        </Button>
      </ChipTokenAdditionalInfo>
    </ChipTokenWrapper>
  )
}

const AlignmentWrapper = styled.div`
  display: flex;
  gap: 4px;
  align-items: end;
`
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
const ChipTokenAddress = styled.span`
  font-family: var(--font-mono);
  font-size: var(--font-size-2);
  margin-bottom: 2px;
`

const ChipTokenUsdRate = styled.span`
  font-size: var(--font-size-1);
  font-weight: bold;
  margin-bottom: 2px;
`

const ChipTokenUsdRateSpinner = styled(Spinner)``

const ChipTokenCopyButtonIcon = styled(Icon)`
  margin-bottom: 2px;
`

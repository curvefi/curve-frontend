import { ReactNode } from 'react'
import styled from 'styled-components'
import type { StatsProps } from '@/lend/components/DetailsMarket/styles'
import { StyledStats } from '@/lend/components/DetailsMarket/styles'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { copyToClipboard, shortenTokenAddress } from '@/lend/utils/helpers'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import ExternalLink from '@ui/Link/ExternalLink'

interface Props extends StatsProps {
  chainId: ChainId
  title: ReactNode
  address: string | undefined
}

const DetailInfoAddressLookup = ({ chainId, title, address, ...props }: Props) => {
  const handleBtnClickCopy = (address: string) => {
    console.log(`copied ${address}`)
    copyToClipboard(address)
  }

  const isValidAddress = address ? address !== 'NaN' : true

  return (
    <StyledStats {...props}>
      {typeof title === 'string' ? <Label>{title}</Label> : title}
      {address && (
        <span>
          <StyledExternalLink
            isValid={isValidAddress}
            isMono={isValidAddress}
            isNumber={isValidAddress}
            href={isValidAddress ? networks[chainId]?.scanAddressPath(address) : ''}
          >
            <strong>{address === 'NaN' ? 'no gauge' : shortenTokenAddress(address)}</strong>
            <Icon name="Launch" size={16} />
          </StyledExternalLink>
          <CopyIconButton
            isValid={isValidAddress}
            size="medium"
            onClick={() => (isValidAddress ? handleBtnClickCopy(address) : {})}
          >
            <Icon name="Copy" size={16} />
          </CopyIconButton>
        </span>
      )}
    </StyledStats>
  )
}

const Label = styled.span`
  font-size: var(--font-size-2);
  font-weight: bold;
`

const CopyIconButton = styled(IconButton)<{ isValid: boolean }>`
  align-items: center;
  display: inline-flex;
  padding: var(--spacing-2);

  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;

  &:hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }

  ${({ isValid }) => !isValid && `visibility: hidden;`}
`

const StyledExternalLink = styled(ExternalLink)<{ isValid: boolean }>`
  color: inherit;
  font-size: var(--font-size-2);
  text-transform: inherit;

  svg {
    padding-top: 0.3125rem;
  }

  ${({ isValid }) => {
    if (!isValid) {
      return `
        cursor: initial;
        text-decoration: none;
        &:hover {
          color: inherit;
        }
        
        svg {
          visibility: hidden;
        }
      `
    }
  }}
`

export default DetailInfoAddressLookup

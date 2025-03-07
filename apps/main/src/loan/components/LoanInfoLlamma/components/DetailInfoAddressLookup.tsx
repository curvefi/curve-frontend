import styled from 'styled-components'
import type { StatsProps } from '@/loan/components/LoanInfoLlamma/styles'
import { StyledStats } from '@/loan/components/LoanInfoLlamma/styles'
import networks from '@/loan/networks'
import { ChainId } from '@/loan/types/loan.types'
import { copyToClipboard } from '@/loan/utils/helpers'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import ExternalLink from '@ui/Link/ExternalLink'
import { shortenAddress } from '@ui-kit/utils'

interface Props extends StatsProps {
  chainId: ChainId
  title: string
  address: string
}

const DetailInfoAddressLookup = ({ chainId, title, address, ...props }: Props) => {
  const handleBtnClickCopy = (tokenAddress: string) => {
    copyToClipboard(tokenAddress)
  }

  return (
    <StyledStats {...props}>
      <strong>{title}</strong>
      <span>
        <StyledExternalLink isMono href={networks[chainId]?.scanAddressPath(address)}>
          {shortenAddress(address)}
          <Icon name="Launch" size={16} />
        </StyledExternalLink>
        <CopyIconButton size="medium" onClick={() => handleBtnClickCopy(address)}>
          <Icon name="Copy" size={16} />
        </CopyIconButton>
      </span>
    </StyledStats>
  )
}

const CopyIconButton = styled(IconButton)`
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
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-size: var(--font-size-2);
  text-transform: inherit;

  svg {
    padding-top: 0.3125rem;
  }
`

export default DetailInfoAddressLookup

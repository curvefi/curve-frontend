import { ComponentProps, ReactNode } from 'react'
import { styled } from 'styled-components'
import { StyledIconButton } from '@/dex/components/PagePool/PoolDetails/PoolStats/styles'
import { useNetworkByChain } from '@/dex/entities/networks'
import { ChainId } from '@/dex/types/main.types'
import Icon from '@ui/Icon'
import ExternalLink from '@ui/Link/ExternalLink'
import { scanAddressPath } from '@ui/utils'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { copyToClipboard, ReleaseChannel, shortenAddress } from '@ui-kit/utils'

const ContractComp = ({
  address,
  rChainId,
  label,
  showBottomBorder,
}: {
  address: string
  rChainId: ChainId
  label: ReactNode
  showBottomBorder: boolean
}) => {
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  return (
    <div>
      <InnerWrapper isBorderBottom={showBottomBorder}>
        <Label>{label}</Label>
        <span>
          <StyledExternalLink href={scanAddressPath(network, address)}>
            {shortenAddress(address)}
            <Icon name="Launch" size={16} />
          </StyledExternalLink>
          <StyledIconButton size="medium" onClick={() => copyToClipboard(address)}>
            <Icon name="Copy" size={16} />
          </StyledIconButton>
        </span>
      </InnerWrapper>
    </div>
  )
}

const InnerWrapper = styled.div<{ isBorderBottom?: boolean }>`
  ${({ isBorderBottom }) => {
    if (isBorderBottom) {
      return 'border-bottom: 1px solid var(--border-600);'
    }
  }}
`

const Label = styled.span`
  margin-right: 0.5rem;
`

const StyledExternalLink = styled(ExternalLink)`
  font-size: var(--font-size-2);
  font-weight: var(--font-weight--bold);

  color: inherit;

  svg {
    padding-top: 0.3125rem;
  }
`

export default function DetailInfoAddressLookup({
  rChainId,
  showBottomBorder,
  label,
  address,
}: ComponentProps<typeof ContractComp>) {
  const [releaseChannel] = useReleaseChannel()
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  return releaseChannel === ReleaseChannel.Beta ? (
    <AddressActionInfo network={network} title={label} isBorderBottom={showBottomBorder} address={address} />
  ) : (
    <ContractComp rChainId={rChainId} showBottomBorder={showBottomBorder} label={label} address={address} />
  )
}

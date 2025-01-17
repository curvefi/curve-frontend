import React from 'react'
import styled from 'styled-components'
import { copyToClipboard } from '@/lib/utils'
import { shortenTokenAddress } from '@/utils'
import { StyledIconButton } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import Box from '@/ui/Box'
import ExternalLink from '@/ui/Link/ExternalLink'
import Icon from '@/ui/Icon'
import useStore from '@/store/useStore'
import { ChainId } from '@/types/main.types'

const ContractComp = ({
  address,
  rChainId,
  isLargeNumber,
  label,
  showBottomBorder,
  action,
}: {
  address: string
  rChainId: ChainId
  isLargeNumber?: boolean
  label: string | React.ReactNode
  showBottomBorder: boolean
  action?: React.ReactNode
}) => {
  const network = useStore((state) => state.networks.networks[rChainId])
  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
  }

  return (
    <Wrapper haveAction={!!action}>
      <InnerWrapper isBorderBottom={showBottomBorder} haveAction={!!action}>
        {isLargeNumber ? (
          <LabelWrapper flex flexDirection="row">
            <Box flex flexDirection="column">
              {label}
              <StyledExternalLink href={network.scanAddressPath(address)}>
                {shortenTokenAddress(address)}
                <Icon name="Launch" size={16} />
              </StyledExternalLink>
            </Box>
            <StyledIconButton size="medium" onClick={() => handleCopyClick(address)}>
              <Icon name="Copy" size={16} />
            </StyledIconButton>
          </LabelWrapper>
        ) : (
          <>
            <Label>{label}</Label>
            <span>
              <StyledExternalLink href={network.scanAddressPath(address)}>
                {shortenTokenAddress(address)}
                <Icon name="Launch" size={16} />
              </StyledExternalLink>
              <StyledIconButton size="medium" onClick={() => handleCopyClick(address)}>
                <Icon name="Copy" size={16} />
              </StyledIconButton>
            </span>
          </>
        )}
      </InnerWrapper>

      {action}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ haveAction: boolean }>`
  ${({ haveAction }) => {
    if (haveAction) {
      return `
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        width: 100%;
      `
    }
  }}
`

const InnerWrapper = styled.div<{ isBorderBottom?: boolean; haveAction: boolean }>`
  ${({ haveAction }) => {
    if (!haveAction) {
      return `
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
      `
    }
  }}

  ${({ isBorderBottom }) => {
    if (isBorderBottom) {
      return 'border-bottom: 1px solid var(--border-600);'
    }
  }}
`

const LabelWrapper = styled(Box)`
  width: 100%;
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

export default ContractComp

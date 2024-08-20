import React from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import networks from '@/networks'

import TokenIcons from '@/components/TokenIcons'

type Props = {
  className?: string
  rChainId: ChainId
  poolName: string
  underlyingCoins: string[]
  underlyingCoinAddresses: string[]
}

const PegKeeperLabel = ({ className = '', poolName, rChainId, underlyingCoins, underlyingCoinAddresses }: Props) => {
  const { imageBaseUrl } = networks[rChainId]

  return (
    <Wrapper className={className}>
      <TokenIcons imageBaseUrl={imageBaseUrl} tokens={underlyingCoins} tokenAddresses={underlyingCoinAddresses} />{' '}
      <LabelText>{poolName}</LabelText>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  display: grid;
  padding: var(--spacing-1);
  grid-template-columns: auto 1fr;

  @media (min-width: ${breakpoints.sm}rem) {
    padding: var(--spacing-2);
  }
`

const LabelText = styled.h3`
  font-size: var(--font-size-4);
  margin-left: var(--spacing-1);
`

export default PegKeeperLabel

import { useMemo } from 'react'
import styled from 'styled-components'
import { zip } from 'lodash'
import { breakpoints } from '@ui/utils'
import networks from '@/loan/networks'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'
import { ChainId } from '@/loan/types/loan.types'

type Props = {
  className?: string
  rChainId: ChainId
  poolName: string
  underlyingCoins: string[]
  underlyingCoinAddresses: string[]
}

const PegKeeperLabel = ({ className = '', poolName, rChainId, underlyingCoins, underlyingCoinAddresses }: Props) => {
  const tokens = useMemo(
    () =>
      zip(underlyingCoins, underlyingCoinAddresses).map(([symbol, address]) => ({
        symbol: symbol!,
        address: address!,
      })),
    [underlyingCoins, underlyingCoinAddresses],
  )

  return (
    <Wrapper className={className}>
      <TokenIcons blockchainId={networks[rChainId].networkId} tokens={tokens} /> <LabelText>{poolName}</LabelText>
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

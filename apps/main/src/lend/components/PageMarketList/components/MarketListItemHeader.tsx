import React from 'react'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils'
import networks from '@/lend/networks'

import Box from '@ui/Box'
import TokenIcon from '@/lend/components/TokenIcon'

const MarketListItemHeader = ({
  rChainId,
  idx,
  address,
  symbol,
}: {
  rChainId: ChainId
  idx: number
  address: string
  symbol: string
}) => {
  const { imageBaseUrl } = networks[rChainId]

  return (
    <TableTokenWrapper $isFirst={idx === 0}>
      <Wrapper flex flexAlignItems="center">
        {<StyledTokenIcon imageBaseUrl={imageBaseUrl} token={symbol} address={address} />}
        <strong>{symbol}</strong>
      </Wrapper>
    </TableTokenWrapper>
  )
}

const TableTokenWrapper = styled.div<{ $isFirst?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-1) var(--spacing-narrow);
  ${({ $isFirst }) => !$isFirst && `padding-top: var(--spacing-wide);`};

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: var(--spacing-normal);
    padding-right: var(--spacing-normal);
  }
`

const Wrapper = styled(Box)`
  min-width: 100px;
`

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-1);
`

export default MarketListItemHeader

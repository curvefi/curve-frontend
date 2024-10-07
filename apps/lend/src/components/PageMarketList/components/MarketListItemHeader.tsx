import React from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import networks from '@/networks'

import Box from '@/ui/Box'
import TokenIcon from '@/components/TokenIcon'

const MarketListItemHeader = ({
  rChainId,
  address,
  symbol,
}: {
  rChainId: ChainId
  address: string
  symbol: string
}) => {
  const { imageBaseUrl } = networks[rChainId]

  return (
    <TableTokenWrapper>
      <Wrapper flex flexAlignItems="center">
        {<StyledTokenIcon imageBaseUrl={imageBaseUrl} token={symbol} address={address} />}
        <strong>{symbol}</strong>
      </Wrapper>
    </TableTokenWrapper>
  )
}

const TableTokenWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-1) var(--spacing-narrow);
  padding-top: var(--spacing-wide);

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

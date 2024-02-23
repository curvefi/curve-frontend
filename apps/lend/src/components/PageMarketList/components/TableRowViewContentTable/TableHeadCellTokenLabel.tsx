import React from 'react'
import styled from 'styled-components'

import networks from '@/networks'

import Box from '@/ui/Box'
import TokenIcon from '@/components/TokenIcon'

const TableHeadCellTokenLabel = ({
  rChainId,
  symbol,
  address,
}: {
  rChainId: ChainId
  symbol: string
  address: string
}) => {
  const imageBaseUrl = networks[rChainId].imageBaseUrl

  return (
    <Wrapper flex flexAlignItems="center">
      {<StyledTokenIcon imageBaseUrl={imageBaseUrl} token={symbol} address={address} />}
      <strong>{symbol}</strong>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  min-width: 100px;
`

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-1);
`

export default TableHeadCellTokenLabel

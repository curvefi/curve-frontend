import React from 'react'
import styled from 'styled-components'

import { formatNumber } from '@ui/utils'
import { format } from '@/lend/components/DetailInfoLeverageAdvancedExpected/utils'

import Box from '@ui/Box'
import TokenIcon from '@/lend/components/TokenIcon'

const RouteToken = ({
  imageBaseUrl,
  tokenAddress = '',
  tokenSymbol = '',
  value = '',
  avgPrice,
}: {
  imageBaseUrl: string
  tokenAddress: string | undefined
  tokenSymbol: string | undefined
  value: string | number
  avgPrice?: string
}) => {
  const parsedAvgPrice = typeof avgPrice !== 'undefined' && avgPrice !== 'NaN' ? avgPrice : ''

  return (
    <Wrapper flex flexAlignItems="center" flexJustifyContent="space-between">
      <Label>
        {tokenAddress && tokenSymbol && (
          <TokenIcon imageBaseUrl={imageBaseUrl} token={tokenSymbol} address={tokenAddress} />
        )}
        <strong>{tokenSymbol}</strong>
      </Label>{' '}
      <Box grid className="right">
        <strong>{format(value || undefined, { defaultValue: '-' })}</strong>
        <AvgPrice>{parsedAvgPrice && `Avg. price: ${formatNumber(parsedAvgPrice, { defaultValue: '-' })}`}</AvgPrice>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  font-size: var(--font-size-2);
`

const Label = styled.div`
  align-items: center;
  display: flex;

  strong {
    margin-left: var(--spacing-1);
  }
`

const AvgPrice = styled.span`
  padding-top: var(--spacing-1);
`

export default RouteToken

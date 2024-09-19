import React from 'react'
import styled from 'styled-components'

import { shortenTokenAddress } from '@/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import Spacer from '@/ui/Spacer'
import Loader from '@/ui/Loader'
import TextEllipsis from '@/ui/TextEllipsis'
import TokenIcon from '@/components/TokenIcon'

type Props = {
  tokenObj: Token
  value: string
}

const DetailsBalancedAmount: React.FC<Props> = ({ tokenObj, value }) => {
  const { imageBaseUrl } = usePoolContext()
  const { isLoading } = useWithdrawContext()

  const { symbol = '', address = '', ethAddress, haveSameTokenName } = tokenObj ?? {}

  return (
    <Box key={address} as="li" flex flexAlignItems="center">
      <StyledTokenIcon imageBaseUrl={imageBaseUrl} token={symbol} address={ethAddress || address} /> {symbol}
      {haveSameTokenName && <Chip>{shortenTokenAddress(address)}</Chip>}
      <Spacer />
      {isLoading && <Loader skeleton={[90, 20]} />}
      {!isLoading && <TextEllipsis smMaxWidth="10rem">{value}</TextEllipsis>}
    </Box>
  )
}

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-1);
`

export default DetailsBalancedAmount

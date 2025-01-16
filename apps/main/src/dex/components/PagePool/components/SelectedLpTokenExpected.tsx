import type { Amount } from '@/dex/components/PagePool/utils'

import * as React from 'react'
import styled from 'styled-components'

import { shortenTokenAddress } from '@/dex/utils'
import { formatNumber } from '@ui/utils'

import { Chip } from '@ui/Typography'
import Box from '@ui/Box'
import Spacer from '@ui/Spacer'
import Loader from '@ui/Loader'
import TextEllipsis from '@ui/TextEllipsis'
import TokenIcon from '@/dex/components/TokenIcon'

const SelectedLpTokenExpected = ({
  amounts,
  imageBaseUrl,
  loading,
  poolDataCacheOrApi,
  tokens,
  tokensMapper,
  tokenAddresses,
}: {
  amounts: Amount[]
  imageBaseUrl: string
  loading: boolean
  poolDataCacheOrApi: PoolDataCacheOrApi
  tokens: string[]
  tokensMapper: TokensMapper
  tokenAddresses: string[]
}) => (
  <Box as="ul" grid gridRowGap={2}>
    {tokenAddresses.map((tokenAddress, idx) => {
      const token = tokens[idx]
      const haveSameTokenName = poolDataCacheOrApi.tokensCountBy[token] > 1

      return (
        <Box key={tokenAddress} as="li" flex flexAlignItems="center">
          <StyledTokenIcon
            imageBaseUrl={imageBaseUrl}
            token={token}
            address={tokensMapper[tokenAddress]?.ethAddress || tokenAddress}
          />{' '}
          {token}
          {haveSameTokenName && <Chip>{shortenTokenAddress(tokenAddress)}</Chip>}
          <Spacer />
          {loading ? (
            <Loader skeleton={[90, 20]} />
          ) : (
            <TextEllipsis smMaxWidth="15rem">{formatNumber(amounts[idx]?.value || '0')}</TextEllipsis>
          )}
        </Box>
      )
    })}
  </Box>
)

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-1);
`

export default SelectedLpTokenExpected




import Box from '@/ui/Box'
import Loader from '@/ui/Loader'
import Spacer from '@/ui/Spacer'
import TextEllipsis from '@/ui/TextEllipsis'
import { Chip } from '@/ui/Typography'
import { formatNumber } from '@/ui/utils'
import * as React from 'react'
import styled from 'styled-components'
import type { Amount } from '@/components/PagePool/utils'
import TokenIcon from '@/components/TokenIcon'
import { shortenTokenAddress } from '@/utils'

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
}) => {
  return (
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
}

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-1);
`

export default SelectedLpTokenExpected

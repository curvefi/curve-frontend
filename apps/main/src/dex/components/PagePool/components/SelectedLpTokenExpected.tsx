import type { Amount } from '@/dex/components/PagePool/utils'
import styled from 'styled-components'
import { shortenTokenAddress } from '@/dex/utils'
import { formatNumber } from '@ui/utils'
import { Chip } from '@ui/Typography'
import Box from '@ui/Box'
import Spacer from '@ui/Spacer'
import Loader from '@ui/Loader'
import TextEllipsis from '@ui/TextEllipsis'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TokensMapper, PoolDataCacheOrApi } from '@/dex/types/main.types'

const SelectedLpTokenExpected = ({
  amounts,
  blockchainId,
  loading,
  poolDataCacheOrApi,
  tokens,
  tokensMapper,
  tokenAddresses,
}: {
  amounts: Amount[]
  blockchainId: string
  loading: boolean
  poolDataCacheOrApi: PoolDataCacheOrApi
  tokens: string[]
  tokensMapper: TokensMapper
  tokenAddresses: string[]
}) => (
  <Box as="ul" grid gridRowGap={2}>
    {tokenAddresses.map((tokenAddress, idx) => {
      const symbol = tokens[idx]
      const haveSameTokenName = poolDataCacheOrApi.tokensCountBy[symbol] > 1

      return (
        <Box key={tokenAddress} as="li" flex flexAlignItems="center">
          <StyledTokenIcon
            blockchainId={blockchainId}
            tooltip={symbol}
            address={tokensMapper[tokenAddress]?.ethAddress || tokenAddress}
          />{' '}
          {symbol}
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

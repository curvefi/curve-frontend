import { styled } from 'styled-components'
import type { Amount } from '@/dex/components/PagePool/utils'
import { TokensMapper, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { Loader } from '@ui/Loader'
import { Spacer } from '@ui/Spacer'
import { TextEllipsis } from '@ui/TextEllipsis'
import { Chip } from '@ui/Typography'
import { formatNumber } from '@ui/utils'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { shortenAddress } from '@ui-kit/utils'

export const SelectedLpTokenExpected = ({
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
          {haveSameTokenName && <Chip>{shortenAddress(tokenAddress)}</Chip>}
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

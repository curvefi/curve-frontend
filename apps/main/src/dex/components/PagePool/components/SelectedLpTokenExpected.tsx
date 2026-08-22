import { styled } from 'styled-components'
import type { Amount } from '@/dex/components/PagePool/utils'
import { TokensMapper, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { TokenIcon } from '@evm-ui/shared/ui/TokenIcon'
import { shortenAddress, formatNumber, amount } from '@evm-ui/utils'
import { Box } from '@legacy-ui/Box'
import { Loader } from '@legacy-ui/Loader'
import { Spacer } from '@legacy-ui/Spacer'
import { TextEllipsis } from '@legacy-ui/TextEllipsis'
import { Chip } from '@legacy-ui/Typography'

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
            <TextEllipsis smMaxWidth="15rem">
              {formatNumber(amount(amounts[idx]?.value || 0), { abbreviate: false })}
            </TextEllipsis>
          )}
        </Box>
      )
    })}
  </Box>
)

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-1);
`

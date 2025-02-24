import type { Amount } from '@/dex/components/PagePool/utils'

import * as React from 'react'
import styled from 'styled-components'

import { shortenTokenAddress } from '@/dex/utils'
import { formatNumber } from '@ui/utils'

import { Chip } from '@ui/Typography'
import { Radio, RadioGroup } from '@ui/Radio'
import Loader from '@ui/Loader'
import Spacer from '@ui/Spacer'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import TextEllipsis from '@ui/TextEllipsis'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TokensMapper, PoolDataCacheOrApi } from '@/dex/types/main.types'

const SelectedOneCoinExpected = ({
  amounts,
  haveSigner,
  blockchainId,
  loading,
  poolDataCacheOrApi,
  selectedTokenAddress,
  tokens,
  tokensMapper,
  tokenAddresses,
  handleChanged,
}: {
  amounts: Amount[]
  haveSigner: boolean
  blockchainId: string
  loading: boolean
  poolDataCacheOrApi: PoolDataCacheOrApi
  selectedTokenAddress: string
  tokens: string[]
  tokensMapper: TokensMapper
  tokenAddresses: string[]
  handleChanged: ({ token, tokenAddress }: { token: string; tokenAddress: string }) => void
}) => {
  const handleRadioChange = (selectedTokenAddress: string) => {
    const idx = tokenAddresses.findIndex((tokenAddress) => tokenAddress === selectedTokenAddress)
    handleChanged({ token: tokens[idx], tokenAddress: selectedTokenAddress })
  }

  return (
    <StyledRadioGroup aria-label="Withdraw from one coin" value={selectedTokenAddress} onChange={handleRadioChange}>
      {selectedTokenAddress ? (
        tokenAddresses.map((tokenAddress, idx) => {
          const symbol = tokens[idx]
          const haveSameTokenName = poolDataCacheOrApi?.tokensCountBy[symbol] > 1

          return (
            <Radio
              key={tokenAddress}
              aria-label={`Withdraw from ${symbol} for ${amounts[idx]?.value ?? '0'}`}
              value={tokenAddress}
            >
              <StyledTokenIcon
                size="sm"
                blockchainId={blockchainId}
                symbol={symbol}
                address={tokensMapper[tokenAddress]?.ethAddress || tokenAddress}
              />{' '}
              {symbol} {haveSameTokenName && <StyledChip>{shortenTokenAddress(tokenAddress)}</StyledChip>}
              <Spacer />
              {loading ? (
                <Loader skeleton={[90, 20]} />
              ) : (
                <TextEllipsis smMaxWidth="15rem">{formatNumber(amounts[idx]?.value || '0')}</TextEllipsis>
              )}
            </Radio>
          )
        })
      ) : (
        <SpinnerWrapper vSpacing={4}>{!haveSigner && <Spinner />}</SpinnerWrapper>
      )}
    </StyledRadioGroup>
  )
}

const StyledChip = styled(Chip)`
  margin-left: var(--spacing-2);
`

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-2);
`

const StyledRadioGroup = styled(RadioGroup)`
  grid-gap: var(--spacing-2);
`

export default SelectedOneCoinExpected

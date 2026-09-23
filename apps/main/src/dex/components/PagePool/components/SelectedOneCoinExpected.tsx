import { countBy } from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import type { Amount } from '@/dex/components/PagePool/utils'
import { shortenAddress } from '@evm-ui/utils'
import { Loader } from '@legacy-ui/Loader'
import { Radio, RadioGroup } from '@legacy-ui/Radio'
import { Spacer } from '@legacy-ui/Spacer'
import { SpinnerWrapper, Spinner } from '@legacy-ui/Spinner'
import { TextEllipsis } from '@legacy-ui/TextEllipsis'
import { Chip } from '@legacy-ui/Typography'
import { formatNumber } from '@primitives/number.utils'
import { TokenIcon } from '@ui/components/TokenIcon'
import { amount } from '@ui/lib/decimal'

export const SelectedOneCoinExpected = ({
  amounts,
  haveSigner,
  blockchainId,
  loading,
  selectedTokenAddress,
  tokens,
  tokenAddresses,
  handleChanged,
}: {
  amounts: Amount[]
  haveSigner: boolean
  blockchainId: string
  loading: boolean
  selectedTokenAddress: string
  tokens: string[]
  tokenAddresses: string[]
  handleChanged: ({ token, tokenAddress }: { token: string; tokenAddress: string }) => void
}) => {
  const handleRadioChange = (selectedTokenAddress: string) => {
    const idx = tokenAddresses.findIndex(tokenAddress => tokenAddress === selectedTokenAddress)
    handleChanged({ token: tokens[idx], tokenAddress: selectedTokenAddress })
  }
  const tokenCount = useMemo(() => countBy(tokens), [tokens])

  return (
    <StyledRadioGroup aria-label="Withdraw from one coin" value={selectedTokenAddress} onChange={handleRadioChange}>
      {selectedTokenAddress ? (
        tokenAddresses.map((tokenAddress, idx) => {
          const symbol = tokens[idx]
          const haveSameTokenName = tokenCount[symbol] > 1

          return (
            <Radio
              key={tokenAddress}
              aria-label={`Withdraw from ${symbol} for ${amounts[idx]?.value ?? '0'}`}
              value={tokenAddress}
            >
              <StyledTokenIcon size="sm" blockchainId={blockchainId} tooltip={symbol} address={tokenAddress} /> {symbol}{' '}
              {haveSameTokenName && <StyledChip>{shortenAddress(tokenAddress)}</StyledChip>}
              <Spacer />
              {loading ? (
                <Loader skeleton={[90, 20]} />
              ) : (
                <TextEllipsis smMaxWidth="15rem">
                  {formatNumber(amount(amounts[idx]?.value || 0), { abbreviate: false })}
                </TextEllipsis>
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

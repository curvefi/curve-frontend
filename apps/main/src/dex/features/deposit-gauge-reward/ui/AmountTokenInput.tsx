import { useCallback, useEffect, useMemo } from 'react'
import { isAddressEqual, zeroAddress } from 'viem'
import { useConnection } from 'wagmi'
import { useGaugeRewardsDistributors } from '@/dex/entities/gauge/model/query-options'
import { type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { ChainId, type NetworkEnum } from '@/dex/types/main.types'
import { useFormContext } from '@evm-ui/features/forms'
import { TokenList, type TokenOption, TokenSelector } from '@evm-ui/features/select-token'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { useTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { t } from '@evm-ui/lib/i18n'
import { useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { HelperMessage, LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { mapQuery, q, useMappedQuery } from '@evm-ui/types/util'
import { decimal, decimalMultiply, shortenAddress } from '@evm-ui/utils'
import { fromEntries, maybe, maybes, recordEntries } from '@primitives/objects.utils'

export const AmountTokenInput = ({
  chainId,
  poolId,
  networkId,
  disabled,
}: {
  chainId: ChainId
  poolId: string
  networkId: NetworkEnum
  disabled: boolean
}) => {
  const { update: updateForm, formState, watchValues } = useFormContext<DepositRewardFormValues>()
  const { rewardTokenId, amount } = watchValues()
  const { amount: amountError, rewardTokenId: rewardTokenIdError } = fromEntries(formState.visibleErrors)
  const error = amountError ?? rewardTokenIdError

  const [isOpen, openModal, closeModal] = useSwitch()

  const { address: userAddress } = useConnection()
  const { tokensMapper } = useTokensMapper(chainId)

  const { data: rewardDistributors, isPending: isPendingRewardDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
    userAddress,
  })

  const filteredTokens = useMemo<TokenOption[]>(() => {
    if (isPendingRewardDistributors || !rewardDistributors || !userAddress) return []

    const activeRewardTokens = recordEntries(rewardDistributors)
      .filter(([_, distributor]) => isAddressEqual(distributor, userAddress))
      .map(([tokenId]) => tokenId)

    return activeRewardTokens.map(address => ({
      chain: networkId,
      address,
      symbol: tokensMapper[address.toLowerCase()]?.symbol ?? shortenAddress(address),
      volume: tokensMapper[address.toLowerCase()]?.volume ?? 0,
    }))
  }, [isPendingRewardDistributors, rewardDistributors, userAddress, tokensMapper, networkId])

  useEffect(() => {
    if (
      filteredTokens.length &&
      (!rewardTokenId || !filteredTokens.some(token => isAddressEqual(token.address, rewardTokenId)))
    ) {
      updateForm({ rewardTokenId: filteredTokens[0].address }, { automated: true })
    }
  }, [filteredTokens, rewardTokenId, updateForm])

  const token = filteredTokens.find(x => x.address === rewardTokenId)
  const tokenAddresses = filteredTokens.map(t => t.address).filter(t => !isAddressEqual(t, zeroAddress))

  const tokenPrices = useTokenUsdRates({ chainId, tokenAddresses })
  const tokenBalances = useTokenBalances({
    chainId,
    userAddress,
    tokenAddresses,
  })

  const rewardTokenBalance = useMappedQuery(
    tokenBalances,
    useCallback(tokenBalances => rewardTokenId && tokenBalances?.[rewardTokenId], [rewardTokenId]),
  )

  const tokenUsdRate = mapQuery(tokenPrices, tokenPrices =>
    maybe(rewardTokenId, rewardTokenId => tokenPrices?.[rewardTokenId]),
  )

  const onChangeToken = useCallback(
    (value: TokenOption) => {
      if (rewardTokenId && isAddressEqual(value.address, rewardTokenId)) return
      updateForm({ rewardTokenId: value.address })
    },
    [rewardTokenId, updateForm],
  )

  return (
    <LargeTokenInput
      name="amount"
      label={t`Amount to deposit`}
      balance={q({ data: decimal(amount), isLoading: false, error: amountError ? Error(amountError) : null })}
      onBalance={useCallback(amount => updateForm({ amount }), [updateForm])}
      walletBalance={
        userAddress && {
          symbol: token?.symbol,
          balance: rewardTokenBalance,
          usdRate: tokenUsdRate,
          disabled,
          buttonTestId: 'max',
        }
      }
      maxBalance={{ balance: rewardTokenBalance, chips: 'max' }}
      inputBalanceUsd={maybes([amount, decimal(tokenUsdRate.data)], decimalMultiply)}
      disabled={disabled}
      testId="deposit-amount"
      tokenSelector={
        token && (
          <TokenSelector
            selectedToken={token}
            disabled={disabled}
            isOpen={!!isOpen}
            onOpen={openModal}
            onClose={closeModal}
          >
            <TokenList
              tokens={filteredTokens}
              balances={tokenBalances.data}
              tokenPrices={tokenPrices.data}
              onToken={onChangeToken}
            />
          </TokenSelector>
        )
      }
    >
      {error && <HelperMessage message={error} isError />}
    </LargeTokenInput>
  )
}

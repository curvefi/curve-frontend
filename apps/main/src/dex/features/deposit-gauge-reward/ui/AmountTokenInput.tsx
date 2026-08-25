import { useCallback, useEffect, useMemo } from 'react'
import { isAddressEqual, zeroAddress } from 'viem'
import { useConnection } from 'wagmi'
import {
  useDepositRewardApproveIsMutating,
  useDepositRewardIsMutating,
  useGaugeRewardsDistributors,
} from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import { type DepositRewardFormValues, DepositRewardStep } from '@/dex/features/deposit-gauge-reward/types'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { ChainId } from '@/dex/types/main.types'
import { useFormContext } from '@evm-ui/features/forms'
import { TokenList, type TokenOption, TokenSelector } from '@evm-ui/features/select-token'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { useTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { t } from '@evm-ui/lib/i18n'
import { useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { HelperMessage, LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { q } from '@evm-ui/types/util'
import { decimal, shortenAddress } from '@evm-ui/utils'
import { recordEntries } from '@primitives/objects.utils'

export const AmountTokenInput = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { update: updateForm, formState, watchValue } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watchValue('rewardTokenId')
  const amount = watchValue('amount')
  const epoch = watchValue('epoch')

  const [isOpen, openModal, closeModal] = useSwitch()

  const { address: signerAddress } = useConnection()
  const {
    data: { networkId },
  } = useNetworkByChain({ chainId })

  const { tokensMapper } = useTokensMapper(chainId)

  const { data: rewardDistributors, isPending: isPendingRewardDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
    userAddress: signerAddress,
  })

  const isMutatingDepositRewardApprove = useDepositRewardApproveIsMutating({ chainId, poolId, rewardTokenId, amount })
  const isMutatingDepositReward = useDepositRewardIsMutating({ chainId, poolId, rewardTokenId, amount, epoch })

  const filteredTokens = useMemo<TokenOption[]>(() => {
    if (isPendingRewardDistributors || !rewardDistributors || !signerAddress) return []

    const activeRewardTokens = recordEntries(rewardDistributors)
      .filter(([_, distributor]) => isAddressEqual(distributor, signerAddress))
      .map(([tokenId]) => tokenId)

    return activeRewardTokens.map(address => ({
      chain: networkId,
      address,
      symbol: tokensMapper[address.toLowerCase()]?.symbol ?? shortenAddress(address),
      volume: tokensMapper[address.toLowerCase()]?.volume ?? 0,
    }))
  }, [isPendingRewardDistributors, rewardDistributors, signerAddress, tokensMapper, networkId])

  useEffect(() => {
    if (
      rewardTokenId &&
      filteredTokens.length &&
      !filteredTokens.some(token => isAddressEqual(token.address, rewardTokenId))
    ) {
      updateForm({ rewardTokenId: filteredTokens[0].address }, { automated: true })
    }
  }, [filteredTokens, rewardTokenId, updateForm])

  const token = filteredTokens.find(x => x.address === rewardTokenId)
  const tokenAddresses = filteredTokens.map(t => t.address).filter(t => !isAddressEqual(t, zeroAddress))

  const { data: tokenPrices } = useTokenUsdRates({ chainId, tokenAddresses })
  const { data: tokenBalances, isLoading: isTokenBalancesLoading } = useTokenBalances({
    chainId,
    userAddress: signerAddress,
    tokenAddresses,
  })

  const rewardTokenBalance = useMemo(
    () => rewardTokenId && tokenBalances?.[rewardTokenId],
    [rewardTokenId, tokenBalances],
  )

  const amountError = formState.visibleErrors.find(([field]) => field === 'amount')?.[1]
  const rewardTokenIdError = formState.visibleErrors.find(([field]) => field === 'rewardTokenId')?.[1]
  const tokenUsdRate = rewardTokenId ? tokenPrices?.[rewardTokenId] : undefined

  const onChangeAmount = useCallback(
    (amount: string | undefined) => {
      updateForm({ amount })
    },
    [updateForm],
  )

  const onChangeToken = useCallback(
    (value: TokenOption) => {
      if (rewardTokenId && isAddressEqual(value.address, rewardTokenId)) return
      updateForm({ rewardTokenId: value.address, step: DepositRewardStep.APPROVAL })
    },
    [rewardTokenId, updateForm],
  )

  const isDisabled = isMutatingDepositReward || isMutatingDepositRewardApprove

  return (
    <LargeTokenInput
      name="amount"
      label={t`Amount to deposit`}
      balance={q({ data: decimal(amount), isLoading: false, error: amountError ? Error(amountError) : null })}
      onBalance={onChangeAmount}
      walletBalance={
        signerAddress
          ? {
              symbol: token?.symbol,
              balance: q({ data: rewardTokenBalance, isLoading: isTokenBalancesLoading, error: null }),
              usdRate: tokenUsdRate,
              disabled: isDisabled,
              buttonTestId: 'max',
            }
          : undefined
      }
      maxBalance={{
        balance: q({ data: rewardTokenBalance, isLoading: isTokenBalancesLoading, error: null }),
        chips: 'max',
      }}
      inputBalanceUsd={decimal(amount && tokenUsdRate && +amount * tokenUsdRate)}
      disabled={isDisabled}
      testId="deposit-amount"
      tokenSelector={
        token && (
          <TokenSelector
            selectedToken={token}
            disabled={isDisabled}
            isOpen={!!isOpen}
            onOpen={openModal}
            onClose={closeModal}
          >
            <TokenList
              tokens={filteredTokens}
              balances={tokenBalances}
              tokenPrices={tokenPrices}
              onToken={onChangeToken}
            />
          </TokenSelector>
        )
      }
    >
      {(amountError || rewardTokenIdError) && <HelperMessage message={amountError ?? rewardTokenIdError} isError />}
    </LargeTokenInput>
  )
}

import { MouseEvent, useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Address, isAddressEqual } from 'viem'
import { ethAddress } from 'viem'
import {
  useDepositRewardApproveIsMutating,
  useDepositRewardIsMutating,
  useGaugeRewardsDistributors,
} from '@/dex/entities/gauge'
import { useIsSignerConnected, useSignerAddress, useTokensBalances } from '@/dex/entities/signer'
import { type DepositRewardFormValues, DepositRewardStep } from '@/dex/features/deposit-gauge-reward/types'
import {
  FlexItemAmount,
  FlexItemMaxBtn,
  FlexItemToken,
  StyledInputProvider,
} from '@/dex/features/deposit-gauge-reward/ui/styled'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import useStore from '@/dex/store/useStore'
import { ChainId, Token } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { FlexContainer } from '@ui/styled-containers'
import { formatNumber } from '@ui/utils'
import { type TokenOption, TokenSelector } from '@ui-kit/features/select-token'
import { t } from '@ui-kit/lib/i18n'

export const AmountTokenInput = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { setValue, getValues, formState, watch } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const amount = watch('amount')
  const epoch = watch('epoch')

  const { data: signerAddress } = useSignerAddress()
  const { data: haveSigner } = useIsSignerConnected()
  const isMaxLoading = useStore((state) => state.quickSwap.isMaxLoading)
  const { networkId } = useStore((state) => state.networks.networks[chainId])

  const userBalancesMapper = useStore((state) => state.userBalances.userBalancesMapper)
  const tokenPrices = useStore((state) => state.usdRates.usdRatesMapper)

  const { tokensMapper } = useTokensMapper(chainId)

  const { data: rewardDistributors, isPending: isPendingRewardDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
  })

  const isMutatingDepositRewardApprove = useDepositRewardApproveIsMutating({ chainId, poolId, rewardTokenId, amount })
  const isMutatingDepositReward = useDepositRewardIsMutating({ chainId, poolId, rewardTokenId, amount, epoch })

  const {
    data: [tokenBalance],
    isLoading: isTokenBalancesLoading,
  } = useTokensBalances([rewardTokenId])

  const filteredTokens = useMemo<TokenOption[]>(() => {
    if (isPendingRewardDistributors || !rewardDistributors || !signerAddress) return []

    const activeRewardTokens = Object.entries(rewardDistributors)
      .filter(([_, distributor]) => isAddressEqual(distributor as Address, signerAddress))
      .map(([tokenId]) => tokenId)

    const filteredTokens = Object.values(tokensMapper)
      .filter(
        (token): token is Token =>
          !!token &&
          activeRewardTokens.some((rewardToken) => isAddressEqual(rewardToken as Address, token.address as Address)),
      )
      .map(toTokenOption(networkId))

    const rewardTokenId = getValues('rewardTokenId')
    if (
      rewardTokenId &&
      filteredTokens.length > 0 &&
      !filteredTokens.some((token) => isAddressEqual(token.address, rewardTokenId))
    ) {
      setValue('rewardTokenId', filteredTokens[0].address, { shouldValidate: true })
    }

    return filteredTokens
  }, [isPendingRewardDistributors, rewardDistributors, signerAddress, tokensMapper, getValues, networkId, setValue])

  const token = filteredTokens.find((x) => x.address === rewardTokenId)

  const onChangeAmount = useCallback(
    (amount: string) => {
      setValue('amount', amount, { shouldValidate: true })
    },
    [setValue],
  )

  const onChangeToken = useCallback(
    (value: TokenOption) => {
      if (rewardTokenId && isAddressEqual(value.address, rewardTokenId)) return
      setValue('rewardTokenId', value.address, { shouldValidate: true })
      setValue('step', DepositRewardStep.APPROVAL, { shouldValidate: true })
    },
    [rewardTokenId, setValue],
  )

  const onMaxButtonClick = useCallback(
    (e?: MouseEvent<HTMLButtonElement>) => {
      e?.preventDefault()
      if (!tokenBalance) return
      setValue('amount', tokenBalance, { shouldValidate: true })
    },
    [tokenBalance, setValue],
  )

  const isDisabled = isMutatingDepositReward || isMutatingDepositRewardApprove

  return (
    <FlexContainer>
      <StyledInputProvider
        id="deposit-reward"
        inputVariant={formState.errors.rewardTokenId ? 'error' : undefined}
        disabled={isDisabled}
      >
        <FlexItemAmount>
          <InputDebounced
            id="deposit-amount"
            type="number"
            labelProps={
              haveSigner && {
                label: t`Avail.`,
                descriptionLoading: isTokenBalancesLoading,
                description: formatNumber(tokenBalance, { showAllFractionDigits: true }),
              }
            }
            testId="deposit-amount"
            value={isMaxLoading ? '' : (amount ?? '')}
            onChange={onChangeAmount}
          />
        </FlexItemAmount>
        <FlexItemMaxBtn>
          <InputMaxBtn
            loading={isMaxLoading}
            disabled={isDisabled}
            isNetworkToken={rewardTokenId === ethAddress}
            testId="max"
            onClick={onMaxButtonClick}
          />
        </FlexItemMaxBtn>
        <FlexItemToken>
          <TokenSelector
            selectedToken={token}
            tokens={filteredTokens}
            disabled={isDisabled}
            balances={userBalancesMapper}
            tokenPrices={tokenPrices}
            onToken={onChangeToken}
          />
        </FlexItemToken>
      </StyledInputProvider>
    </FlexContainer>
  )
}

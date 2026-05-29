import { MouseEvent, useCallback, useEffect, useMemo } from 'react'
import { Address, ethAddress, isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import {
  useDepositRewardApproveIsMutating,
  useDepositRewardIsMutating,
  useGaugeRewardsDistributors,
} from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import { type DepositRewardFormValues, DepositRewardStep } from '@/dex/features/deposit-gauge-reward/types'
import {
  FlexItemAmount,
  FlexItemMaxBtn,
  FlexItemToken,
  StyledInputProvider,
} from '@/dex/features/deposit-gauge-reward/ui/styled'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { useStore } from '@/dex/store/useStore'
import { ChainId, Token } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { FlexContainer } from '@ui/styled-containers'
import { useFormContext } from '@ui-kit/features/forms'
import { TokenList, type TokenOption, TokenSelector } from '@ui-kit/features/select-token'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { formatNumber } from '@ui-kit/utils'

export const AmountTokenInput = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { update: updateForm, formState, watchValue } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watchValue('rewardTokenId')
  const amount = watchValue('amount')
  const epoch = watchValue('epoch')

  const [isOpen, openModal, closeModal] = useSwitch()

  const { address: signerAddress } = useConnection()
  const isMaxLoading = useStore(state => state.quickSwap.isMaxLoading)
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

    const activeRewardTokens = Object.entries(rewardDistributors)

      .filter(([_, distributor]) => isAddressEqual(distributor as Address, signerAddress))
      .map(([tokenId]) => tokenId)

    return Object.values(tokensMapper)
      .filter(
        (token): token is Token =>
          !!token &&
          activeRewardTokens.some(rewardToken => isAddressEqual(rewardToken as Address, token.address as Address)),
      )
      .map(toTokenOption(networkId))
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
  const tokenAddresses = filteredTokens.map(t => t.address)

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

  const onChangeAmount = useCallback(
    (amount: string) => {
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

  const onMaxButtonClick = useCallback(
    (e?: MouseEvent<HTMLButtonElement>) => {
      e?.preventDefault()
      if (!rewardTokenBalance) return
      updateForm({ amount: rewardTokenBalance })
    },
    [rewardTokenBalance, updateForm],
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
              signerAddress && {
                label: t`Avail.`,
                descriptionLoading: isTokenBalancesLoading,
                description: formatNumber(rewardTokenBalance, { abbreviate: false, fallback: '-' }),
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
        </FlexItemToken>
      </StyledInputProvider>
    </FlexContainer>
  )
}

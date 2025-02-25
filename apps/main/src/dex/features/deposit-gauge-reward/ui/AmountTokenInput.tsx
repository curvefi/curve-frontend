import { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { t } from '@ui-kit/lib/i18n'
import { useCallback, useMemo, type Key } from 'react'
import { useFormContext } from 'react-hook-form'
import { Address, isAddressEqual } from 'viem'
import { NETWORK_TOKEN } from '@/dex/constants'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import useStore from '@/dex/store/useStore'
import { DepositRewardStep, type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import {
  FlexItemAmount,
  FlexItemMaxBtn,
  FlexItemToken,
  StyledInputProvider,
  StyledTokenComboBox,
} from '@/dex/features/deposit-gauge-reward/ui/styled'
import {
  useDepositRewardApproveIsMutating,
  useDepositRewardIsMutating,
  useGaugeRewardsDistributors,
} from '@/dex/entities/gauge'
import { useIsSignerConnected, useSignerAddress, useTokensBalances } from '@/dex/entities/signer'
import { useTokens } from '@/dex/entities/token'
import { FlexContainer } from '@ui/styled-containers'
import { ChainId, Token } from '@/dex/types/main.types'
import { formatNumber } from '@ui/utils'

export const AmountTokenInput: React.FC<{
  chainId: ChainId
  poolId: string
}> = ({ chainId, poolId }) => {
  const { setValue, getValues, formState, watch, setError, clearErrors } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const amount = watch('amount')
  const epoch = watch('epoch')

  const { data: signerAddress } = useSignerAddress()
  const { data: haveSigner } = useIsSignerConnected()
  const isMaxLoading = useStore((state) => state.quickSwap.isMaxLoading)
  const { networkId } = useStore((state) => state.networks.networks[chainId])

  const { tokensMapper } = useTokensMapper(chainId)
  const {
    data: [token],
  } = useTokens([rewardTokenId])

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

  const filteredTokens = useMemo<Token[]>(() => {
    if (isPendingRewardDistributors || !rewardDistributors || !signerAddress) return []

    const activeRewardTokens = Object.entries(rewardDistributors)
      .filter(([_, distributor]) => isAddressEqual(distributor as Address, signerAddress))
      .map(([tokenId]) => tokenId)

    const filteredTokens = Object.values(tokensMapper).filter(
      (token): token is Token =>
        token !== undefined &&
        activeRewardTokens.some((rewardToken) => isAddressEqual(rewardToken as Address, token.address as Address)),
    )

    const rewardTokenId = getValues('rewardTokenId')
    if (
      rewardTokenId &&
      filteredTokens.length > 0 &&
      !filteredTokens.some((token) => isAddressEqual(token.address as Address, rewardTokenId))
    ) {
      setValue('rewardTokenId', filteredTokens[0].address as Address, { shouldValidate: true })
    }

    return filteredTokens
  }, [isPendingRewardDistributors, rewardDistributors, signerAddress, tokensMapper, getValues, setValue])

  const onChangeAmount = useCallback(
    (amount: string) => {
      setValue('amount', amount, { shouldValidate: true })
    },
    [setValue],
  )

  const onChangeToken = useCallback(
    (value: Key) => {
      if (rewardTokenId && isAddressEqual(value as Address, rewardTokenId)) return
      setValue('rewardTokenId', value as Address, { shouldValidate: true })
      setValue('step', DepositRewardStep.APPROVAL, { shouldValidate: true })
    },
    [rewardTokenId, setValue],
  )

  const onMaxButtonClick = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
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
            isNetworkToken={rewardTokenId === NETWORK_TOKEN}
            testId="max"
            onClick={onMaxButtonClick}
          />
        </FlexItemMaxBtn>
        <FlexItemToken>
          <StyledTokenComboBox
            title=""
            disabled={isDisabled}
            blockchainId={networkId}
            listBoxHeight="500px"
            selectedToken={token}
            showCheckboxHideSmallPools
            showSearch
            showBalances={haveSigner}
            testId="deposit-token"
            tokens={filteredTokens}
            onOpen={undefined}
            onSelectionChange={onChangeToken}
          />
        </FlexItemToken>
      </StyledInputProvider>
    </FlexContainer>
  )
}

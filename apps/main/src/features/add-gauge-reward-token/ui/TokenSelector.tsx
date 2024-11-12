import { NETWORK_CONSTANTS } from '@curvefi/api/lib/curve'
import { t } from '@lingui/macro'
import React, { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { type Address, isAddressEqual, zeroAddress } from 'viem'
import type { AddRewardFormValues } from '@/features/add-gauge-reward-token/types'
import { FlexItemToken, StyledTokenComboBox, SubTitle } from '@/features/add-gauge-reward-token/ui'
import { useGaugeRewardsDistributors } from '@/entities/gauge'
import { NETWORK_TOKEN } from '@/constants'
import useTokensMapper from '@/hooks/useTokensMapper'
import useStore from '@/store/useStore'

export const TokenSelector: React.FC<{ chainId: ChainId; poolId: string; disabled: boolean }> = ({
  chainId,
  poolId,
  disabled,
}) => {
  const { getValues, setValue, watch } = useFormContext<AddRewardFormValues>()
  const network = useStore((state) => state.networks.networks[chainId])
  const rewardTokenId = watch('rewardTokenId')
  const { tokensMapper } = useTokensMapper(chainId)
  const { data: gaugeRewardsDistributors, isSuccess: isGaugeRewardsDistributorsSuccess } = useGaugeRewardsDistributors({
    chainId,
    poolId,
  })

  const filteredTokens = useMemo(() => {
    const gaugeRewardTokens = Object.keys(gaugeRewardsDistributors || {})
    return Object.values(tokensMapper).filter(
      (token): token is Token =>
        token !== undefined &&
        token.decimals === 18 &&
        ![...gaugeRewardTokens, zeroAddress, NETWORK_TOKEN, NETWORK_CONSTANTS[chainId].ALIASES.crv].some(
          (rewardToken) => isAddressEqual(rewardToken as Address, token.address as Address),
        ),
    )
  }, [gaugeRewardsDistributors, tokensMapper, chainId])

  useEffect(() => {
    if (!isGaugeRewardsDistributorsSuccess) return

    const rewardTokenId = getValues('rewardTokenId')

    const isRewardTokenInGaugeRewardsDistributors = Object.keys(gaugeRewardsDistributors || {}).some(
      (gaugeRewardToken) => isAddressEqual(gaugeRewardToken as Address, rewardTokenId as Address),
    )
    if (filteredTokens.length > 0 && (isRewardTokenInGaugeRewardsDistributors || rewardTokenId === zeroAddress)) {
      setValue('rewardTokenId', filteredTokens[0].address as Address, { shouldValidate: true })
    }
  }, [gaugeRewardsDistributors, getValues, setValue, isGaugeRewardsDistributorsSuccess, filteredTokens])

  return (
    <FlexItemToken>
      <SubTitle>{t`Token`}</SubTitle>
      <StyledTokenComboBox
        title={t`Select a Token`}
        imageBaseUrl={network?.imageBaseUrl ?? ''}
        listBoxHeight="400px"
        selectedToken={rewardTokenId ? tokensMapper[rewardTokenId] : undefined}
        showSearch={true}
        tokens={filteredTokens}
        onSelectionChange={(value) => {
          setValue('rewardTokenId', value as Address, { shouldValidate: true })
        }}
        disabled={disabled}
      />
    </FlexItemToken>
  )
}

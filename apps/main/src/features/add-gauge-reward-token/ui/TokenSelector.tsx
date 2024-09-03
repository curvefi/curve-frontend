import { useGaugeRewardsDistributors } from '@/entities/gauge'
import type { AddRewardFormValues } from '@/features/add-gauge-reward-token/types'
import { FlexItemToken, StyledTokenComboBox, SubTitle } from '@/features/add-gauge-reward-token/ui'
import useTokensMapper from '@/hooks/useTokensMapper'
import { getImageBaseUrl } from '@/utils/utilsCurvejs'
import { t } from '@lingui/macro'
import React, { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { isAddressEqual, zeroAddress, type Address } from 'viem'

export const TokenSelector: React.FC<{ chainId: ChainId; poolId: string; disabled: boolean }> = ({
  chainId,
  poolId,
  disabled,
}) => {
  const { getValues, setValue, watch } = useFormContext<AddRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const imageBaseUrl = getImageBaseUrl(chainId)
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
        !gaugeRewardTokens.some((rewardToken) => isAddressEqual(rewardToken as Address, token.address as Address))
    )
  }, [tokensMapper, gaugeRewardsDistributors])

  useEffect(() => {
    if (!isGaugeRewardsDistributorsSuccess) return

    const rewardTokenId = getValues('rewardTokenId')

    const isRewardTokenInGaugeRewardsDistributors = Object.keys(gaugeRewardsDistributors || {}).some(
      (gaugeRewardToken) => isAddressEqual(gaugeRewardToken as Address, rewardTokenId as Address)
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
        imageBaseUrl={imageBaseUrl}
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

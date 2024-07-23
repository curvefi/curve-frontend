import React, { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { t } from '@lingui/macro'
import { isAddressEqual, zeroAddress, type Address } from 'viem'
import { useGaugeRewardsDistributors } from '@/entities/gauge'
import useTokensMapper from '@/hooks/useTokensMapper'
import { getImageBaseUrl } from '@/utils/utilsCurvejs'
import { FlexItemToken, SubTitle, StyledTokenComboBox } from './styled'

export const TokenSelector: React.FC<{ chainId: ChainId; poolId: string; disabled: boolean }> = ({
  chainId,
  poolId,
  disabled,
}) => {
  const { getValues, setValue, watch } = useFormContext()
  const rewardToken = watch('rewardToken')
  const imageBaseUrl = getImageBaseUrl(chainId)
  const { tokensMapper } = useTokensMapper(chainId)
  const { data: gaugeRewardsDistributors, isSuccess: isGaugeRewardsDistributorsSuccess } =
    useGaugeRewardsDistributors(poolId)

  const filteredTokens = useMemo(() => {
    const gaugeRewardTokens = Object.keys(gaugeRewardsDistributors || {})
    return Object.values(tokensMapper).filter(
      (token): token is Token =>
        token !== undefined &&
        !gaugeRewardTokens.some((rewardToken) => isAddressEqual(rewardToken as Address, token.address as Address))
    )
  }, [tokensMapper, gaugeRewardsDistributors])

  useEffect(() => {
    if (!isGaugeRewardsDistributorsSuccess) return

    const rewardToken = getValues('rewardToken')

    const isRewardTokenInGaugeRewardsDistributors = Object.keys(gaugeRewardsDistributors || {}).some(
      (gaugeRewardToken) => isAddressEqual(gaugeRewardToken as Address, rewardToken as Address)
    )
    if (isRewardTokenInGaugeRewardsDistributors || rewardToken === zeroAddress) {
      setValue('rewardToken', filteredTokens[0].address)
    }
  }, [gaugeRewardsDistributors, getValues, setValue, isGaugeRewardsDistributorsSuccess, filteredTokens])

  return (
    <FlexItemToken>
      <SubTitle>{t`Token`}</SubTitle>
      <StyledTokenComboBox
        title={t`Select a Token`}
        imageBaseUrl={imageBaseUrl}
        listBoxHeight="400px"
        selectedToken={rewardToken ? tokensMapper[rewardToken] : undefined}
        showSearch={true}
        tokens={filteredTokens}
        onSelectionChange={(value) => {
          setValue('rewardToken', value as string, { shouldValidate: true })
        }}
        disabled={disabled}
      />
    </FlexItemToken>
  )
}

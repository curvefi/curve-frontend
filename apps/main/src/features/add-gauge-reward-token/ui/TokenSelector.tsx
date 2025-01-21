import { t } from '@lingui/macro'
import React, { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { type Address, isAddressEqual, zeroAddress } from 'viem'
import type { AddRewardFormValues } from '@main/features/add-gauge-reward-token/types'
import { FlexItemToken, StyledTokenComboBox, SubTitle } from '@main/features/add-gauge-reward-token/ui'
import { useGaugeRewardsDistributors } from '@main/entities/gauge'
import { NETWORK_TOKEN } from '@main/constants'
import useTokensMapper from '@main/hooks/useTokensMapper'
import useStore from '@main/store/useStore'
import { ChainId, Token } from '@main/types/main.types'

export const TokenSelector: React.FC<{ chainId: ChainId; poolId: string; disabled: boolean }> = ({
  chainId,
  poolId,
  disabled,
}) => {
  const { getValues, setValue, watch } = useFormContext<AddRewardFormValues>()
  const aliasesCrv = useStore((state) => state.networks.aliases[chainId]?.crv)
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
        !aliasesCrv &&
        ![...gaugeRewardTokens, zeroAddress, NETWORK_TOKEN, aliasesCrv].some((rewardToken) =>
          isAddressEqual(rewardToken as Address, token.address as Address),
        ),
    )
  }, [gaugeRewardsDistributors, tokensMapper, aliasesCrv])

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

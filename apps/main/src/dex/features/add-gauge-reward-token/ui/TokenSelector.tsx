import { t } from '@ui-kit/lib/i18n'
import React, { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { type Address, isAddressEqual, zeroAddress } from 'viem'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { FlexItemToken, SubTitle } from '@/dex/features/add-gauge-reward-token/ui'
import { useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { NETWORK_TOKEN } from '@/dex/constants'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import useStore from '@/dex/store/useStore'
import { ChainId, Token } from '@/dex/types/main.types'
import { TokenSelector as TokenSelectorUIKit } from '@ui-kit/features/select-token'

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
    return Object.values(tokensMapper)
      .filter(
        (token): token is Token =>
          token !== undefined &&
          token.decimals === 18 &&
          !aliasesCrv &&
          ![...gaugeRewardTokens, zeroAddress, NETWORK_TOKEN, aliasesCrv].some((rewardToken) =>
            isAddressEqual(rewardToken as Address, token.address as Address),
          ),
      )
      .map((token) => ({
        chain: network?.networkId ?? '',
        address: token?.address as `0x${string}`,
        symbol: token?.symbol,
        label: '',
      }))
  }, [gaugeRewardsDistributors, tokensMapper, aliasesCrv, network.networkId])

  const selectedToken = filteredTokens.find((x) => x.address === rewardTokenId)

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
      <TokenSelectorUIKit
        selectedToken={selectedToken}
        tokens={filteredTokens}
        disabled={disabled || filteredTokens.length === 0}
        onToken={(token) => {
          setValue('rewardTokenId', token.address, { shouldValidate: true })
        }}
        sx={{
          width: '100%',
          height: '100%',
        }}
      />
    </FlexItemToken>
  )
}

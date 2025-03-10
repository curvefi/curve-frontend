import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { type Address, isAddressEqual, zeroAddress } from 'viem'
import { NETWORK_TOKEN } from '@/dex/constants'
import { useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { FlexItemToken, SubTitle } from '@/dex/features/add-gauge-reward-token/ui'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import useStore from '@/dex/store/useStore'
import { ChainId, Token } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { TokenSelector as TokenSelectorUIKit } from '@ui-kit/features/select-token'
import { t } from '@ui-kit/lib/i18n'

export const TokenSelector = ({
  chainId,
  poolId,
  disabled,
}: {
  chainId: ChainId
  poolId: string
  disabled: boolean
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
      .map(toTokenOption(network?.networkId))
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

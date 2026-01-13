import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { type Address, isAddressEqual, zeroAddress } from 'viem'
import { ethAddress } from 'viem'
import { useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { FlexItemToken, SubTitle } from '@/dex/features/add-gauge-reward-token/ui'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { ChainId, Token } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { TokenList, TokenSelector as TokenSelectorUIKit } from '@ui-kit/features/select-token'
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
  const { curveApi } = useCurve()
  const aliasesCrv = curveApi?.getNetworkConstants()?.ALIASES?.crv
  const { getValues, setValue, watch } = useFormContext<AddRewardFormValues>()
  const { data: network } = useNetworkByChain({ chainId })
  const rewardTokenId = watch('rewardTokenId')
  const { tokensMapper } = useTokensMapper(chainId)

  const { data: gaugeRewardsDistributors, isSuccess: isGaugeRewardsDistributorsSuccess } = useGaugeRewardsDistributors({
    chainId,
    poolId,
  })

  const filteredTokens = useMemo(
    () =>
      Object.values(tokensMapper)
        .filter(
          (token): token is Token =>
            !!token &&
            // Roman: "There are calculation errors for coins with small decimals, including USDC. Though, new cross chain gauges are good with it, so it depends which gauge do you ask"
            // I fixed it here: https://github.com/curvefi/curve-xchain-factory/blob/3e03f19d49826cad7c1e84829b35cc34955b046e/contracts/implementations/ChildGauge.vy#L117
            token.decimals == 18 &&
            !!aliasesCrv &&
            ![
              ...Object.keys(gaugeRewardsDistributors || {}), // Tokens already added as reward
              zeroAddress,
              ethAddress,
              aliasesCrv,
            ].some((rewardToken) => isAddressEqual(rewardToken as Address, token.address as Address)),
        )
        .map(toTokenOption(network?.networkId)),
    [gaugeRewardsDistributors, tokensMapper, aliasesCrv, network.networkId],
  )

  const selectedToken = filteredTokens.find((x) => x.address === rewardTokenId)

  useEffect(() => {
    if (!isGaugeRewardsDistributorsSuccess) return

    const rewardTokenId = getValues('rewardTokenId')

    const isRewardTokenInGaugeRewardsDistributors = Object.keys(gaugeRewardsDistributors || {}).some(
      (gaugeRewardToken) => isAddressEqual(gaugeRewardToken as Address, rewardTokenId as Address),
    )
    if (filteredTokens.length > 0 && (isRewardTokenInGaugeRewardsDistributors || rewardTokenId === zeroAddress)) {
      setValue('rewardTokenId', filteredTokens[0].address, { shouldValidate: true })
    }
  }, [gaugeRewardsDistributors, getValues, setValue, isGaugeRewardsDistributorsSuccess, filteredTokens])

  return (
    <FlexItemToken>
      <SubTitle>{t`Token`}</SubTitle>
      <TokenSelectorUIKit selectedToken={selectedToken} disabled={disabled || filteredTokens.length === 0}>
        <TokenList
          tokens={filteredTokens}
          onToken={(token) => setValue('rewardTokenId', token.address, { shouldValidate: true })}
        />
      </TokenSelectorUIKit>
    </FlexItemToken>
  )
}

import { useEffect, useMemo } from 'react'
import { type Address, isAddressEqual, zeroAddress } from 'viem'
import { ethAddress } from 'viem'
import { useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { ChainId } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useFormContext } from '@evm-ui/features/forms'
import { TokenList, TokenSelector as TokenSelectorUIKit } from '@evm-ui/features/select-token'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { notFalsy } from '@primitives/objects.utils'

const { Spacing } = SizesAndSpaces

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
  const { getValue, update: updateForm, watchValue } = useFormContext<AddRewardFormValues>()
  const { data: network } = useNetworkByChain({ chainId })
  const rewardTokenId = watchValue('rewardTokenId')
  const { tokensMapper } = useTokensMapper(chainId)

  const [isOpen, openModal, closeModal] = useSwitch()

  const { data: gaugeRewardsDistributors, isSuccess: isGaugeRewardsDistributorsSuccess } = useGaugeRewardsDistributors({
    chainId,
    poolId,
    userAddress: curveApi?.signerAddress,
  })

  const filteredTokens = useMemo(
    () =>
      notFalsy(...Object.values(tokensMapper))
        .filter(
          token =>
            // Roman: "There are calculation errors for coins with small decimals, including USDC. Though, new cross chain gauges are good with it, so it depends which gauge do you ask"
            // I fixed it here: https://github.com/curvefi/curve-xchain-factory/blob/3e03f19d49826cad7c1e84829b35cc34955b046e/contracts/implementations/ChildGauge.vy#L117
            token.decimals == 18 &&
            !!aliasesCrv &&
            ![
              ...Object.keys(gaugeRewardsDistributors ?? {}), // Tokens already added as reward
              zeroAddress,
              ethAddress,
              aliasesCrv,
            ].some(rewardToken => isAddressEqual(rewardToken as Address, token.address as Address)),
        )
        .map(toTokenOption(network?.networkId)),
    [gaugeRewardsDistributors, tokensMapper, aliasesCrv, network.networkId],
  )

  const selectedToken = filteredTokens.find(x => x.address === rewardTokenId)

  useEffect(() => {
    if (!isGaugeRewardsDistributorsSuccess) return

    const rewardTokenId = getValue('rewardTokenId')

    const isRewardTokenInGaugeRewardsDistributors = Object.keys(gaugeRewardsDistributors || {}).some(gaugeRewardToken =>
      isAddressEqual(gaugeRewardToken as Address, rewardTokenId!),
    )
    if (filteredTokens.length > 0 && (isRewardTokenInGaugeRewardsDistributors || rewardTokenId === zeroAddress)) {
      updateForm({ rewardTokenId: filteredTokens[0].address }, { automated: true })
    }
  }, [gaugeRewardsDistributors, getValue, isGaugeRewardsDistributorsSuccess, filteredTokens, updateForm])

  return (
    <Stack sx={{ gap: Spacing.xxs, width: { tablet: '7.5rem' } }}>
      <Typography variant="headingXsBold">{t`Token`}</Typography>
      <TokenSelectorUIKit
        selectedToken={selectedToken}
        disabled={disabled || filteredTokens.length === 0}
        isOpen={!!isOpen}
        onOpen={openModal}
        onClose={closeModal}
      >
        <TokenList tokens={filteredTokens} onToken={token => updateForm({ rewardTokenId: token.address })} />
      </TokenSelectorUIKit>
    </Stack>
  )
}

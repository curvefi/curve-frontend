import { useEffect, useMemo } from 'react'
import { ethAddress } from 'viem'
import { useGaugeRewardsDistributors } from '@/dex/entities/gauge/model/gauge.query'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { ChainId } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useFormContext } from '@evm-ui/features/forms'
import { TokenList, TokenSelector as TokenSelectorUIKit } from '@evm-ui/features/select-token'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { isAddressEqual, ZERO_ADDRESS as zeroAddress } from '@primitives/address.utils'
import type { Address } from '@primitives/address.utils'
import { notFalsy, objectKeys } from '@primitives/objects.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const TokenSelector = ({
  chainId,
  poolId,
  disabled,
  userAddress,
}: {
  chainId: ChainId
  poolId: string
  disabled: boolean
  userAddress: Address | undefined
}) => {
  const { curveApi } = useCurve()
  const crvAddress = curveApi?.getNetworkConstants()?.ALIASES?.crv as Address
  const { update: updateForm, watchValue } = useFormContext<AddRewardFormValues>()
  const { data: network } = useNetworkByChain({ chainId })
  const { tokensMapper } = useTokensMapper(chainId)
  const [isOpen, openModal, closeModal] = useSwitch()

  const { data: gaugeRewardsDistributors } = useGaugeRewardsDistributors({ chainId, poolId, userAddress })

  const filteredTokens = useMemo(
    () =>
      notFalsy(...Object.values(tokensMapper))
        .filter(
          token =>
            // Roman: "There are calculation errors for coins with small decimals, including USDC. Though, new cross chain gauges are good with it, so it depends which gauge do you ask"
            // I fixed it here: https://github.com/curvefi/curve-xchain-factory/blob/3e03f19d49826cad7c1e84829b35cc34955b046e/contracts/implementations/ChildGauge.vy#L117
            token.decimals == 18 &&
            !!crvAddress &&
            ![
              ...objectKeys(gaugeRewardsDistributors ?? {}), // Tokens already added as reward
              zeroAddress,
              ethAddress,
              crvAddress,
            ].some(rewardToken => isAddressEqual(rewardToken as Address, token.address as Address)),
        )
        .map(toTokenOption(network?.blockchainId)),
    [gaugeRewardsDistributors, tokensMapper, crvAddress, network.blockchainId],
  )

  const rewardTokenId = watchValue('rewardTokenId')
  const selectedToken = filteredTokens.find(x => x.address === rewardTokenId)

  useEffect(() => {
    const isRewardTokenInGaugeRewardsDistributors =
      !!rewardTokenId &&
      objectKeys(gaugeRewardsDistributors ?? {}).some(gaugeRewardToken =>
        isAddressEqual(gaugeRewardToken, rewardTokenId),
      )
    if (filteredTokens.length > 0 && (!rewardTokenId || isRewardTokenInGaugeRewardsDistributors)) {
      updateForm({ rewardTokenId: filteredTokens[0].address }, { automated: true })
    }
  }, [gaugeRewardsDistributors, rewardTokenId, filteredTokens, updateForm])

  return (
    <Stack sx={{ gap: Spacing.xxs }}>
      <Typography variant="headingXsBold">{t`Token`}</Typography>
      <TokenSelectorUIKit
        selectedToken={selectedToken}
        disabled={disabled || filteredTokens.length === 0}
        isOpen={!!isOpen}
        onOpen={openModal}
        onClose={closeModal}
        testId="add-reward-token-selector"
      >
        <TokenList tokens={filteredTokens} onToken={token => updateForm({ rewardTokenId: token.address })} />
      </TokenSelectorUIKit>
    </Stack>
  )
}

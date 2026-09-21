import { useCallback, useEffect } from 'react'
import { ethAddress, getAddress, isAddressEqual, zeroAddress } from 'viem'
import { useGaugeRewardsDistributors } from '@/dex/entities/gauge/model/gauge.query'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { useTokens } from '@/dex/queries/tokens.query'
import { ChainId } from '@/dex/types/main.types'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { TokenSelector as TokenSelectorUIKit, TokenList, TokenOption } from '@evm-ui/features/select-token'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { maybe, notFalsy, objectKeys, recordEntries } from '@primitives/objects.utils'
import { useFormContext } from '@ui/features/forms'
import { useMappedQuery } from '@ui/features/queries/util'
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
  const crvAddress = maybe(curveApi?.getNetworkConstants()?.ALIASES?.crv, crv => getAddress(crv))
  const { update: updateForm, watchValue } = useFormContext<AddRewardFormValues>()
  const { data: network } = useNetworkByChain({ chainId })
  const [isOpen, openModal, closeModal] = useSwitch()

  const { data: gaugeRewardsDistributors } = useGaugeRewardsDistributors({ chainId, poolId, userAddress })

  const { data: filteredTokens = [] } = useMappedQuery(
    useTokens({ chainId }),
    useCallback(
      tokens =>
        recordEntries(tokens)
          .filter(
            ([address, token]) =>
              // Roman: "There are calculation errors for coins with small decimals, including USDC. Though, new cross chain gauges are good with it, so it depends which gauge do you ask"
              // I fixed it here: https://github.com/curvefi/curve-xchain-factory/blob/3e03f19d49826cad7c1e84829b35cc34955b046e/contracts/implementations/ChildGauge.vy#L117
              token.decimals == 18 &&
              !!crvAddress &&
              !notFalsy(
                ...objectKeys(gaugeRewardsDistributors ?? {}), // Tokens already added as reward
                zeroAddress,
                ethAddress,
                crvAddress,
              ).some(rewardToken => isAddressEqual(rewardToken, address)),
          )
          .map<TokenOption>(([address, { symbol }]) => ({ address, symbol, chain: network?.blockchainId })),
      [gaugeRewardsDistributors, crvAddress, network.blockchainId],
    ),
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

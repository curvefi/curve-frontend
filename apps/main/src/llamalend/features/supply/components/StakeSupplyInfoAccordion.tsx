import BigNumber from 'bignumber.js'
import type { Token } from '@/llamalend/features/borrow/types'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import { useStakeEstimateGas } from '@/llamalend/queries/supply/supply-stake-estimate-gas.query'
import {
  useSharesToAssetsAmount,
  useUserStakedVaultAssetsAmount,
} from '@/llamalend/queries/supply/supply-user-vault-amounts'
import { useUserBalances } from '@/llamalend/queries/user-balances.query'
import type { StakeParams } from '@/llamalend/queries/validation/supply.validation'
import { SupplyInfoAccordion } from '@/llamalend/widgets/action-card/SupplyInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { mapQuery } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'

export type StakeSupplyInfoAccordionProps<ChainId extends IChainId> = {
  params: StakeParams<ChainId>
  networks: NetworkDict<ChainId>
  tokens: { borrowToken: Token | undefined }
}

export function StakeSupplyInfoAccordion<ChainId extends IChainId>({
  params,
  networks,
  tokens,
}: StakeSupplyInfoAccordionProps<ChainId>) {
  const [isOpen, , , toggle] = useSwitch(false)
  const { chainId, marketId, userAddress, stakeAmount } = params

  const { data: isApproved } = useStakeIsApproved(params, isOpen)
  const userBalances = useUserBalances({ chainId, marketId, userAddress })

  const marketRates = useMarketRates(params, isOpen)

  const prevStakedShares = mapQuery(userBalances, (d) => d.gauge)
  const stakedShares = mapQuery(
    prevStakedShares,
    (prevAmount) => stakeAmount && decimal(new BigNumber(prevAmount).plus(stakeAmount)),
  )

  const prevAmountStaked = useUserStakedVaultAssetsAmount({ chainId, marketId, userAddress }, isOpen)
  const amountStakedAssets = useSharesToAssetsAmount({ ...params, shares: stakeAmount }, isOpen)

  const amountStaked = mapQuery(
    prevAmountStaked,
    (prevAmount) => amountStakedAssets.data && decimal(new BigNumber(prevAmount).plus(amountStakedAssets.data)),
  )

  return (
    <SupplyInfoAccordion
      title={t`Staked shares`}
      amountLabel={t`Amount staked`}
      isOpen={isOpen}
      toggle={toggle}
      isApproved={isApproved}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={prevStakedShares}
      vaultShares={stakedShares}
      prevAmountSupplied={prevAmountStaked}
      amountSupplied={amountStaked}
      supplyApy={mapQuery(marketRates, (d) => d.lendApy)}
      gas={useStakeEstimateGas(networks, params, isOpen)}
    />
  )
}

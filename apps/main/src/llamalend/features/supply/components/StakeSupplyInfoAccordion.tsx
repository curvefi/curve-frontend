import BigNumber from 'bignumber.js'
import type { Token } from '@/llamalend/features/borrow/types'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import { useStakeEstimateGas } from '@/llamalend/queries/supply/supply-stake-estimate-gas.query'
import {
  useSharesToAssetsAmount,
  useUserStakedVaultSharesToAssetsAmount,
} from '@/llamalend/queries/supply/supply-user-vault-amounts'
import { useUserBalances } from '@/llamalend/queries/user-balances.query'
import type { StakeParams } from '@/llamalend/queries/validation/supply.validation'
import { SupplyInfoAccordion } from '@/llamalend/widgets/action-card/SupplyInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
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
  const { chainId, marketId, userAddress, stakeAmount } = params
  const isOpen = !!stakeAmount

  const { data: isApproved } = useStakeIsApproved(params, isOpen)
  const userBalances = useUserBalances({ chainId, marketId, userAddress }, isOpen)

  const marketRates = useMarketRates(params, isOpen)

  const prevStakedShares = mapQuery(userBalances, (d) => d.gauge)
  const stakedShares = mapQuery(
    prevStakedShares,
    (prevAmount) => stakeAmount && decimal(new BigNumber(prevAmount).plus(stakeAmount)),
  )

  const prevAmountStaked = useUserStakedVaultSharesToAssetsAmount({ chainId, marketId, userAddress }, isOpen)
  const amountStakedAssets = useSharesToAssetsAmount({ ...params, shares: stakeAmount }, isOpen)

  const amountStaked = mapQuery(
    prevAmountStaked,
    (prevAmount) => amountStakedAssets.data && decimal(new BigNumber(prevAmount).plus(amountStakedAssets.data)),
  )

  return (
    <SupplyInfoAccordion
      sharesLabel={t`Staked shares`}
      amountLabel={t`Amount staked`}
      isOpen={isOpen}
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

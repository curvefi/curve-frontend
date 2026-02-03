import BigNumber from 'bignumber.js'
import type { Token } from '@/llamalend/features/borrow/types'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useUnstakeEstimateGas } from '@/llamalend/queries/supply/supply-unstake-estimate-gas.query'
import {
  useSharesToAssetsAmount,
  useUserStakedVaultAssetsAmount,
} from '@/llamalend/queries/supply/supply-user-vault-amounts'
import { useUserBalances } from '@/llamalend/queries/user-balances.query'
import type { UnstakeParams } from '@/llamalend/queries/validation/supply.validation'
import { SupplyInfoAccordion } from '@/llamalend/widgets/action-card/SupplyInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { mapQuery } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'

export type UnstakeSupplyInfoAccordionProps<ChainId extends IChainId> = {
  params: UnstakeParams<ChainId>
  networks: NetworkDict<ChainId>
  tokens: { borrowToken: Token | undefined }
}

export function UnstakeSupplyInfoAccordion<ChainId extends IChainId>({
  params,
  networks,
  tokens,
}: UnstakeSupplyInfoAccordionProps<ChainId>) {
  const [isOpen, , , toggle] = useSwitch(false)
  const { chainId, marketId, userAddress, unstakeAmount } = params

  const userBalances = useUserBalances({ chainId, marketId, userAddress })

  const marketRates = useMarketRates(params, isOpen)

  const prevStakedShares = mapQuery(userBalances, (d) => d.gauge)
  const stakedShares = mapQuery(
    prevStakedShares,
    (prevAmount) => unstakeAmount && decimal(new BigNumber(prevAmount).minus(unstakeAmount)),
  )

  const prevAmountStaked = useUserStakedVaultAssetsAmount({ chainId, marketId, userAddress }, isOpen)
  const amountUnstakedAssets = useSharesToAssetsAmount({ ...params, shares: unstakeAmount }, isOpen)

  const amountStaked = mapQuery(
    prevAmountStaked,
    (prevAmount) => amountUnstakedAssets.data && decimal(new BigNumber(prevAmount).minus(amountUnstakedAssets.data)),
  )

  return (
    <SupplyInfoAccordion
      title={t`Staked shares`}
      amountLabel={t`Amount staked`}
      isOpen={isOpen}
      toggle={toggle}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={prevStakedShares}
      vaultShares={stakedShares}
      prevAmountSupplied={prevAmountStaked}
      amountSupplied={amountStaked}
      supplyApy={mapQuery(marketRates, (d) => d.lendApy)}
      gas={useUnstakeEstimateGas(networks, params, isOpen)}
    />
  )
}

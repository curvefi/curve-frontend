import BigNumber from 'bignumber.js'
import type { Token } from '@/llamalend/features/borrow/types'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketSupplyFutureRates } from '@/llamalend/queries/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useWithdrawExpectedVaultShares } from '@/llamalend/queries/supply/supply-expected-vault-shares.query'
import { useUserVaultAssetsAmount } from '@/llamalend/queries/supply/supply-user-vault-amounts'
import { useWithdrawEstimateGas } from '@/llamalend/queries/supply/supply-withdraw-estimate-gas.query'
import { useUserBalances } from '@/llamalend/queries/user-balances.query'
import type { WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import { SupplyInfoAccordion } from '@/llamalend/widgets/action-card/SupplyInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { mapQuery } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'

export type WithdrawSupplyInfoAccordionProps<ChainId extends IChainId> = {
  params: WithdrawParams<ChainId>
  networks: NetworkDict<ChainId>
  tokens: { borrowToken: Token | undefined }
}

export function WithdrawSupplyInfoAccordion<ChainId extends IChainId>({
  params,
  networks,
  tokens,
}: WithdrawSupplyInfoAccordionProps<ChainId>) {
  const [isOpen, , , toggle] = useSwitch(false)
  const { chainId, marketId, userAddress, withdrawAmount } = params

  const userBalances = useUserBalances({ chainId, marketId, userAddress })
  const prevVaultShares = mapQuery(userBalances, (d) => d.vaultShares)
  const vaultShares = useWithdrawExpectedVaultShares(params, isOpen)

  const marketRates = useMarketRates(params, isOpen)
  const futureRates = useMarketSupplyFutureRates({ chainId, marketId, reserves: withdrawAmount }, isOpen)

  const prevAmountSupplied = useUserVaultAssetsAmount({ chainId, marketId, userAddress }, isOpen)
  const amountSupplied = mapQuery(
    prevAmountSupplied,
    (prevAmount) => withdrawAmount && decimal(new BigNumber(prevAmount).minus(withdrawAmount)),
  )

  return (
    <SupplyInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={prevVaultShares}
      vaultShares={vaultShares}
      prevAmountSupplied={prevAmountSupplied}
      amountSupplied={amountSupplied}
      prevSupplyApy={mapQuery(marketRates, (d) => d.lendApy)}
      supplyApy={mapQuery(futureRates, (d) => d.lendApy)}
      gas={useWithdrawEstimateGas(networks, params, isOpen)}
    />
  )
}

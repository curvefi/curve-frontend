import BigNumber from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketSupplyFutureRates } from '@/llamalend/queries/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market-rates.query'
import { useWithdrawExpectedVaultShares } from '@/llamalend/queries/supply/supply-expected-vault-shares.query'
import { useUserVaultSharesToAssetsAmount } from '@/llamalend/queries/supply/supply-user-vault-amounts'
import { useWithdrawEstimateGas } from '@/llamalend/queries/supply/supply-withdraw-estimate-gas.query'
import { useUserBalances } from '@/llamalend/queries/user'
import type { WithdrawForm, WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

export type WithdrawSupplyInfoListProps<ChainId extends IChainId> = {
  params: WithdrawParams<ChainId>
  networks: NetworkDict<ChainId>
  tokens: { borrowToken: Token | undefined }
  form: UseFormReturn<WithdrawForm>
}

export function WithdrawSupplyInfoList<ChainId extends IChainId>({
  params,
  networks,
  tokens,
  form,
}: WithdrawSupplyInfoListProps<ChainId>) {
  const { chainId, marketId, userAddress, withdrawAmount } = params
  const isOpen = isFormTouched(form, 'withdrawAmount')

  const userBalances = useUserBalances({ chainId, marketId, userAddress }, isOpen)
  const prevVaultShares = mapQuery(userBalances, (d) => d.vaultShares)
  const vaultShares = useWithdrawExpectedVaultShares(params, isOpen)

  const marketRates = useMarketRates(params, isOpen)
  const futureRates = useMarketSupplyFutureRates({ chainId, marketId, reserves: withdrawAmount }, isOpen)

  const prevAmountSupplied = useUserVaultSharesToAssetsAmount({ chainId, marketId, userAddress }, isOpen)
  const amountSupplied = mapQuery(
    prevAmountSupplied,
    (prevAmount) => withdrawAmount && decimal(new BigNumber(prevAmount).minus(withdrawAmount)),
  )

  return (
    <SupplyActionInfoList
      isOpen={isOpen}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={prevVaultShares}
      vaultShares={q(vaultShares)}
      prevAmountSupplied={q(prevAmountSupplied)}
      amountSupplied={amountSupplied}
      prevSupplyApy={mapQuery(marketRates, (d) => d.lendApy)}
      supplyApy={mapQuery(futureRates, (d) => d.lendApy)}
      gas={q(useWithdrawEstimateGas(networks, params, isOpen))}
    />
  )
}

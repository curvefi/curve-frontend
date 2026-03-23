import BigNumber from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketSupplyFutureRates, useMarketRates } from '@/llamalend/queries/market'
import { useWithdrawRemovableVaultShares } from '@/llamalend/queries/supply/supply-expected-vault-shares.query'
import { useWithdrawEstimateGas } from '@/llamalend/queries/supply/supply-withdraw-estimate-gas.query'
import type { WithdrawForm, WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'
import { useVaultUserBalances } from '../hooks/useVaultUserBalances'

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
  const { chainId, marketId, userAddress, withdrawAmount, isFull } = params
  const isOpen = isFormTouched(form, 'withdrawAmount')

  const marketRates = useMarketRates(params, isOpen)
  const futureRates = useMarketSupplyFutureRates({ chainId, marketId, reserves: withdrawAmount }, isOpen)

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, isOpen)
  const removableVaultShares = useWithdrawRemovableVaultShares(params, isOpen)

  return (
    <SupplyActionInfoList
      isOpen={isOpen}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, (d) => d.totalShares)}
      vaultShares={{
        data:
          userBalances.data.totalShares &&
          removableVaultShares.data &&
          userBalances.data.depositedShares &&
          decimal(
            new BigNumber(userBalances.data.totalShares).minus(
              isFull ? userBalances.data.depositedShares : removableVaultShares.data,
            ),
          ),
        ...combineQueryState(userBalances, removableVaultShares),
      }}
      prevAmountSupplied={mapQuery(userBalances, (d) => d.totalSharesAmount)}
      amountSupplied={mapQuery(
        userBalances,
        (d) =>
          d.totalSharesAmount && withdrawAmount && decimal(new BigNumber(d.totalSharesAmount).minus(withdrawAmount)),
      )}
      prevSupplyApy={mapQuery(marketRates, (d) => d.lendApy)}
      supplyApy={mapQuery(futureRates, (d) => d.lendApy)}
      gas={q(useWithdrawEstimateGas(networks, params, isOpen))}
    />
  )
}

import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useWithdrawRemovableVaultShares } from '@/llamalend/queries/supply/supply-expected-vault-shares.query'
import { useWithdrawEstimateGas } from '@/llamalend/queries/supply/supply-withdraw-estimate-gas.query'
import type { WithdrawForm, WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import { useSupplyRates } from '@/llamalend/widgets/action-card/hooks/useSupplyRates'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { UseFormReturn } from '@ui-kit/forms'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalMinus } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'
import { useVaultUserBalances } from '../hooks/useVaultUserBalances'

type WithdrawSupplyInfoListProps<ChainId extends IChainId> = {
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

  const { prevRates, rates, prevNetSupplyApy, netSupplyApy } = useSupplyRates(
    { params, reservesDelta: withdrawAmount && decimalMinus('0', withdrawAmount) },
    isOpen,
  )

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, isOpen)
  const removableVaultShares = useWithdrawRemovableVaultShares(params, isOpen)

  return (
    <SupplyActionInfoList
      isOpen={isOpen}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, d => d.totalShares)}
      vaultShares={{
        data:
          userBalances.data.totalShares &&
          removableVaultShares.data &&
          userBalances.data.depositedShares &&
          decimalMinus(
            userBalances.data.totalShares,
            isFull ? userBalances.data.depositedShares : removableVaultShares.data,
          ),
        ...combineQueryState(userBalances, removableVaultShares),
      }}
      prevAmountSupplied={mapQuery(userBalances, d => d.totalSharesAmount)}
      amountSupplied={mapQuery(
        userBalances,
        d => d.totalSharesAmount && withdrawAmount && decimalMinus(d.totalSharesAmount, withdrawAmount),
      )}
      prevSupplyApy={mapQuery(prevRates, d => d.lendApy)}
      supplyApy={mapQuery(rates, d => d.lendApy)}
      prevNetSupplyApy={prevNetSupplyApy}
      netSupplyApy={netSupplyApy}
      gas={q(useWithdrawEstimateGas(networks, params, isOpen))}
    />
  )
}

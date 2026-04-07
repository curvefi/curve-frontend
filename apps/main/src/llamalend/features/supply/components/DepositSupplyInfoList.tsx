import type { UseFormReturn } from 'react-hook-form'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import { useDepositEstimateGas } from '@/llamalend/queries/supply/supply-deposit-estimate-gas.query'
import { useDepositExpectedVaultShares } from '@/llamalend/queries/supply/supply-expected-vault-shares.query'
import type { DepositForm, DepositParams } from '@/llamalend/queries/validation/supply.validation'
import { useSupplyRates } from '@/llamalend/widgets/action-card/hooks/useSupplyRates'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'
import { useVaultUserBalances } from '../hooks/useVaultUserBalances'

export type DepositSupplyInfoListProps<ChainId extends IChainId> = {
  params: DepositParams<ChainId>
  networks: NetworkDict<ChainId>
  tokens: { borrowToken: Token | undefined }
  form: UseFormReturn<DepositForm>
}

export function DepositSupplyInfoList<ChainId extends IChainId>({
  params,
  networks,
  tokens,
  form,
}: DepositSupplyInfoListProps<ChainId>) {
  const { chainId, marketId, userAddress, depositAmount } = params
  const isOpen = isFormTouched(form, 'depositAmount')

  const { data: isApproved } = useDepositIsApproved(params, isOpen)

  const { prevRates, rates, prevNetSupplyApy, netSupplyApy } = useSupplyRates(
    { params, reservesDelta: depositAmount },
    isOpen,
  )

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, isOpen)
  const additionalVaultShares = useDepositExpectedVaultShares(params, isOpen)

  return (
    <SupplyActionInfoList
      isOpen={isOpen}
      isApproved={isApproved}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, (d) => d.totalShares)}
      vaultShares={{
        data:
          userBalances.data.totalShares &&
          additionalVaultShares.data &&
          decimalSum(userBalances.data.totalShares, additionalVaultShares.data),
        ...combineQueryState(userBalances, additionalVaultShares),
      }}
      prevAmountSupplied={mapQuery(userBalances, (d) => d.totalSharesAmount)}
      amountSupplied={mapQuery(
        userBalances,
        (d) => depositAmount && d.totalSharesAmount && decimalSum(d.totalSharesAmount, depositAmount),
      )}
      prevSupplyApy={mapQuery(prevRates, (d) => d.lendApy)}
      supplyApy={mapQuery(rates, (d) => d.lendApy)}
      prevNetSupplyApy={prevNetSupplyApy}
      netSupplyApy={netSupplyApy}
      gas={q(useDepositEstimateGas(networks, params, isOpen))}
    />
  )
}

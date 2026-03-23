import BigNumber from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketSupplyFutureRates, useMarketRates } from '@/llamalend/queries/market'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import { useDepositEstimateGas } from '@/llamalend/queries/supply/supply-deposit-estimate-gas.query'
import { useDepositExpectedVaultShares } from '@/llamalend/queries/supply/supply-expected-vault-shares.query'
import type { DepositForm, DepositParams } from '@/llamalend/queries/validation/supply.validation'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
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

  const marketRates = useMarketRates(params, isOpen)
  const futureRates = useMarketSupplyFutureRates({ chainId, marketId, reserves: depositAmount }, isOpen)

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
          decimal(new BigNumber(userBalances.data.totalShares).plus(additionalVaultShares.data)),
        ...combineQueryState(userBalances, additionalVaultShares),
      }}
      prevAmountSupplied={mapQuery(userBalances, (d) => d.totalSharesAmount)}
      amountSupplied={mapQuery(
        userBalances,
        (d) => depositAmount && d.totalSharesAmount && decimal(new BigNumber(d.totalSharesAmount).plus(depositAmount)),
      )}
      prevSupplyApy={mapQuery(marketRates, (d) => d.lendApy)}
      supplyApy={mapQuery(futureRates, (d) => d.lendApy)}
      gas={q(useDepositEstimateGas(networks, params, isOpen))}
    />
  )
}

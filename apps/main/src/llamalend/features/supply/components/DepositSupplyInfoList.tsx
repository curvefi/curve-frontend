import BigNumber from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import type { Token } from '@/llamalend/features/borrow/types'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketSupplyFutureRates } from '@/llamalend/queries/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import { useDepositEstimateGas } from '@/llamalend/queries/supply/supply-deposit-estimate-gas.query'
import { useDepositExpectedVaultShares } from '@/llamalend/queries/supply/supply-expected-vault-shares.query'
import { useUserVaultSharesToAssetsAmount } from '@/llamalend/queries/supply/supply-user-vault-amounts'
import { useUserBalances } from '@/llamalend/queries/user'
import type { DepositForm, DepositParams } from '@/llamalend/queries/validation/supply.validation'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

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
  const userBalances = useUserBalances({ chainId, marketId, userAddress }, isOpen)

  const marketRates = useMarketRates(params, isOpen)
  const futureRates = useMarketSupplyFutureRates({ chainId, marketId, reserves: depositAmount }, isOpen)
  const prevAmountSupplied = useUserVaultSharesToAssetsAmount({ chainId, marketId, userAddress }, isOpen)
  const amountSupplied = mapQuery(
    prevAmountSupplied,
    (prevAmount) => depositAmount && decimal(new BigNumber(prevAmount).plus(depositAmount)),
  )

  return (
    <SupplyActionInfoList
      isOpen={isOpen}
      isApproved={isApproved}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, (d) => d.vaultShares)}
      vaultShares={q(useDepositExpectedVaultShares(params, isOpen))}
      prevAmountSupplied={prevAmountSupplied}
      amountSupplied={amountSupplied}
      prevSupplyApy={mapQuery(marketRates, (d) => d.lendApy)}
      supplyApy={mapQuery(futureRates, (d) => d.lendApy)}
      gas={useDepositEstimateGas(networks, params, isOpen)}
    />
  )
}

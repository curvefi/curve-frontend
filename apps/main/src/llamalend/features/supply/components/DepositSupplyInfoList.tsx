import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import { useDepositEstimateGas } from '@/llamalend/queries/supply/supply-deposit-estimate-gas.query'
import { useDepositExpectedVaultShares } from '@/llamalend/queries/supply/supply-expected-vault-shares.query'
import type { DepositForm, DepositParams } from '@/llamalend/queries/validation/supply.validation'
import { useSupplyRates } from '@/llamalend/widgets/action-card/hooks/useSupplyRates'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Token } from '@primitives/address.utils'
import { maybes } from '@primitives/objects.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { combineQueries } from '@ui-kit/lib/queries/combine'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { useVaultUserBalances } from '../hooks/useVaultUserBalances'

type DepositSupplyInfoListProps<ChainId extends IChainId> = {
  params: DepositParams<ChainId>
  networks: NetworkDict<ChainId>
  tokens: { borrowToken: Token | undefined }
  form: UseFormReturn<DepositForm>
  controllerAddress: Address | undefined
}

export function DepositSupplyInfoList<ChainId extends IChainId>({
  params,
  networks,
  tokens,
  form,
  controllerAddress,
}: DepositSupplyInfoListProps<ChainId>) {
  const { chainId, marketId, userAddress, depositAmount } = params
  const isOpen = form.isTouched('depositAmount')

  const { data: isApproved } = useDepositIsApproved(params, isOpen)

  const { prevRates, rates, prevNetSupplyApy, netSupplyApy } = useSupplyRates(
    { params, reservesDelta: depositAmount, controllerAddress },
    isOpen,
  )

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, isOpen)
  const additionalVaultShares = useDepositExpectedVaultShares(params, isOpen)

  return (
    <SupplyActionInfoList
      isOpen={isOpen}
      isApproved={isApproved}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, d => d.totalShares)}
      vaultShares={combineQueries([userBalances, additionalVaultShares], ({ totalShares }, additionalVaultShares) =>
        maybes([totalShares, additionalVaultShares], decimalSum),
      )}
      prevSuppliedAssets={mapQuery(userBalances, d => d.totalSharesAmount)}
      suppliedAssets={mapQuery(userBalances, d => maybes([d.totalSharesAmount, depositAmount], decimalSum))}
      prevSupplyApy={mapQuery(prevRates, d => d.lendApy)}
      supplyApy={mapQuery(rates, d => d.lendApy)}
      prevNetSupplyApy={prevNetSupplyApy}
      netSupplyApy={netSupplyApy}
      gas={q(useDepositEstimateGas(networks, params, isOpen))}
    />
  )
}

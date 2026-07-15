import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useWithdrawRemovableVaultShares } from '@/llamalend/queries/supply/supply-expected-vault-shares.query'
import { useWithdrawEstimateGas } from '@/llamalend/queries/supply/supply-withdraw-estimate-gas.query'
import type { WithdrawForm, WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import { useSupplyRates } from '@/llamalend/widgets/action-card/hooks/useSupplyRates'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Token } from '@primitives/address.utils'
import { maybes } from '@primitives/objects.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { combineQueries } from '@ui-kit/lib/queries/combine'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalMinus, decimalNegate } from '@ui-kit/utils'
import { useVaultUserBalances } from '../hooks/useVaultUserBalances'

type WithdrawSupplyInfoListProps<ChainId extends IChainId> = {
  params: WithdrawParams<ChainId>
  networks: NetworkDict<ChainId>
  tokens: { borrowToken: Token | undefined }
  form: UseFormReturn<WithdrawForm>
  controllerAddress: Address | undefined
}

export function WithdrawSupplyInfoList<ChainId extends IChainId>({
  params,
  networks,
  tokens,
  form,
  controllerAddress,
}: WithdrawSupplyInfoListProps<ChainId>) {
  const { chainId, marketId, userAddress, withdrawAmount, isFull } = params
  const isOpen = form.isTouched('withdrawAmount')

  const { prevRates, rates, prevNetSupplyApy, netSupplyApy } = useSupplyRates(
    { params, reservesDelta: decimalNegate(withdrawAmount), controllerAddress },
    isOpen,
  )

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, isOpen)
  const removableVaultShares = useWithdrawRemovableVaultShares(params, isOpen)

  return (
    <SupplyActionInfoList
      isOpen={isOpen}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, d => d.totalShares)}
      vaultShares={combineQueries(
        [userBalances, removableVaultShares],
        ({ depositedShares, totalShares }, removableVaultShares) =>
          maybes([totalShares, isFull ? depositedShares : removableVaultShares], decimalMinus),
      )}
      prevSuppliedAssets={mapQuery(userBalances, d => d.totalSharesAmount)}
      suppliedAssets={mapQuery(userBalances, d => maybes([d.totalSharesAmount, withdrawAmount], decimalMinus))}
      prevSupplyApy={mapQuery(prevRates, d => d.lendApy)}
      supplyApy={mapQuery(rates, d => d.lendApy)}
      prevNetSupplyApy={prevNetSupplyApy}
      netSupplyApy={netSupplyApy}
      gas={q(useWithdrawEstimateGas(networks, params, isOpen))}
    />
  )
}

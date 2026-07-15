import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useUnstakeEstimateGas } from '@/llamalend/queries/supply/supply-unstake-estimate-gas.query'
import type { UnstakeForm, UnstakeFormParams } from '@/llamalend/queries/validation/supply.validation'
import { useSupplyRates } from '@/llamalend/widgets/action-card/hooks/useSupplyRates'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Token } from '@primitives/address.utils'
import { maybes } from '@primitives/objects.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalMinus } from '@ui-kit/utils'
import { useVaultUserBalances } from '../hooks/useVaultUserBalances'

type UnstakeSupplyInfoListProps<ChainId extends IChainId> = {
  params: UnstakeFormParams<ChainId>
  networks: NetworkDict<ChainId>
  borrowToken: Token | undefined
  form: UseFormReturn<UnstakeForm>
  controllerAddress: Address | undefined
}

export function UnstakeSupplyInfoList<ChainId extends IChainId>({
  params,
  networks,
  borrowToken,
  form,
  controllerAddress,
}: UnstakeSupplyInfoListProps<ChainId>) {
  const { chainId, marketId, userAddress, unstakeAssets, unstakeShares } = params
  const isOpen = form.isTouched('unstakeAssets')

  const { prevRates, prevNetSupplyApy } = useSupplyRates({ params, controllerAddress }, isOpen)

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, isOpen)

  return (
    <SupplyActionInfoList
      sharesLabel={t`Staked shares`}
      amountLabel={t`Amount staked`}
      isOpen={isOpen}
      suppliedSymbol={borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, d => d.stakedShares)}
      vaultShares={mapQuery(userBalances, d => maybes([d.stakedShares, unstakeShares], decimalMinus))}
      prevSuppliedAssets={mapQuery(userBalances, d => d.stakedSharesAmount)}
      suppliedAssets={mapQuery(userBalances, d => maybes([d.stakedSharesAmount, unstakeAssets], decimalMinus))}
      supplyApy={mapQuery(prevRates, d => d.lendApy)}
      netSupplyApy={prevNetSupplyApy}
      gas={q(useUnstakeEstimateGas(networks, params, isOpen))}
    />
  )
}

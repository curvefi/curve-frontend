import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useUnstakeEstimateGas } from '@/llamalend/queries/supply/supply-unstake-estimate-gas.query'
import { useSharesToAssetsAmount } from '@/llamalend/queries/supply/supply-user-vault-amounts.query'
import type { UnstakeForm, UnstakeParams } from '@/llamalend/queries/validation/supply.validation'
import { useSupplyRates } from '@/llamalend/widgets/action-card/hooks/useSupplyRates'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Token } from '@primitives/address.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalMinus } from '@ui-kit/utils'
import { useVaultUserBalances } from '../hooks/useVaultUserBalances'

type UnstakeSupplyInfoListProps<ChainId extends IChainId> = {
  params: UnstakeParams<ChainId>
  networks: NetworkDict<ChainId>
  tokens: { borrowToken: Token | undefined }
  form: UseFormReturn<UnstakeForm>
  controllerAddress: Address | undefined
}

export function UnstakeSupplyInfoList<ChainId extends IChainId>({
  params,
  networks,
  tokens,
  form,
  controllerAddress,
}: UnstakeSupplyInfoListProps<ChainId>) {
  const { chainId, marketId, userAddress, unstakeAmount } = params
  const isOpen = form.isTouched('unstakeAmount')

  const { prevRates, prevNetSupplyApy } = useSupplyRates({ params, controllerAddress }, isOpen)

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, isOpen)
  const amountUnstakedAssets = useSharesToAssetsAmount({ ...params, shares: unstakeAmount }, isOpen)

  return (
    <SupplyActionInfoList
      sharesLabel={t`Staked shares`}
      amountLabel={t`Amount staked`}
      isOpen={isOpen}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, d => d.stakedShares)}
      vaultShares={mapQuery(
        userBalances,
        d => d.stakedShares && unstakeAmount && decimalMinus(d.stakedShares, unstakeAmount),
      )}
      prevAmountSupplied={mapQuery(userBalances, d => d.stakedSharesAmount)}
      amountSupplied={mapQuery(
        userBalances,
        d =>
          d.stakedSharesAmount &&
          amountUnstakedAssets.data &&
          decimalMinus(d.stakedSharesAmount, amountUnstakedAssets.data),
      )}
      supplyApy={mapQuery(prevRates, d => d.lendApy)}
      netSupplyApy={prevNetSupplyApy}
      gas={q(useUnstakeEstimateGas(networks, params, isOpen))}
    />
  )
}

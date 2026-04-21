import type { UseFormReturn } from 'react-hook-form'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import { useStakeEstimateGas } from '@/llamalend/queries/supply/supply-stake-estimate-gas.query'
import { useSharesToAssetsAmount } from '@/llamalend/queries/supply/supply-user-vault-amounts.query'
import type { StakeForm, StakeParams } from '@/llamalend/queries/validation/supply.validation'
import { useSupplyRates } from '@/llamalend/widgets/action-card/hooks/useSupplyRates'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'
import { useVaultUserBalances } from '../hooks/useVaultUserBalances'

type StakeSupplyInfoListProps<ChainId extends IChainId> = {
  params: StakeParams<ChainId>
  networks: NetworkDict<ChainId>
  tokens: { borrowToken: Token | undefined }
  form: UseFormReturn<StakeForm>
}

export function StakeSupplyInfoList<ChainId extends IChainId>({
  params,
  networks,
  tokens,
  form,
}: StakeSupplyInfoListProps<ChainId>) {
  const { chainId, marketId, userAddress, stakeAmount } = params
  const isOpen = isFormTouched(form, 'stakeAmount')

  const { data: isApproved } = useStakeIsApproved(params, isOpen)

  const { prevRates, prevNetSupplyApy } = useSupplyRates({ params }, isOpen)

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, isOpen)
  const amountStakedAssets = useSharesToAssetsAmount({ ...params, shares: stakeAmount }, isOpen)

  return (
    <SupplyActionInfoList
      sharesLabel={t`Staked shares`}
      amountLabel={t`Amount staked`}
      isOpen={isOpen}
      isApproved={isApproved}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, (d) => d.stakedShares)}
      vaultShares={mapQuery(
        userBalances,
        (d) => d.stakedShares && stakeAmount && decimalSum(d.stakedShares, stakeAmount),
      )}
      prevAmountSupplied={mapQuery(userBalances, (d) => d.stakedSharesAmount)}
      amountSupplied={mapQuery(
        userBalances,
        (d) =>
          d.stakedSharesAmount && amountStakedAssets.data && decimalSum(d.stakedSharesAmount, amountStakedAssets.data),
      )}
      supplyApy={mapQuery(prevRates, (d) => d.lendApy)}
      netSupplyApy={prevNetSupplyApy}
      gas={q(useStakeEstimateGas(networks, params, isOpen))}
    />
  )
}

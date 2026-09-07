import { useStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import { useStakeEstimateGas } from '@/llamalend/queries/supply/supply-stake-estimate-gas.query'
import type { StakeForm, StakeFormParams } from '@/llamalend/queries/validation/supply.validation'
import { useSupplyRates } from '@/llamalend/widgets/action-card/hooks/useSupplyRates'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { decimalSum } from '@evm-ui/utils'
import { type Address, type Token } from '@primitives/address.utils'
import { maybes } from '@primitives/objects.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { mapQuery, q } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { useVaultUserBalances } from '../hooks/useVaultUserBalances'

type StakeSupplyInfoListProps<ChainId extends IChainId> = {
  params: StakeFormParams<ChainId>
  tokens: { borrowToken: Token | undefined }
  form: UseFormReturn<StakeForm>
  controllerAddress: Address | undefined
}

export function StakeSupplyInfoList<ChainId extends IChainId>({
  params,
  tokens,
  form,
  controllerAddress,
}: StakeSupplyInfoListProps<ChainId>) {
  const { chainId, marketId, userAddress, stakeAssets, stakeShares } = params
  const isOpen = form.isTouched('stakeAssets')

  const { data: isApproved } = useStakeIsApproved(params, isOpen)

  const { prevRates, prevNetSupplyApy } = useSupplyRates({ params, controllerAddress }, isOpen)

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, isOpen)

  return (
    <SupplyActionInfoList
      sharesLabel={t`Staked shares`}
      amountLabel={t`Amount staked`}
      isOpen={isOpen}
      isApproved={isApproved}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={mapQuery(userBalances, d => d.stakedShares)}
      vaultShares={mapQuery(userBalances, d => maybes([d.stakedShares, stakeShares], decimalSum))}
      prevSuppliedAssets={mapQuery(userBalances, d => d.stakedSharesAmount)}
      suppliedAssets={mapQuery(userBalances, d => maybes([d.stakedSharesAmount, stakeAssets], decimalSum))}
      supplyApy={mapQuery(prevRates, d => d.lendApy)}
      netSupplyApy={prevNetSupplyApy}
      gas={q(useStakeEstimateGas(params, isOpen))}
    />
  )
}

import BigNumber from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketRates } from '@/llamalend/queries/market-rates.query'
import { useStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import { useStakeEstimateGas } from '@/llamalend/queries/supply/supply-stake-estimate-gas.query'
import {
  useSharesToAssetsAmount,
  useUserStakedVaultSharesToAssetsAmount,
} from '@/llamalend/queries/supply/supply-user-vault-amounts'
import { useUserBalances } from '@/llamalend/queries/user'
import type { StakeForm, StakeParams } from '@/llamalend/queries/validation/supply.validation'
import { SupplyActionInfoList } from '@/llamalend/widgets/action-card/SupplyActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

export type StakeSupplyInfoListProps<ChainId extends IChainId> = {
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
  const userBalances = useUserBalances({ chainId, marketId, userAddress }, isOpen)

  const marketRates = useMarketRates(params, isOpen)

  const prevStakedShares = mapQuery(userBalances, (d) => d.gauge)
  const stakedShares = mapQuery(
    prevStakedShares,
    (prevAmount) => stakeAmount && decimal(new BigNumber(prevAmount).plus(stakeAmount)),
  )

  const prevAmountStaked = useUserStakedVaultSharesToAssetsAmount({ chainId, marketId, userAddress }, isOpen)
  const amountStakedAssets = useSharesToAssetsAmount({ ...params, shares: stakeAmount }, isOpen)

  const amountStaked = mapQuery(
    prevAmountStaked,
    (prevAmount) => amountStakedAssets.data && decimal(new BigNumber(prevAmount).plus(amountStakedAssets.data)),
  )

  return (
    <SupplyActionInfoList
      sharesLabel={t`Staked shares`}
      amountLabel={t`Amount staked`}
      isOpen={isOpen}
      isApproved={isApproved}
      suppliedSymbol={tokens.borrowToken?.symbol}
      prevVaultShares={prevStakedShares}
      vaultShares={stakedShares}
      prevAmountSupplied={q(prevAmountStaked)}
      amountSupplied={amountStaked}
      supplyApy={mapQuery(marketRates, (d) => d.lendApy)}
      gas={q(useStakeEstimateGas(networks, params, isOpen))}
    />
  )
}

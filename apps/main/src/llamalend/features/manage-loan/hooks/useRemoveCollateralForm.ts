import {
  type RemoveCollateralOptions,
  useRemoveCollateralMutation,
} from '@/llamalend/features/manage-loan/mutations/remove-collateral.mutation'
import type { CollateralParams } from '@/llamalend/features/manage-loan/queries/manage-loan.types'
import { useRemoveCollateralBands } from '@/llamalend/features/manage-loan/queries/remove-collateral/remove-collateral-bands.query'
import { useRemoveCollateralEstimateGas } from '@/llamalend/features/manage-loan/queries/remove-collateral/remove-collateral-gas-estimate.query'
import { useRemoveCollateralHealth } from '@/llamalend/features/manage-loan/queries/remove-collateral/remove-collateral-health.query'
import { useMaxRemovableCollateral } from '@/llamalend/features/manage-loan/queries/remove-collateral/remove-collateral-max-removable.query'
import { useRemoveCollateralPrices } from '@/llamalend/features/manage-loan/queries/remove-collateral/remove-collateral-prices.query'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'

export const useRemoveCollateralForm = (
  { network }: { network: BaseConfig<LlamaNetworkId, LlamaChainId> },
  networks: NetworkDict<LlamaChainId>,
  params: CollateralParams<LlamaChainId>,
  enabled: boolean = true,
  onRemoved?: NonNullable<RemoveCollateralOptions['onRemoved']>,
) => ({
  action: useRemoveCollateralMutation({ marketId: params.marketId, network, onRemoved }),
  maxRemovable: useMaxRemovableCollateral(params, enabled),
  bands: useRemoveCollateralBands(params, enabled),
  healthFull: useRemoveCollateralHealth({ ...params, isFull: true }, enabled),
  healthNotFull: useRemoveCollateralHealth({ ...params, isFull: false }, enabled),
  prices: useRemoveCollateralPrices(params, enabled),
  gas: useRemoveCollateralEstimateGas(networks, params, enabled),
})

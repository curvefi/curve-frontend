import {
  type AddCollateralOptions,
  useAddCollateralMutation,
} from '@/llamalend/features/manage-loan/mutations/add-collateral.mutation'
import { useAddCollateralBands } from '@/llamalend/features/manage-loan/queries/add-collateral/add-collateral-bands.query'
import { useAddCollateralEstimateGas } from '@/llamalend/features/manage-loan/queries/add-collateral/add-collateral-gas-estimate.query'
import { useAddCollateralHealth } from '@/llamalend/features/manage-loan/queries/add-collateral/add-collateral-health.query'
import { useAddCollateralPrices } from '@/llamalend/features/manage-loan/queries/add-collateral/add-collateral-prices.query'
import type { CollateralParams } from '@/llamalend/features/manage-loan/queries/manage-loan.types'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'

export const useAddCollateralForm = (
  { network }: { network: BaseConfig<LlamaNetworkId, LlamaChainId> },
  networks: NetworkDict<LlamaChainId>,
  params: CollateralParams<LlamaChainId>,
  enabled: boolean = true,
  onAdded?: NonNullable<AddCollateralOptions['onAdded']>,
) => ({
  action: useAddCollateralMutation({ marketId: params.marketId, network, onAdded }),
  bands: useAddCollateralBands(params, enabled),
  healthFull: useAddCollateralHealth({ ...params, isFull: true }, enabled),
  healthNotFull: useAddCollateralHealth({ ...params, isFull: false }, enabled),
  prices: useAddCollateralPrices(params, enabled),
  gas: useAddCollateralEstimateGas(networks, params, enabled),
})

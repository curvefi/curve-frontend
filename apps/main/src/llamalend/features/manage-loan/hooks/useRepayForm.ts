import { type RepayOptions, useRepayMutation } from '@/llamalend/features/manage-loan/mutations/repay.mutation'
import type { RepayFromCollateralParams } from '@/llamalend/features/manage-loan/queries/manage-loan.types'
import { useRepayBands } from '@/llamalend/features/manage-loan/queries/repay/repay-bands.query'
import { useRepayExpectedBorrowed } from '@/llamalend/features/manage-loan/queries/repay/repay-expected-borrowed.query'
import { useRepayEstimateGas } from '@/llamalend/features/manage-loan/queries/repay/repay-gas-estimate.query'
import { useRepayHealth } from '@/llamalend/features/manage-loan/queries/repay/repay-health.query'
import { useRepayIsAvailable } from '@/llamalend/features/manage-loan/queries/repay/repay-is-available.query'
import { useRepayIsFull } from '@/llamalend/features/manage-loan/queries/repay/repay-is-full.query'
import { useRepayPriceImpact } from '@/llamalend/features/manage-loan/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/features/manage-loan/queries/repay/repay-prices.query'
import { useRepayRouteImage } from '@/llamalend/features/manage-loan/queries/repay/repay-route-image.query'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'

export const useRepayForm = (
  { network }: { network: BaseConfig<LlamaNetworkId, LlamaChainId> },
  networks: NetworkDict<LlamaChainId>,
  params: RepayFromCollateralParams<LlamaChainId>,
  enabled: boolean = true,
  onRepaid?: NonNullable<RepayOptions['onRepaid']>,
) => {
  const { chainId, marketId } = params

  return {
    chainId,
    marketId,
    params,
    action: useRepayMutation({ network, marketId, onRepaid }),
    bands: useRepayBands(params, enabled),
    expectedBorrowed: useRepayExpectedBorrowed(params, enabled),
    healthFull: useRepayHealth({ ...params, isFull: true }, enabled),
    healthNotFull: useRepayHealth({ ...params, isFull: false }, enabled),
    isAvailable: useRepayIsAvailable(params, enabled),
    isFull: useRepayIsFull(params, enabled),
    priceImpact: useRepayPriceImpact(params, enabled),
    prices: useRepayPrices(params, enabled),
    routeImage: useRepayRouteImage(params, enabled),
    gas: useRepayEstimateGas(networks, params, enabled),
  }
}

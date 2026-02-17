import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useClaimEstimateGas } from '@/llamalend/queries/supply/supply-claim-estimate-gas.query'
import { ActionInfoCollapse } from '@/llamalend/widgets/action-card/ActionInfoCollapse'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { UserMarketParams } from '@ui-kit/lib/model'
import { ActionInfoGasEstimate } from '@ui-kit/shared/ui/ActionInfo'

export type ClaimActionInfoListProps<ChainId extends IChainId> = {
  params: UserMarketParams<ChainId>
  networks: NetworkDict<ChainId>
}

const ALWAYS_OPEN = true

export const ClaimActionInfoList = <ChainId extends IChainId>({
  params,
  networks,
}: ClaimActionInfoListProps<ChainId>) => (
  <ActionInfoCollapse isOpen={ALWAYS_OPEN} testId="claim-action-info-list">
    <ActionInfoGasEstimate gas={useClaimEstimateGas(networks, params, ALWAYS_OPEN)} />
  </ActionInfoCollapse>
)

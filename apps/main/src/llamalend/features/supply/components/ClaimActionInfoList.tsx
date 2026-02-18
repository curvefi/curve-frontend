import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useClaimEstimateGas } from '@/llamalend/queries/supply/supply-claim-estimate-gas.query'
import { ActionInfoCollapse } from '@/llamalend/widgets/action-card/ActionInfoCollapse'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { UserMarketParams } from '@ui-kit/lib/model'
import { ActionInfoGasEstimate } from '@ui-kit/shared/ui/ActionInfo'

export type ClaimActionInfoListProps<ChainId extends IChainId> = {
  params: UserMarketParams<ChainId>
  networks: NetworkDict<ChainId>
  isOpen?: boolean
}

export const ClaimActionInfoList = <ChainId extends IChainId>({
  params,
  networks,
  isOpen,
}: ClaimActionInfoListProps<ChainId>) => (
  <ActionInfoCollapse isOpen={isOpen} testId="claim-action-info-list">
    <ActionInfoGasEstimate gas={useClaimEstimateGas(networks, params)} />
  </ActionInfoCollapse>
)

import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useClaimEstimateGas } from '@/llamalend/queries/supply/supply-claim-estimate-gas.query'
import { ActionInfoAccordion } from '@/llamalend/widgets/action-card/info-accordion.components'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { UserMarketParams } from '@ui-kit/lib/model'
import { ActionInfoGasEstimate } from '@ui-kit/shared/ui/ActionInfo'

export type ClaimInfoAccordionProps<ChainId extends IChainId> = {
  params: UserMarketParams<ChainId>
  networks: NetworkDict<ChainId>
}

export function ClaimInfoAccordion<ChainId extends IChainId>({ params, networks }: ClaimInfoAccordionProps<ChainId>) {
  const isOpen = true
  const gas = useClaimEstimateGas(networks, params, isOpen)

  return (
    <ActionInfoAccordion isOpen={isOpen} testId="claim-info-accordion">
      <ActionInfoGasEstimate gas={gas} />
    </ActionInfoAccordion>
  )
}

import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useClaimEstimateGas } from '@/llamalend/queries/supply/supply-claim-estimate-gas.query'
import { ActionInfoAccordion, EstimatedTxCost } from '@/llamalend/widgets/action-card/info-accordion.components'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { UserMarketParams } from '@ui-kit/lib/model'

export type ClaimInfoAccordionProps<ChainId extends IChainId> = {
  params: UserMarketParams<ChainId>
  networks: NetworkDict<ChainId>
}

export function ClaimInfoAccordion<ChainId extends IChainId>({ params, networks }: ClaimInfoAccordionProps<ChainId>) {
  const [isOpen, , , toggle] = useSwitch(false)
  const gas = useClaimEstimateGas(networks, params, isOpen)

  return (
    <ActionInfoAccordion title={t`Claim details`} expanded={isOpen} toggle={toggle} testId="claim-info-accordion">
      <Stack>
        <EstimatedTxCost gas={gas} />
      </Stack>
    </ActionInfoAccordion>
  )
}

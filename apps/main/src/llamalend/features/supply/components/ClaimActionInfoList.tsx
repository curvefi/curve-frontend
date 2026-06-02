import type { NetworkDict } from '@/llamalend/llamalend.types'
import {
  useClaimCrvEstimateGas,
  useClaimRewardsEstimateGas,
} from '@/llamalend/queries/supply/supply-claim-estimate-gas.query'
import { ActionInfoCollapse } from '@/llamalend/widgets/action-card/ActionInfoCollapse'
import { ACTION_INFO_GROUP_SX } from '@/llamalend/widgets/action-card/info-actions.helpers'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { UserMarketParams } from '@ui-kit/lib/model'
import { ActionInfoGasEstimate } from '@ui-kit/shared/ui/ActionInfo'
import { q } from '@ui-kit/types/util'

type ClaimActionInfoListProps<ChainId extends IChainId> = {
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
    <Stack sx={{ ...ACTION_INFO_GROUP_SX }}>
      <ActionInfoGasEstimate
        gas={q(useClaimRewardsEstimateGas(networks, params))}
        label={t`Claim other rewards tx cost`}
        testId="claim-other-rewards-estimated-tx-cost"
      />
      <ActionInfoGasEstimate
        gas={q(useClaimCrvEstimateGas(networks, params))}
        label={t`Claim CRV rewards tx cost`}
        testId="claim-crv-rewards-estimated-tx-cost"
      />
    </Stack>
  </ActionInfoCollapse>
)

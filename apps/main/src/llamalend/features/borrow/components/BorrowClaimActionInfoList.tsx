import { useBorrowClaimCrvEstimateGas } from '@/llamalend/queries/borrow/borrow-claim-estimate-gas.query'
import { ActionInfoCollapse } from '@/llamalend/widgets/action-card/ActionInfoCollapse'
import { ACTION_INFO_GROUP_SX } from '@/llamalend/widgets/action-card/info-actions.helpers'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import Stack from '@mui/material/Stack'
import { ActionInfoGasEstimate } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { q } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

type BorrowClaimActionInfoListProps<ChainId extends IChainId> = { params: UserMarketParams<ChainId>; isOpen?: boolean }

export const BorrowClaimActionInfoList = <ChainId extends IChainId>({
  params,
  isOpen,
}: BorrowClaimActionInfoListProps<ChainId>) => (
  <ActionInfoCollapse isOpen={isOpen} testId="borrow-claim-action-info-list">
    <Stack sx={ACTION_INFO_GROUP_SX}>
      <ActionInfoGasEstimate
        gas={q(useBorrowClaimCrvEstimateGas(params))}
        label={t`Claim CRV rewards tx cost`}
        testId="borrow-claim-crv-rewards-estimated-tx-cost"
      />
    </Stack>
  </ActionInfoCollapse>
)

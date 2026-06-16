import { ActionInfoCollapse } from '@/llamalend/widgets/action-card/ActionInfoCollapse'
import { ACTION_INFO_GROUP_SX, combineActionInfoState } from '@/llamalend/widgets/action-card/info-actions.helpers'
import { ScrvUsdExchangeRateActionInfo } from '@/loan/components/PageCrvUsdStaking/ScrvUsdExchangeRateActionInfo'
import { useScrvUsdPreviewWithdraw } from '@/loan/entities/scrvusd-preview.query'
import { useScrvUsdWithdrawEstimateGas } from '@/loan/entities/scrvusd-withdraw-estimate-gas.query'
import type { ScrvUsdWithdrawForm, ScrvUsdWithdrawParams } from '@/loan/entities/scrvusd.validation'
import type { NetworkConfig } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate } from '@ui-kit/shared/ui/ActionInfo'
import { q } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'

type ScrvUsdWithdrawInfoListProps = {
  params: ScrvUsdWithdrawParams
  networks: Record<number, NetworkConfig>
  form: UseFormReturn<ScrvUsdWithdrawForm>
}

export const ScrvUsdWithdrawInfoList = ({ params, networks, form }: ScrvUsdWithdrawInfoListProps) => {
  const isOpen = form.isTouched('withdrawAmount')
  const expectedCrvUsd = useScrvUsdPreviewWithdraw(params, isOpen)
  return (
    <ActionInfoCollapse isOpen={isOpen} testId="scrvusd-withdraw-action-info-list">
      <Stack sx={ACTION_INFO_GROUP_SX}>
        <ActionInfo
          label={t`You receive`}
          value={maybe(expectedCrvUsd.data, data => formatNumber(data, 'token.amount'))}
          valueRight="crvUSD"
          {...combineActionInfoState(q(expectedCrvUsd))}
          size="small"
          testId="scrvusd-withdraw-receive"
        />
        <ScrvUsdExchangeRateActionInfo chainId={params.chainId} enabled={isOpen} />
        <ActionInfoGasEstimate gas={q(useScrvUsdWithdrawEstimateGas(networks, params, isOpen))} />
      </Stack>
    </ActionInfoCollapse>
  )
}

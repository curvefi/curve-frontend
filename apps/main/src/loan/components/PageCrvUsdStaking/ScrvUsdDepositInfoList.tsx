import { ActionInfoCollapse } from '@/llamalend/widgets/action-card/ActionInfoCollapse'
import { ACTION_INFO_GROUP_SX, combineActionInfoState } from '@/llamalend/widgets/action-card/info-actions.helpers'
import { useScrvUsdDepositEstimateGas } from '@/loan/entities/scrvusd-deposit-estimate-gas.query'
import { useScrvUsdPreviewDeposit } from '@/loan/entities/scrvusd-preview.query'
import type { ScrvUsdDepositParams } from '@/loan/entities/scrvusd.validation'
import { networks } from '@/loan/networks'
import type { ChainId } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate } from '@ui-kit/shared/ui/ActionInfo'
import { q } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { InfiniteAllowanceActionInfo } from './InfiniteAllowanceActionInfo'
import { ScrvUsdExchangeRateActionInfo } from './ScrvUsdExchangeRateActionInfo'

type ScrvUsdDepositInfoListProps = {
  chainId: ChainId
  params: ScrvUsdDepositParams
  isOpen: boolean
  isApproved: boolean | undefined
  approveInfinite: boolean
  onApproveInfiniteToggle: () => void
}

const formatTokenAmount = (value: Decimal | undefined, symbol: string) =>
  maybe(
    value,
    value =>
      `${formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 4, abbreviate: false })} ${symbol}`,
  )

export const ScrvUsdDepositInfoList = ({
  chainId,
  params,
  isOpen,
  isApproved,
  approveInfinite,
  onApproveInfiniteToggle,
}: ScrvUsdDepositInfoListProps) => {
  const expectedScrvUsd = useScrvUsdPreviewDeposit(params, isOpen)
  const gas = useScrvUsdDepositEstimateGas(networks, params, isOpen)

  return (
    <ActionInfoCollapse isOpen={isOpen} testId="scrvusd-deposit-action-info-list">
      <Stack sx={{ ...ACTION_INFO_GROUP_SX }}>
        <ScrvUsdExchangeRateActionInfo chainId={chainId} enabled={isOpen} />
        <ActionInfo
          label={t`To Vault`}
          value={formatTokenAmount(expectedScrvUsd.data, 'scrvUSD')}
          {...combineActionInfoState(q(expectedScrvUsd))}
          size="small"
          testId="scrvusd-deposit-to-vault"
        />
        <InfiniteAllowanceActionInfo approveInfinite={approveInfinite} onToggle={onApproveInfiniteToggle} />
        <ActionInfoGasEstimate gas={q(gas)} isApproved={isApproved} testId="scrvusd-deposit-estimated-tx-cost" />
      </Stack>
    </ActionInfoCollapse>
  )
}

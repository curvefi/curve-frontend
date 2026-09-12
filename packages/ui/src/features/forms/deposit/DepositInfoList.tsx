import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import type { SlippageSettingsFormData } from '@ui/features/forms/slippage/useSlipageSettingsForm'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export type DepositInfoListProps = {
  expectedLp: QueryProp<Decimal>
  minimumLp: QueryProp<Decimal>
  currentLp: QueryProp<Decimal>
  projectedLp: QueryProp<Decimal>
  priceImpact: QueryProp<Decimal | null>
  seedLock: QueryProp<Decimal | null>
  gas: QueryProp<TxGasInfo | null>
  slippage: Decimal
  onSlippageChanged: (settings: SlippageSettingsFormData) => void
  userAddress: Address | undefined
}

export const DepositInfoList = ({
  currentLp,
  expectedLp,
  gas,
  minimumLp,
  onSlippageChanged,
  priceImpact,
  projectedLp,
  seedLock,
  slippage,
  userAddress,
}: DepositInfoListProps) => (
  <Stack>
    <ActionInfo label={t`Expected LP received`} value={expectedLp} size="small" />
    <ActionInfo label={t`Minimum LP received`} value={minimumLp} size="small" />
    <ActionInfo label={t`Current LP balance`} value={currentLp} size="small" />
    <ActionInfo label={t`Projected LP balance`} value={projectedLp} size="small" />
    <PriceImpactActionInfo
      priceImpact={priceImpact}
      value={mapQuery(priceImpact, value => maybe(value, value => `${value}%`))}
      size="small"
    />
    {seedLock.data && <ActionInfo label={t`Permanently locked LP`} value={seedLock} size="small" />}
    <SlippageToleranceActionInfo
      maxSlippage={slippage}
      onChanged={onSlippageChanged}
      type="stable"
      userAddress={userAddress}
      size="small"
    />
    <ActionInfoGasEstimate gas={gas} />
  </Stack>
)

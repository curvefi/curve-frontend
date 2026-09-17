import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import type { SlippageSettingsFormData } from '@ui/features/forms/slippage/useSlipageSettingsForm'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

type WithdrawInfoListProps = {
  expectedLp: QueryProp<Decimal>
  maximumLp: QueryProp<Decimal>
  currentLp: QueryProp<Decimal>
  projectedLp: QueryProp<Decimal>
  priceImpact: QueryProp<Decimal | null>
  gas: QueryProp<TxGasInfo | null>
  slippage: Decimal
  onSlippageChanged: (settings: SlippageSettingsFormData) => void
  userAddress: Address | undefined
}

export const WithdrawInfoList = ({
  expectedLp,
  maximumLp,
  currentLp,
  projectedLp,
  priceImpact,
  gas,
  slippage,
  onSlippageChanged,
  userAddress,
}: WithdrawInfoListProps) => (
  <Stack>
    <ActionInfo
      testId="pool-withdraw-expected-lp"
      label={t`Expected LP burned`}
      value={mapQuery(expectedLp, value => formatNumber(value, 'token.balance'))}
      size="small"
    />
    <ActionInfo
      testId="pool-withdraw-maximum-lp"
      label={t`Maximum LP burned`}
      value={mapQuery(maximumLp, value => formatNumber(value, 'token.balance'))}
      size="small"
    />
    <ActionInfo
      testId="pool-withdraw-current-lp"
      label={t`Current LP balance`}
      value={mapQuery(currentLp, value => formatNumber(value, 'token.balance'))}
      size="small"
    />
    <ActionInfo
      testId="pool-withdraw-projected-lp"
      label={t`Expected remaining LP balance`}
      value={mapQuery(projectedLp, value => formatNumber(value, 'token.balance'))}
      size="small"
    />
    <PriceImpactActionInfo
      priceImpact={priceImpact}
      value={mapQuery(priceImpact, value => formatNumber(value, 'percent.price-impact'))}
      size="small"
    />
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

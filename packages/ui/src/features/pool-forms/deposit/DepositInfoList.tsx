import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
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
  userAddress: Address | undefined
}

export const DepositInfoList = ({
  currentLp,
  expectedLp,
  gas,
  minimumLp,
  priceImpact,
  projectedLp,
  seedLock,
  slippage,
  userAddress,
}: DepositInfoListProps) => (
  <Stack>
    <ActionInfo
      testId="pool-deposit-expected-lp"
      label={t`Expected LP received`}
      value={mapQuery(expectedLp, value => formatNumber(value, 'token.balance'))}
      size="small"
    />
    <ActionInfo
      testId="pool-deposit-minimum-lp"
      label={t`Minimum LP received`}
      value={mapQuery(minimumLp, value => formatNumber(value, 'token.balance'))}
      size="small"
    />
    <ActionInfo
      testId="pool-deposit-current-lp"
      label={t`Current LP balance`}
      value={mapQuery(currentLp, value => formatNumber(value, 'token.balance'))}
      size="small"
    />
    <ActionInfo
      testId="pool-deposit-projected-lp"
      label={t`Projected LP balance`}
      value={mapQuery(projectedLp, value => formatNumber(value, 'token.balance'))}
      size="small"
    />
    <PriceImpactActionInfo
      testId="pool-price-impact"
      priceImpact={priceImpact}
      value={mapQuery(priceImpact, value => formatNumber(value, 'percent.price-impact'))}
      size="small"
    />
    {seedLock.data && (
      <ActionInfo
        testId="pool-deposit-seed-lock"
        label={t`Permanently locked LP`}
        value={mapQuery(seedLock, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    <SlippageToleranceActionInfo
      maxSlippage={slippage}
      onChanged={useUserProfileStore(state => state.setMaxSlippage)}
      type="stable"
      userAddress={userAddress}
      size="small"
    />
    <ActionInfoGasEstimate gas={gas} />
  </Stack>
)

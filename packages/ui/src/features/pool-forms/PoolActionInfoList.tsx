import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { HighPriceImpactAlert } from '@ui/features/forms/FormAlerts'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'

type PoolActionInfoListProps = {
  priceImpact: QueryProp<Decimal | null>
  gas: QueryProp<TxGasInfo | null>
  slippage: Decimal
  userAddress: Address | undefined
  expectedLp?: QueryProp<Decimal>
  expectedLpLabel?: string
  expectedLpTestId?: string
  minimumLp?: QueryProp<Decimal>
  maximumLp?: QueryProp<Decimal>
  currentLp?: QueryProp<Decimal>
  currentLpTestId?: string
  projectedLp?: QueryProp<Decimal>
  projectedLpLabel?: string
  projectedLpTestId?: string
  seedLock?: QueryProp<Decimal | null>
  exchangeRate?: QueryProp<Decimal>
  minimumReceived?: QueryProp<Decimal>
  fromSymbol?: string | undefined
  toSymbol?: string | undefined
}

export const PoolActionInfoList = ({
  priceImpact,
  gas,
  slippage,
  userAddress,
  expectedLp,
  expectedLpLabel,
  expectedLpTestId,
  minimumLp,
  maximumLp,
  currentLp,
  currentLpTestId,
  projectedLp,
  projectedLpLabel,
  projectedLpTestId,
  seedLock,
  exchangeRate,
  minimumReceived,
  fromSymbol,
  toSymbol,
}: PoolActionInfoListProps) => (
  <Stack>
    <HighPriceImpactAlert priceImpact={priceImpact} />
    {expectedLp && expectedLpLabel && expectedLpTestId && (
      <ActionInfo
        testId={expectedLpTestId}
        label={expectedLpLabel}
        value={mapQuery(expectedLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {minimumLp && (
      <ActionInfo
        testId="pool-deposit-minimum-lp"
        label={t`Minimum LP received`}
        value={mapQuery(minimumLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {maximumLp && (
      <ActionInfo
        testId="pool-withdraw-maximum-lp"
        label={t`Maximum LP burned`}
        value={mapQuery(maximumLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {currentLp && currentLpTestId && (
      <ActionInfo
        testId={currentLpTestId}
        label={t`Current LP balance`}
        value={mapQuery(currentLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {projectedLp && projectedLpLabel && projectedLpTestId && (
      <ActionInfo
        testId={projectedLpTestId}
        label={projectedLpLabel}
        value={mapQuery(projectedLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {seedLock && (
      <ActionInfo
        testId="pool-deposit-seed-lock"
        label={t`Permanently locked LP`}
        value={mapQuery(seedLock, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {exchangeRate && (
      <ActionInfo
        testId="pool-swap-exchange-rate"
        label={t`Exchange rate`}
        value={mapQuery(exchangeRate, value =>
          [formatToken(1, fromSymbol), formatToken(value, toSymbol, 'balance')].join(' = '),
        )}
        size="small"
      />
    )}
    {minimumReceived && (
      <ActionInfo
        testId="pool-swap-minimum-received"
        label={t`Minimum received`}
        value={mapQuery(minimumReceived, value => formatToken(value, toSymbol, 'balance'))}
        size="small"
      />
    )}
    <PriceImpactActionInfo
      testId="pool-price-impact"
      priceImpact={priceImpact}
      value={mapQuery(priceImpact, value => formatNumber(value, 'percent.price-impact'))}
      size="small"
    />
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

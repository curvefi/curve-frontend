import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy, type Nullish } from '@primitives/objects.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { HighPriceImpactAlert } from '@ui/features/forms/FormAlerts'
import type { SlippageType } from '@ui/features/forms/slippage/slippage.utils'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'

type PoolActionInfoListProps = {
  priceImpact: QueryProp<Decimal | null>
  gas: QueryProp<TxGasInfo | null>
  slippage: Decimal
  onSlippageChange: (slippage: Decimal) => void
  userAddress: Address | Nullish
  slippageType: SlippageType | undefined
  expectedLp?: QueryProp<Decimal>
  expectedLpLabel?: string
  expectedLpTestId?: string
  minimumLp?: QueryProp<Decimal>
  maximumLp?: QueryProp<Decimal>
  currentLp?: QueryProp<Decimal>
  currentLpTestId?: string
  projectedLp?: QueryProp<Decimal>
  seedLock?: QueryProp<Decimal | null>
  exchangeRate?: QueryProp<Decimal>
  minimumReceived?: QueryProp<{ amount: Decimal | undefined; symbol: string | undefined; isApproximate: boolean }>[]
  fromSymbol?: string | undefined
  toSymbol?: string | undefined
}

export const PoolActionInfoList = ({
  priceImpact,
  gas,
  slippage,
  onSlippageChange,
  userAddress,
  slippageType,
  expectedLp,
  expectedLpLabel,
  expectedLpTestId,
  minimumLp,
  maximumLp,
  currentLp,
  currentLpTestId,
  projectedLp,
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
    {currentLp && currentLpTestId && (
      <ActionInfo
        testId={currentLpTestId}
        label={t`LP balance`}
        value={mapQuery(currentLp, value => formatNumber(value, 'token.balance'))}
        futureValue={projectedLp && mapQuery(projectedLp, value => formatNumber(value, 'token.balance'))}
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
    <SlippageToleranceActionInfo
      maxSlippage={slippage}
      onChanged={slippage => slippageType && onSlippageChange(slippage[slippageType])}
      type={slippageType}
      userAddress={userAddress}
      size="small"
    />
    <PriceImpactActionInfo
      testId="pool-price-impact"
      priceImpact={priceImpact}
      value={mapQuery(priceImpact, value => formatNumber(value, 'percent.price-impact'))}
      size="small"
    />
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
    {!!minimumReceived?.length && (
      <ActionInfo
        testId="pool-minimum-received"
        label={t`Minimum received`}
        sx={{ alignItems: 'flex-start', '& .ActionInfo-value': { whiteSpace: 'pre-line', textAlign: 'right' } }}
        value={combineQueries(minimumReceived, (...values) =>
          values
            .map(({ amount, symbol, isApproximate }) =>
              notFalsy(isApproximate && '~', formatToken(amount, symbol, 'balance')).join(''),
            )
            .join('\n'),
        )}
        size="small"
      />
    )}
    <ActionInfoGasEstimate gas={gas} />
  </Stack>
)

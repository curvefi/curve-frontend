import { notFalsy } from 'router-api/src/router.utils'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { type Amount, Decimal, formatNumber, formatPercent } from '@ui-kit/utils'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'
import type { LoanLeverageExpectedCollateral, LoanLeverageMaxReceive, QueryData } from './LoanInfoAccordion'

export type LoanLeverageActionInfoProps = {
  expectedCollateral: QueryData<LoanLeverageExpectedCollateral | null>
  maxReceive: QueryData<LoanLeverageMaxReceive | null>
  priceImpact: QueryData<number | null>
  slippage: Decimal
  onSlippageChange: (newSlippage: Decimal) => void
  collateralSymbol?: string
}

const format = (value: Amount | null | undefined, symbol?: string) =>
  value == null ? '-' : notFalsy(formatNumber(value, { abbreviate: true }), symbol).join(' ')
const formatInt = (value: Amount | null | undefined) =>
  value == null ? '-' : formatNumber(value, { abbreviate: false, decimals: 0 })

export const LoanLeverageActionInfo = ({
  expectedCollateral,
  maxReceive,
  priceImpact,
  slippage,
  onSlippageChange,
  collateralSymbol,
}: LoanLeverageActionInfoProps) => {
  const {
    data: expectedCollateralData,
    isLoading: expectedCollateralLoading,
    error: expectedCollateralError,
  } = expectedCollateral
  const { data: maxReceiveData, isLoading: maxReceiveLoading, error: maxReceiveError } = maxReceive
  const { data: priceImpactPercent, isLoading: priceImpactPercentLoading, error: priceImpactPercentError } = priceImpact

  const { totalCollateral, leverage } = expectedCollateralData ?? {}
  const { avgPrice, maxLeverage } = maxReceiveData ?? {}

  const isHighImpact = priceImpactPercent != null && priceImpactPercent > +slippage

  return (
    <>
      <ActionInfo
        label={t`Leverage`}
        value={formatInt(leverage)}
        valueRight={maxLeverage && ` (max ${formatInt(maxLeverage)})`}
        error={expectedCollateralError || maxReceiveError}
        loading={expectedCollateralLoading || maxReceiveLoading}
      />
      <ActionInfo
        label={t`Expected`}
        value={format(totalCollateral, collateralSymbol)}
        error={expectedCollateralError}
        loading={expectedCollateralLoading}
      />
      <ActionInfo
        label={t`Expected avg. price`}
        value={format(avgPrice)}
        error={maxReceiveError}
        loading={maxReceiveLoading}
      />
      <ActionInfo
        label={isHighImpact ? t`High price impact` : t`Price impact`}
        value={formatPercent(priceImpactPercent)}
        {...(isHighImpact && { valueColor: 'error' })}
        error={priceImpactPercentError}
        loading={priceImpactPercentLoading}
        testId="borrow-price-impact"
      />
      <SlippageToleranceActionInfo maxSlippage={slippage} onSave={onSlippageChange} />
    </>
  )
}

import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { Decimal, formatPercent, formatNumber } from '@ui-kit/utils'
import { t } from '@ui-kit/lib/i18n'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'
import type { LoanLeverageExpectedCollateral, LoanLeverageMaxReceive, QueryData } from './LoanInfoAccordion'

type LoanInfoLeverageActionInfoProps = {
  expectedCollateral: QueryData<LoanLeverageExpectedCollateral | null>
  maxReceive: QueryData<LoanLeverageMaxReceive | null>
  priceImpact: QueryData<number | null>
  slippage: Decimal
  onSlippageChange: (newSlippage: Decimal) => void
  collateralSymbol?: string
}

export const LoanInfoLeverageActionInfo = ({
  expectedCollateral,
  maxReceive,
  priceImpact,
  slippage,
  onSlippageChange,
  collateralSymbol,
}: LoanInfoLeverageActionInfoProps) => {
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
        value={formatNumber(leverage, { defaultValue: '1', maximumFractionDigits: 0 })}
        valueRight={
          leverage != null && maxLeverage && ` (max ${formatNumber(maxLeverage, { maximumFractionDigits: 0 })})`
        }
        error={expectedCollateralError || maxReceiveError || undefined}
        loading={expectedCollateralLoading || maxReceiveLoading}
      />
      <ActionInfo
        label={t`Expected`}
        value={formatNumber(totalCollateral, {
          currency: collateralSymbol,
          defaultValue: '-',
        })}
        error={expectedCollateralError ?? undefined}
        loading={expectedCollateralLoading}
      />
      <ActionInfo
        label={t`Expected avg. price`}
        value={formatNumber(avgPrice, { defaultValue: '-' })}
        error={maxReceiveError ?? undefined}
        loading={maxReceiveLoading}
      />
      <ActionInfo
        label={isHighImpact ? t`High price impact` : t`Price impact`}
        value={formatPercent(priceImpactPercent, { defaultValue: '-' })}
        valueRight={priceImpactPercent != null && '%'}
        {...(isHighImpact && { valueColor: 'error' })}
        error={priceImpactPercentError ?? undefined}
        loading={priceImpactPercentLoading}
        testId="borrow-price-impact"
      />
      <SlippageToleranceActionInfo maxSlippage={slippage} onSave={onSlippageChange} />
    </>
  )
}

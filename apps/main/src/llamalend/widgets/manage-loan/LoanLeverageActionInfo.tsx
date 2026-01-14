import { notFalsy } from 'router-api/src/router.utils'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import type { Query } from '@ui-kit/types/util'
import { type Amount, Decimal, formatNumber, formatPercent } from '@ui-kit/utils'
import { SlippageToleranceActionInfoPure } from '@ui-kit/widgets/SlippageSettings'
import type { LoanLeverageExpectedCollateral, LoanLeverageMaxReceive } from './LoanInfoAccordion'

export type LoanLeverageActionInfoProps = {
  expectedCollateral?: Query<LoanLeverageExpectedCollateral | null>
  maxReceive?: Query<LoanLeverageMaxReceive | null>
  priceImpact: Query<number | null>
  slippage: Decimal
  onSlippageChange: (newSlippage: Decimal) => void
  collateralSymbol: string | undefined
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
  const isHighImpact = priceImpact.data != null && priceImpact.data > +slippage
  return (
    <Stack>
      {expectedCollateral && maxReceive && (
        <ActionInfo
          label={t`Leverage`}
          value={formatInt((expectedCollateral.data ?? {}).leverage)}
          valueRight={maxReceive.data?.maxLeverage && ` (max ${formatInt(maxReceive.data.maxLeverage)})`}
          error={[expectedCollateral, maxReceive].find((q) => q.error)?.error}
          loading={[expectedCollateral, maxReceive].some((q) => q.isLoading)}
        />
      )}
      {expectedCollateral && (
        <ActionInfo
          label={t`Expected`}
          value={format(expectedCollateral.data?.totalCollateral, collateralSymbol)}
          error={expectedCollateral.error}
          loading={expectedCollateral.isLoading}
        />
      )}
      {maxReceive && (
        <ActionInfo
          label={t`Expected avg. price`}
          value={format(maxReceive.data?.avgPrice)}
          error={maxReceive.error}
          loading={maxReceive.isLoading}
        />
      )}
      <ActionInfo
        label={isHighImpact ? t`High price impact` : t`Price impact`}
        value={formatPercent(priceImpact.data)}
        {...(isHighImpact && { valueColor: 'error' })}
        error={priceImpact.error}
        loading={priceImpact.isLoading}
        testId="borrow-price-impact"
      />
      <SlippageToleranceActionInfoPure maxSlippage={slippage} onSave={onSlippageChange} />
    </Stack>
  )
}

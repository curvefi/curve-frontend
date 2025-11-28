import { Query } from '@/llamalend/widgets/manage-loan/loan.types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { Decimal, formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'
import { getHealthValueColor } from '../../features/market-position-details/utils'
import { LoanLeverageActionInfo, type LoanLeverageActionInfoProps } from './LoanLeverageActionInfo'

export type LoanInfoGasData = {
  estGasCostUsd?: number | Decimal | `${number}`
  tooltip?: string
}

export type LoanLeverageExpectedCollateral = {
  totalCollateral: Decimal
  leverage: Decimal
}

export type LoanLeverageMaxReceive = {
  avgPrice?: Decimal
  maxLeverage?: Decimal
}

type LoanInfoAccordionProps = {
  isOpen: boolean
  toggle: () => void
  range?: number
  health: Query<Decimal>
  prevHealth?: Query<Decimal>
  bands?: Query<[number, number]>
  prices?: Query<readonly Decimal[]>
  rates: Query<{ borrowApr?: Decimal } | null>
  prevRates?: Query<{ borrowApr?: Decimal } | null>
  loanToValue: Query<Decimal | null>
  prevLoanToValue?: Query<Decimal | null>
  gas: Query<LoanInfoGasData | null>
  debt?: Query<Decimal | null> & { tokenSymbol?: string }
  prevDebt?: Query<Decimal | null> & { tokenSymbol?: string }
  collateral?: Query<Decimal | null> & { tokenSymbol?: string }
  prevCollateral?: Query<Decimal | null> & { tokenSymbol?: string }
  leverage?: LoanLeverageActionInfoProps & { enabled: boolean }
}

/**
 * Builds props for ActionInfo component that handles prev/current value transitions.
 * - Displays "previous -> current" when both values are available
 * - Displays "current" when only current value is available
 * - Displays "previous" when only previous value is available
 * - Displays empty value when neither are available
 */
const buildPrevCurrentValues = <T,>(
  current: Query<T | null> | undefined,
  previous: Query<T | null> | undefined,
  format: (value: NonNullable<T>) => string,
  emptyValue = '-',
) => {
  const hasCurrent = current?.data != null
  const hasPrevious = previous?.data != null

  return {
    ...(hasCurrent && hasPrevious && { prevValue: format(previous!.data as NonNullable<T>) }),
    value: hasCurrent
      ? format(current!.data as NonNullable<T>)
      : hasPrevious
        ? format(previous!.data as NonNullable<T>)
        : emptyValue,
    error: current?.error ?? previous?.error,
    loading: current?.isLoading || previous?.isLoading,
  }
}

export const LoanInfoAccordion = ({
  isOpen,
  toggle,
  range,
  health,
  prevHealth,
  bands,
  prices,
  prevRates,
  rates,
  loanToValue,
  prevLoanToValue,
  gas,
  prevDebt,
  debt,
  prevCollateral,
  collateral,
  leverage,
}: LoanInfoAccordionProps) => (
  // error tooltip isn't displayed correctly because accordion takes the mouse focus. Use title for now.
  <Box title={(health.error ?? prevHealth?.error)?.message}>
    <Accordion
      ghost
      title={t`Health`}
      info={
        <ActionInfo
          label=""
          {...buildPrevCurrentValues(health, prevHealth, (v) => formatNumber(v, { abbreviate: false }), '∞')}
          valueColor={getHealthValueColor(Number(health.data ?? prevHealth?.data ?? 100), useTheme())}
          testId="borrow-health"
        />
      }
      expanded={isOpen}
      toggle={toggle}
    >
      <Stack>
        {leverage?.enabled && <LoanLeverageActionInfo {...leverage} />}
        {(debt || prevDebt) && (
          <ActionInfo
            label={t`Debt`}
            {...buildPrevCurrentValues(debt, prevDebt, (v) => formatNumber(v, { abbreviate: false }))}
            valueRight={debt?.tokenSymbol ?? prevDebt?.tokenSymbol}
            testId="borrow-debt"
          />
        )}
        {(collateral || prevCollateral) && (
          <ActionInfo
            label={t`Collateral`}
            {...buildPrevCurrentValues(collateral, prevCollateral, (v) => formatNumber(v, { abbreviate: false }))}
            valueRight={collateral?.tokenSymbol ?? prevCollateral?.tokenSymbol}
            testId="borrow-collateral"
          />
        )}

        {bands && (
          <ActionInfo
            label={t`Band range`}
            value={bands.data ? `${bands.data[0]} to ${bands.data[1]}` : '-'}
            error={bands.error}
            loading={bands.isLoading}
            testId="borrow-band-range"
          />
        )}
        {prices && (
          <ActionInfo
            label={t`Price range`}
            value={prices.data?.map((p) => formatNumber(p, { abbreviate: false })).join(' - ') ?? '-'}
            error={prices.error}
            loading={prices.isLoading}
            testId="borrow-price-range"
          />
        )}
        {range != null && (
          <ActionInfo label={t`N`} value={formatNumber(range, { decimals: 0, abbreviate: false })} testId="borrow-n" />
        )}
        <ActionInfo
          label={t`Borrow APR`}
          {...(prevRates?.data && { prevValue: formatPercent(prevRates.data.borrowApr) })}
          value={rates.data?.borrowApr ? formatPercent(rates.data.borrowApr) : '-'}
          error={rates.error ?? prevRates?.error}
          loading={rates.isLoading || prevRates?.isLoading}
          testId="borrow-apr"
        />
        {(loanToValue || prevLoanToValue) && (
          <ActionInfo
            label={t`Loan to value ratio`}
            {...buildPrevCurrentValues(loanToValue, prevLoanToValue, formatPercent)}
            testId="borrow-ltv"
          />
        )}
        <ActionInfo
          label={t`Estimated tx cost (step 1 of 2)`}
          value={gas.data?.estGasCostUsd == null ? '-' : formatUsd(gas.data.estGasCostUsd)}
          valueTooltip={gas.data?.tooltip}
          loading={gas.isLoading}
        />
      </Stack>
    </Accordion>
  </Box>
)

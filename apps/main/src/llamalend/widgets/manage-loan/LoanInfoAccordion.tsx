import { Query } from '@/llamalend/widgets/manage-loan/loan.types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { FireIcon } from '@ui-kit/shared/icons/FireIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Decimal, formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'
import { getHealthValueColor } from '../../features/market-position-details/utils'
import { LoanLeverageActionInfo, type LoanLeverageActionInfoProps } from './LoanLeverageActionInfo'

const { Spacing } = SizesAndSpaces

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

const formatQueryValue = <T,>(query: Query<T | null> | undefined, format: (value: NonNullable<T>) => string) =>
  query?.data != null ? format(query.data as NonNullable<T>) : undefined

const getQueryState = (current: Query<unknown> | undefined, previous: Query<unknown> | undefined) => ({
  error: current?.error ?? previous?.error,
  loading: current?.isLoading || previous?.isLoading,
})

const AccordionSpacing = () => <Box sx={{ height: Spacing.md }} />

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
          value={formatQueryValue(health, (v) => formatNumber(v, { abbreviate: false }))}
          prevValue={formatQueryValue(prevHealth, (v) => formatNumber(v, { abbreviate: false }))}
          emptyValue="∞"
          {...getQueryState(health, prevHealth)}
          valueColor={getHealthValueColor(Number(health.data ?? prevHealth?.data ?? 100), useTheme())}
          testId="borrow-health"
        />
      }
      expanded={isOpen}
      toggle={toggle}
    >
      <Stack>
        {(debt || prevDebt) && (
          <ActionInfo
            label={t`Debt`}
            value={formatQueryValue(debt, (v) => formatNumber(v, { abbreviate: false }))}
            prevValue={formatQueryValue(prevDebt, (v) => formatNumber(v, { abbreviate: false }))}
            {...getQueryState(debt, prevDebt)}
            valueRight={debt?.tokenSymbol ?? prevDebt?.tokenSymbol}
            testId="borrow-debt"
          />
        )}
        {(collateral || prevCollateral) && (
          <ActionInfo
            label={t`Collateral`}
            value={formatQueryValue(collateral, (v) => formatNumber(v, { abbreviate: false }))}
            prevValue={formatQueryValue(prevCollateral, (v) => formatNumber(v, { abbreviate: false }))}
            {...getQueryState(collateral, prevCollateral)}
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
          value={rates.data?.borrowApr != null ? formatPercent(rates.data.borrowApr) : undefined}
          prevValue={prevRates?.data?.borrowApr != null ? formatPercent(prevRates.data.borrowApr) : undefined}
          {...getQueryState(rates, prevRates)}
          testId="borrow-apr"
        />
        {(loanToValue || prevLoanToValue) && (
          <ActionInfo
            label={t`Loan to value ratio`}
            value={formatQueryValue(loanToValue, formatPercent)}
            prevValue={formatQueryValue(prevLoanToValue, formatPercent)}
            {...getQueryState(loanToValue, prevLoanToValue)}
            testId="borrow-ltv"
          />
        )}
        {leverage?.enabled && (
          <>
            <AccordionSpacing />
            <LoanLeverageActionInfo {...leverage} />
          </>
        )}
        {/* TODO: add router provider and slippage */}

        <AccordionSpacing />
        {/* TODO: add gas estimate steps (1. approve, 2. add collateral) */}
        <ActionInfo
          label={t`Estimated tx cost`}
          value={gas.data?.estGasCostUsd == null ? '-' : formatUsd(gas.data.estGasCostUsd)}
          valueTooltip={gas.data?.tooltip}
          loading={gas.isLoading}
          valueLeft={<FireIcon fontSize="small" />}
        />
      </Stack>
    </Accordion>
  </Box>
)

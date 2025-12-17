import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import type { Query } from '@ui-kit/types/util'
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
  bands: Query<[number, number]>
  prices: Query<readonly Decimal[]>
  rates: Query<{ borrowApr?: Decimal } | null>
  prevRates?: Query<{ borrowApr?: Decimal } | null>
  loanToValue: Query<Decimal | null>
  prevLoanToValue?: Query<Decimal | null>
  gas: Query<LoanInfoGasData | null>
  debt?: Query<Decimal | null> & { tokenSymbol: string }
  prevDebt?: Query<Decimal | null>
  leverage?: LoanLeverageActionInfoProps & { enabled: boolean }
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
  debt,
  prevDebt,
  leverage,
}: LoanInfoAccordionProps) => (
  // error tooltip isn't displayed correctly because accordion takes the mouse focus. Use title for now.
  <Box title={health.error?.message}>
    <Accordion
      ghost
      title={t`Health`}
      info={
        <ActionInfo
          label=""
          prevValue={prevHealth?.data == null ? undefined : formatNumber(prevHealth.data, { abbreviate: false })}
          value={health.data == null ? '∞' : formatNumber(health.data, { abbreviate: false })}
          valueColor={getHealthValueColor(Number(health.data ?? 100), useTheme())}
          error={health.error ?? prevHealth?.error}
          loading={health.isLoading || prevHealth?.isLoading}
          testId="borrow-health"
        />
      }
      expanded={isOpen}
      toggle={toggle}
    >
      <Stack>
        {leverage?.enabled && <LoanLeverageActionInfo {...leverage} />}
        {debt && (
          <ActionInfo
            label={t`Debt`}
            {...(prevDebt?.data && { prevValue: formatNumber(prevDebt.data, { abbreviate: false }) })}
            value={debt.data == null ? '-' : formatNumber(debt.data, { abbreviate: false })}
            valueRight={debt.tokenSymbol}
            error={debt?.error ?? prevDebt?.error}
            loading={debt?.isLoading || prevDebt?.isLoading}
            testId="borrow-debt"
          />
        )}
        <ActionInfo
          label={t`Band range`}
          value={bands.data ? `${bands.data[0]} to ${bands.data[1]}` : '-'}
          error={bands.error}
          loading={bands.isLoading}
          testId="borrow-band-range"
        />
        <ActionInfo
          label={t`Price range`}
          value={prices.data?.map((p) => formatNumber(p, { abbreviate: false })).join(' - ') ?? '-'}
          error={prices.error}
          loading={prices.isLoading}
          testId="borrow-price-range"
        />
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
        {loanToValue && (
          <ActionInfo
            label={t`Loan to value ratio`}
            {...(prevLoanToValue?.data && { prevValue: formatPercent(prevLoanToValue.data) })}
            value={loanToValue.data ? formatPercent(loanToValue.data) : '-'}
            testId="borrow-ltv"
            error={prevLoanToValue?.error ?? loanToValue.error}
            loading={loanToValue.isLoading || prevLoanToValue?.isLoading}
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

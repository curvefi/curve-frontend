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
  range: number
  health: Query<number>
  bands: Query<[number, number]>
  prices: Query<readonly Decimal[]>
  rates: Query<{ borrowApr?: Decimal } | null>
  futureRates: Query<{ borrowApr?: Decimal } | null>
  loanToValue: Query<Decimal | null>
  gas: Query<LoanInfoGasData | null>
  leverage: LoanLeverageActionInfoProps & { enabled: boolean }
}

export const LoanInfoAccordion = ({
  isOpen,
  toggle,
  range,
  health,
  bands,
  prices,
  rates,
  futureRates,
  loanToValue,
  gas,
  leverage,
}: LoanInfoAccordionProps) => {
  const theme = useTheme()
  return (
    // error tooltip isn't displayed correctly because accordion takes the mouse focus. Use title for now.
    <Box title={health.error?.message ?? undefined}>
      <Accordion
        ghost
        title={t`Health`}
        info={
          <ActionInfo
            label=""
            value={health.data == null ? '∞' : formatNumber(health.data, { abbreviate: false })}
            valueColor={getHealthValueColor(health.data ?? 100, theme)}
            error={health.error ?? undefined}
            loading={health.isLoading}
            testId="borrow-health"
          />
        }
        expanded={isOpen}
        toggle={toggle}
      >
        <Stack>
          {leverage.enabled && <LoanLeverageActionInfo {...leverage} />}
          <ActionInfo
            label={t`Band range`}
            value={bands.data ? `${bands.data[0]} to ${bands.data[1]}` : '-'}
            error={bands.error ?? undefined}
            loading={bands.isLoading}
            testId="borrow-band-range"
          />
          <ActionInfo
            label={t`Price range`}
            value={prices.data?.map((p) => formatNumber(p, { abbreviate: false })).join(' - ') ?? '-'}
            error={prices.error ?? undefined}
            loading={prices.isLoading}
            testId="borrow-price-range"
          />
          <ActionInfo label={t`N`} value={formatNumber(range, { decimals: 0, abbreviate: false })} testId="borrow-n" />
          <ActionInfo
            label={t`Borrow APR`}
            prevValue={formatPercent(rates.data?.borrowApr)}
            value={futureRates.data?.borrowApr ? formatPercent(futureRates.data.borrowApr) : '-'}
            error={(rates.error || futureRates.error) ?? undefined}
            loading={rates.isLoading || futureRates.isLoading}
            testId="borrow-apr"
          />
          <ActionInfo
            label={t`Loan to value ratio`}
            value={loanToValue.data ? formatPercent(loanToValue.data) : '-'}
            testId="borrow-ltv"
            error={loanToValue.error ?? undefined}
            loading={loanToValue.isLoading}
          />
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
}

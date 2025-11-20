import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { Decimal, formatPercent } from '@ui-kit/utils'
import { getHealthValueColor } from '../../features/market-position-details/utils'
import { LoanInfoLeverageActionInfo } from './LoanInfoLeverageActionInfo'

export type QueryData<T> = {
  data: T | undefined
  isLoading: boolean
  error: Error | null | undefined
}

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
  health: QueryData<number>
  bands: QueryData<[number, number]>
  prices: QueryData<readonly Decimal[]>
  rates: QueryData<{ borrowApr?: Decimal } | null>
  futureRates: QueryData<{ borrowApr?: Decimal } | null>
  loanToValue: QueryData<Decimal | null>
  gas: QueryData<LoanInfoGasData | null>
  leverage: {
    enabled: boolean
    expectedCollateral: QueryData<LoanLeverageExpectedCollateral | null>
    maxReceive: QueryData<LoanLeverageMaxReceive | null>
    priceImpact: QueryData<number | null>
    slippage: Decimal
    onSlippageChange: (newSlippage: Decimal) => void
    collateralSymbol?: string
  }
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
            value={health.data == null ? '∞' : formatNumber(health.data)}
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
          {leverage.enabled && (
            <LoanInfoLeverageActionInfo
              expectedCollateral={leverage.expectedCollateral}
              maxReceive={leverage.maxReceive}
              priceImpact={leverage.priceImpact}
              slippage={leverage.slippage}
              onSlippageChange={leverage.onSlippageChange}
              collateralSymbol={leverage.collateralSymbol}
            />
          )}
          <ActionInfo
            label={t`Band range`}
            value={bands.data ? `${bands.data[0]} to ${bands.data[1]}` : '?'}
            error={bands.error ?? undefined}
            loading={bands.isLoading}
            testId="borrow-band-range"
          />
          <ActionInfo
            label={t`Price range`}
            value={prices.data?.map((p) => formatNumber(p, { maximumSignificantDigits: 3 })).join(' - ') ?? '?'}
            error={prices.error ?? undefined}
            loading={prices.isLoading}
            testId="borrow-price-range"
          />
          <ActionInfo label={t`N`} value={formatNumber(range)} testId="borrow-n" />
          <ActionInfo
            label={t`Borrow APR`}
            prevValue={formatPercent(rates.data?.borrowApr)}
            value={futureRates.data?.borrowApr ? formatPercent(futureRates.data.borrowApr) : '...'}
            error={(rates.error || futureRates.error) ?? undefined}
            loading={rates.isLoading || futureRates.isLoading}
            testId="borrow-apr"
          />
          <ActionInfo
            label={t`Loan to value ratio`}
            value={loanToValue.data ? formatPercent(loanToValue.data) : '...'}
            testId="borrow-ltv"
            error={loanToValue.error ?? undefined}
            loading={loanToValue.isLoading}
          />
          <ActionInfo
            label={t`Estimated tx cost (step 1 of 2)`}
            value={formatNumber(gas.data?.estGasCostUsd, {
              currency: 'USD',
              defaultValue: '-',
            })}
            valueTooltip={gas.data?.tooltip}
            loading={gas.isLoading}
          />
        </Stack>
      </Accordion>
    </Box>
  )
}

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { ErrorReportModal } from '@ui-kit/features/report-error'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Query, type QueryProp } from '@ui-kit/types/util'
import { decimalGreaterThan, formatPercent, getErrorMessage } from '@ui-kit/utils'

/** Threshold above which price impact blocks the transaction (shown as red alert) */
export const HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD = '25' satisfies Decimal

/**
 * Returns the alert severity based on price impact vs. slippage tolerance and critical threshold:
 * - 'error' if price impact exceeds HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD (blocks the transaction)
 * - 'warning' if price impact exceeds the slippage tolerance
 * - null if no alert is needed
 */
export const getPriceImpactSeverity = (
  { data: priceImpact }: Query<Decimal | null | undefined>,
  { slippage }: { slippage: Decimal | null | undefined },
): 'error' | 'warning' | null => {
  if (priceImpact == null) return null
  if (decimalGreaterThan(priceImpact, HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD)) return 'error'
  if (slippage != null && decimalGreaterThan(priceImpact, slippage)) return 'warning'
  return null
}

export const isPriceImpactTooHigh = (...params: Parameters<typeof getPriceImpactSeverity>) =>
  getPriceImpactSeverity(...params) === 'error'

export type FormErrors<Field extends string> = readonly (readonly [Field, string])[]

export type FormAlertProps<Field extends string> = {
  error: Error | null
  formErrors: FormErrors<Field> // list of all form errors
  handledErrors: Field[] // list of fields that have their errors already handled/displayed elsewhere
}

const { Spacing } = SizesAndSpaces

export const FormAlerts = <Field extends string>({ error, formErrors, handledErrors }: FormAlertProps<Field>) => {
  const [isReportOpen, openReportModal, closeReportModal] = useSwitch(false)
  const unhandledErrors = formErrors.filter(([field]) => !handledErrors.includes(field))
  return (
    <>
      {unhandledErrors.length > 0 && (
        <Alert variant="outlined" severity="warning" data-testid="loan-form-errors">
          <AlertTitle>{t`Please correct the errors`}</AlertTitle>
          {unhandledErrors.map(([field, message]) => (
            <Box key={[field, message].join(': ')}>{message}</Box>
          ))}
        </Alert>
      )}
      {error && (
        <Alert
          variant="outlined"
          severity="error"
          sx={{ overflowWrap: 'anywhere' /* break anywhere as there is often JSON in the error breaking the design */ }}
          data-testid={'loan-alert-error'}
        >
          <AlertTitle>{t`An error occurred`}</AlertTitle>
          <Stack gap={Spacing.xs} width="100%">
            <span>{getErrorMessage(error)}</span>
            <Button color="ghost" size="extraSmall" sx={{ alignSelf: 'flex-end' }} onClick={openReportModal}>
              {t`Submit error report`}
            </Button>
          </Stack>
        </Alert>
      )}
      <ErrorReportModal
        context={{ error, title: 'LoanFormError', subtitle: getErrorMessage(error) }}
        isOpen={isReportOpen}
        onClose={closeReportModal}
      />
    </>
  )
}

export type HighPriceImpactAlertProps = QueryProp<Decimal | null> & { slippage?: Decimal }

/**
 * Inline alert displayed when price impact exceeds the threshold.
 * Shows above the submit button to make high price impact visible without opening the accordion.
 */
export const HighPriceImpactAlert = ({ data: priceImpact, isLoading, error, slippage }: HighPriceImpactAlertProps) => {
  const severity = getPriceImpactSeverity({ data: priceImpact, isLoading, error }, { slippage })
  return (
    !isLoading &&
    (error ? (
      <Alert severity="error" data-testid="high-price-impact-error">
        <AlertTitle>{t`Cannot determine price impact`}</AlertTitle>
        {error.message}
      </Alert>
    ) : (
      severity && (
        <Alert severity={severity} data-testid="high-price-impact-alert" variant="outlined">
          <AlertTitle sx={{ color: 'warning.main' }}>
            {t`High price impact:`} -{formatPercent(priceImpact)}
          </AlertTitle>
          {t`Consider reducing the amount or waiting for better market conditions.`}
        </Alert>
      )
    ))
  )
}

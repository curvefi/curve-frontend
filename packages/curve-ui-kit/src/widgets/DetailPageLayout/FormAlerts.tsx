import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { ErrorReportModal } from '@ui-kit/features/report-error'
import { usePreviousValue } from '@ui-kit/hooks/usePreviousValue'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type QueryProp } from '@ui-kit/types/util'
import { formatPercent, getErrorMessage } from '@ui-kit/utils'
import { getPriceImpactSeverity } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'

type FormErrors<Field extends string> = readonly (readonly [Field, string])[]

type FormAlertProps<Field extends string> = {
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

/**
 * Inline alert displayed when price impact exceeds the threshold.
 * Shows above the submit button to make high price impact visible without opening the accordion.
 */
export const HighPriceImpactAlert = ({
  priceImpact: { data, isLoading, error },
  values: { slippage, leverageEnabled },
}: {
  priceImpact: QueryProp<Decimal | null>
  values: { slippage: Decimal | undefined; leverageEnabled: boolean | undefined }
}) => {
  const severity = getPriceImpactSeverity({ data, isLoading, error }, { slippage })
  const isVisible = leverageEnabled && data && !!(error || severity)
  const wasVisible = usePreviousValue(isVisible)
  return error ? (
    <Alert severity="error" data-testid="high-price-impact-error">
      <AlertTitle>{t`Cannot determine price impact`}</AlertTitle>
      {error.message}
    </Alert>
  ) : (
    (severity || wasVisible) && (
      <WithSkeleton loading={!severity}>
        <Alert severity={severity ?? 'warning'} data-testid="high-price-impact-alert" variant="outlined">
          <AlertTitle sx={{ color: { warning: 'warning.main', error: 'error.main' }[severity!] }}>
            {t`High price impact:`} -{formatPercent(data)}
          </AlertTitle>
          {t`Consider reducing the amount or waiting for better market conditions.`}
        </Alert>
      </WithSkeleton>
    )
  )
}

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
import { formatNumber, getErrorMessage } from '@ui-kit/utils'
import { getPriceImpactSeverity } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import type { SlippageType } from '@ui-kit/widgets/SlippageSettings'

type FormErrors<Field extends string> = readonly (readonly [Field, string])[]

type FormAlertProps<Field extends string> = {
  /** Error that occurred during form submission. Only omit when there is no exception possible */
  error?: Error | null
  /** List of form errors */
  formErrors: FormErrors<Field>
  /** List of fields that have their errors already displayed elsewhere */
  handledErrors: readonly Field[]
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
          data-testid="loan-alert-error"
        >
          <AlertTitle>{t`An error occurred`}</AlertTitle>
          <Stack sx={{ gap: Spacing.xs, width: '100%' }}>
            <span>{getErrorMessage(error)}</span>
            <Button color="ghost" size="extraSmall" sx={{ alignSelf: 'flex-end' }} onClick={openReportModal}>
              {t`Submit error report`}
            </Button>
          </Stack>
        </Alert>
      )}
      <ErrorReportModal
        context={{ error, title: 'LoanFormError', subtitle: error && getErrorMessage(error) }}
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
  priceImpact: { data, isLoading: isImpactLoading, error },
  max: { isLoading: isMaxLoading },
  values: { slippage },
  slippageType,
}: {
  priceImpact: QueryProp<Decimal | null>
  max: QueryProp<unknown> // dependent query that is necessary before the price impact query is even enabled
  values: { slippage: Decimal | undefined }
  slippageType: SlippageType
}) => {
  const isLoading = isImpactLoading || isMaxLoading // impact will only start loading after the max is available
  const severity = getPriceImpactSeverity({ data }, { slippage, slippageType })
  const prevSeverity = usePreviousValue(severity)
  return error ? (
    <Alert severity="error" data-testid="high-price-impact-error">
      <AlertTitle>{t`Cannot determine price impact`}</AlertTitle>
      {error.message}
    </Alert>
  ) : (
    (severity || (prevSeverity && isLoading)) && (
      <WithSkeleton loading={isLoading}>
        <Alert severity={severity ?? 'warning'} data-testid="high-price-impact-alert" variant="outlined">
          <AlertTitle sx={{ color: { warning: 'warning.main', error: 'error.main' }[severity!] }}>
            {t`High price impact:`} -{formatNumber(data, 'percent.rate')}
          </AlertTitle>
          {t`Consider reducing the amount or waiting for better market conditions.`}
        </Alert>
      </WithSkeleton>
    )
  )
}

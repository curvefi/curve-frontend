import { useState } from 'react'
import { ErrorReportModal } from '@evm-ui/features/report-error'
import { usePreviousValue } from '@evm-ui/hooks/usePreviousValue'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { CopyIconButton } from '@evm-ui/shared/ui/CopyIconButton'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { type QueryProp } from '@evm-ui/types/util'
import { formatNumber, getErrorMessage } from '@evm-ui/utils'
import {
  getPriceImpactSeverity,
  getPriceImpactPercent,
  type PriceImpact,
} from '@evm-ui/widgets/DetailPageLayout/price-impact.util'
import CloseIcon from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'

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
  const [dismissedError, setDismissedError] = useState<Error | null>(null)
  const unhandledErrors = formErrors.filter(([field]) => !handledErrors.includes(field))
  const visibleError = error !== dismissedError && error
  const errorMessage = maybe(visibleError, getErrorMessage)
  return (
    <>
      {unhandledErrors.length > 0 && (
        <Alert variant="outlined" severity="warning" data-testid="loan-form-errors">
          <AlertTitle>{t`Please correct the errors`}</AlertTitle>
          {unhandledErrors.map(([field, message]) => (
            <Box key={[field, message].join(': ')} data-testid={`loan-form-error-${field}`}>
              {message}
            </Box>
          ))}
        </Alert>
      )}
      {visibleError && (
        <Alert
          variant="outlined"
          severity="error"
          sx={{ overflowWrap: 'anywhere' /* break anywhere as there is often JSON in the error breaking the design */ }}
          data-testid="loan-alert-error"
          action={
            <IconButton
              color="ghost"
              size="extraSmall"
              title={t`Dismiss error`}
              data-testid="dismiss-loan-alert-error"
              onClick={() => setDismissedError(visibleError)}
            >
              <CloseIcon />
            </IconButton>
          }
        >
          <AlertTitle>{t`An error occurred`}</AlertTitle>
          <Stack sx={{ gap: Spacing.xs, width: '100%' }}>
            <Box
              component="span"
              data-testid="loan-alert-error-message"
              sx={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 5, overflow: 'hidden' }}
            >
              {errorMessage}
            </Box>
            <Stack direction="row" sx={{ alignSelf: 'flex-end', alignItems: 'center', gap: Spacing.xxs }}>
              <CopyIconButton
                copyText={errorMessage}
                label={t`Copy error message`}
                confirmationText={t`Error message copied to clipboard`}
                confirmationMessage="" // confirmation title is enough
                color="ghost"
                data-testid="copy-loan-alert-error"
              />
              <Button color="ghost" size="extraSmall" onClick={openReportModal}>
                {t`Submit error report`}
              </Button>
            </Stack>
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
}: {
  priceImpact: QueryProp<PriceImpact | Decimal | null>
  max: QueryProp<unknown> // dependent query that is necessary before the price impact query is even enabled
}) => {
  const isLoading = isImpactLoading || isMaxLoading // impact will only start loading after the max is available
  const severity = getPriceImpactSeverity(data)
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
            {t`High price impact:`} -{formatNumber(getPriceImpactPercent(data), 'percent.rate')}
          </AlertTitle>
          {t`Consider reducing the amount or waiting for better market conditions.`}
        </Alert>
      </WithSkeleton>
    )
  )
}

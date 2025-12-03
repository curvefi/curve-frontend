import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { Hex } from '@curvefi/prices-api'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { type BaseConfig, scanTxPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export type FormErrors<Field extends string> = readonly (readonly [Field, string])[]

type ErrorDisplay = {
  title: string
  message?: string
}

export type LoanFormAlertProps<Field extends string> = {
  network: BaseConfig<INetworkName>
  isSuccess: boolean
  error: Error | null
  txHash?: Hex
  formErrors: FormErrors<Field> // list of all form errors
  handledErrors: Field[] // list of fields that have their errors already handled/displayed elsewhere
  successTitle: string
}

const resolveErrorDisplay = (err: any): ErrorDisplay => {
  const code = err?.code as string | undefined
  if (code === 'ACTION_REJECTED') return { title: t`User rejected action` }
  return { title: t`An error occurred`, message: err.message }
}

export const LoanFormAlerts = <Field extends string>({
  network,
  isSuccess,
  error,
  txHash,
  formErrors,
  handledErrors,
  successTitle,
}: LoanFormAlertProps<Field>) => {
  const resolvedError = error ? resolveErrorDisplay(error) : null

  return (
    <>
      {isSuccess && (
        <Alert severity="success" data-testid={'loan-form-success-alert'}>
          <AlertTitle>{successTitle}</AlertTitle>
          {txHash && (
            <Link rel="noreferrer" target="_blank" href={scanTxPath(network, txHash)}>
              {t`View on Explorer`}
            </Link>
          )}
        </Alert>
      )}
      {formErrors.some(([field]) => !handledErrors.includes(field)) && (
        <Alert severity="warning" data-testid={'loan-form-errors'}>
          <AlertTitle>{t`Please correct the errors`}</AlertTitle>
          {formErrors
            .filter(([field]) => !handledErrors.includes(field))
            .map(([field, message]) => (
              <Box key={[field, message].join(': ')}>{message}</Box>
            ))}
        </Alert>
      )}
      {resolvedError && (
        <Alert
          severity="error"
          sx={{ overflowWrap: 'anywhere' /* break anywhere as there is often JSON in the error breaking the design */ }}
          data-testid={'loan-form-error'}
        >
          <AlertTitle>{resolvedError.title}</AlertTitle>
          {resolvedError.message}
        </Alert>
      )}
    </>
  )
}

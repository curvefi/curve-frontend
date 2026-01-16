import { getErrorMessage } from '@/llamalend/helpers'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { Hex } from '@curvefi/prices-api'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { type BaseConfig, scanTxPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { formatPercent } from '@ui-kit/utils'

/** Threshold above which price impact is considered high and warrants a warning */
export const HIGH_PRICE_IMPACT_THRESHOLD = 5

export type FormErrors<Field extends string> = readonly (readonly [Field, string])[]

export type LoanFormAlertProps<Field extends string> = {
  network: BaseConfig<INetworkName>
  isSuccess: boolean
  error: Error | null
  txHash?: Hex
  formErrors: FormErrors<Field> // list of all form errors
  handledErrors: Field[] // list of fields that have their errors already handled/displayed elsewhere
  successTitle: string
}

export const LoanFormAlerts = <Field extends string>({
  network,
  isSuccess,
  error,
  txHash,
  formErrors,
  handledErrors,
  successTitle,
}: LoanFormAlertProps<Field>) => (
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
    {error && (
      <Alert
        severity="error"
        sx={{ overflowWrap: 'anywhere' /* break anywhere as there is often JSON in the error breaking the design */ }}
        data-testid={'loan-form-error'}
      >
        <AlertTitle>{t`An error occurred`}</AlertTitle>
        {getErrorMessage(error)}
      </Alert>
    )}
  </>
)

export type HighPriceImpactAlertProps = {
  priceImpact: number | null | undefined
  isLoading?: boolean
}

/**
 * Inline alert displayed when price impact exceeds the threshold.
 * Shows above the submit button to make high price impact visible without opening the accordion.
 */
export const HighPriceImpactAlert = ({ priceImpact, isLoading }: HighPriceImpactAlertProps) =>
  !isLoading &&
  priceImpact != null &&
  priceImpact > HIGH_PRICE_IMPACT_THRESHOLD && (
    <Alert severity="warning" data-testid="high-price-impact-alert">
      <AlertTitle sx={{ color: 'warning.main' }}>
        {t`High price impact:`} -{formatPercent(priceImpact)}
      </AlertTitle>
      {t`Consider reducing the amount or waiting for better market conditions.`}
    </Alert>
  )

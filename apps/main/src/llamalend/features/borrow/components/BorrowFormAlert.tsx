import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { scanTxPath, type BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { Decimal } from '@ui-kit/utils'
import type { BorrowFormErrors } from '../types'

/** List of fields that show their own error messages, those will be omitted from the general error alert */
const handledErrors: BorrowFormErrors[Decimal][0][] = ['userCollateral', 'debt', 'maxDebt', 'userCollateral']

/**
 * Alert component to display the status of the borrow form submission.
 * It shows success, warning, and error messages based on the form state.
 * - Success Alert: Displayed when the loan is successfully created, with a link to view the transaction on the explorer.
 * - Warning Alert: Displayed when there are form validation errors, listing the errors that need to be corrected.
 * - Error Alert: Displayed when there is an error during the loan creation process, showing the error message.
 *
 * @param isCreated Indicates if the loan was successfully created
 * @param creationError Error object if there was an error during creation
 * @param txHash Transaction hash of the created loan, if available
 * @param network Network configuration for generating the explorer link
 * @param formErrors Array of form errors with field names and error messages
 */
export const BorrowFormAlert = ({
  isCreated,
  creationError,
  txHash,
  network,
  formErrors,
}: {
  network: BaseConfig<INetworkName>
  isCreated: boolean
  creationError: Error | null
  txHash: undefined | string
  formErrors: BorrowFormErrors
}) => (
  <>
    {isCreated && (
      <Alert severity="success" data-testid="borrow-success-alert">
        <AlertTitle>{t`Loan created`}</AlertTitle>
        {txHash && (
          <Link rel="noreferrer" target="_blank" href={scanTxPath(network, txHash)}>
            {t`View on Explorer`}
          </Link>
        )}
      </Alert>
    )}
    {formErrors.some(([field]) => !handledErrors.includes(field)) && (
      <Alert severity="warning" data-testid="borrow-form-errors">
        <AlertTitle>{t`Please correct the errors`}</AlertTitle>
        {formErrors
          .filter(([field]) => !handledErrors.includes(field))
          .map(([field, error]) => (
            <Box key={[field, error].join(': ')}>{error}</Box>
          ))}
      </Alert>
    )}
    {creationError && (
      <Alert
        severity="error"
        sx={{ overflowWrap: 'anywhere' /* break anywhere as there is often JSON in the error breaking the design */ }}
        data-testid="borrow-creation-error"
      >
        <AlertTitle>{t`An error occurred`}</AlertTitle>
        {creationError.message}
      </Alert>
    )}
  </>
)

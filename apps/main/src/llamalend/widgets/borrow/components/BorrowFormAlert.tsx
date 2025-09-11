import type { NetworkEnum } from '@/llamalend/llamalend.types'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import type { BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const BorrowFormAlert = ({
  isCreated,
  creationError,
  txHash,
  network,
  formErrors,
}: {
  network: BaseConfig<NetworkEnum>
  isCreated: boolean
  creationError: Error | null
  txHash: undefined | string
  formErrors: string[]
}) => (
  <>
    {isCreated && (
      <Alert severity="success" data-testid="borrow-success-alert">
        <AlertTitle>{t`Loan created`}</AlertTitle>
        {txHash && (
          <Link rel="noreferrer" target="_blank" href={network.scanTxPath(txHash)}>
            {t`View on Explorer`}
          </Link>
        )}
      </Alert>
    )}
    {formErrors.length > 0 && (
      <Alert severity="warning" data-testid="borrow-form-errors">
        <AlertTitle>{t`Please correct the errors`}</AlertTitle>
        {formErrors.map((error) => (
          <Box key={error}>{error}</Box>
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

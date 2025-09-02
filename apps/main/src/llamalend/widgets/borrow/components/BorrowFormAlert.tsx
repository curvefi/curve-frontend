import type { NetworkEnum } from '@/llamalend/llamalend.types'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Link from '@mui/material/Link'
import type { BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const BorrowFormAlert = ({
  isCreated,
  creationError,
  txHash,
  network,
}: {
  network: BaseConfig<NetworkEnum>
  isCreated: false | true
  creationError: Error | null
  txHash: undefined | string
}) => (
  <>
    {isCreated && (
      <Alert severity="success">
        <AlertTitle>{t`Loan created`}</AlertTitle>
        {txHash && (
          <Link rel="noreferrer" target="_blank" href={network.scanTxPath(txHash)}>
            {t`View on Explorer`}
          </Link>
        )}
      </Alert>
    )}
    {creationError && (
      <Alert severity="error">
        <AlertTitle>t`An error occurred`</AlertTitle>
        {creationError.message}
      </Alert>
    )}
  </>
)

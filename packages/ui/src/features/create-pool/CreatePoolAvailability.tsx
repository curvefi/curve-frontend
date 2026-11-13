import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { getErrorMessage } from '@ui/features/errors/errors.util'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export const CreatePoolAvailability = ({
  availability: { data, error },
  networkName,
}: {
  availability: QueryProp<number[]>
  networkName: string
}) =>
  error ? (
    <Alert severity="error">{getErrorMessage(error)}</Alert>
  ) : (
    data?.length === 0 && (
      <Alert severity="warning">
        <AlertTitle>{t`Pool creation is currently unavailable on ${networkName}.`}</AlertTitle>
      </Alert>
    )
  )

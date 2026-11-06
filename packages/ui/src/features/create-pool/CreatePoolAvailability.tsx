import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { joinButtonText } from '@primitives/string.utils'
import { getErrorMessage } from '@ui/features/errors/errors.util'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export const CreatePoolAvailability = ({
  availability: { data, error },
  networkName,
  tokenCount,
}: {
  availability: QueryProp<number[]>
  networkName: string
  tokenCount: number
}) =>
  error ? (
    <Alert severity="error">{getErrorMessage(error)}</Alert>
  ) : (
    data &&
    !data.includes(tokenCount) && (
      <Alert severity="warning">
        <AlertTitle>
          {data.length
            ? t`Pool creation with ${tokenCount} tokens is currently unavailable on ${networkName}. It's available for ${joinButtonText(...data)} tokens.`
            : t`Pool creation is currently unavailable on ${networkName}.`}
        </AlertTitle>
      </Alert>
    )
  )

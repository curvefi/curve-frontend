import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { joinButtonText } from '@primitives/string.utils'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export const CreatePoolTokenAvailability = ({
  availability: { data, error },
  networkName,
  tokenCount,
}: {
  availability: QueryProp<number[]>
  networkName: string
  tokenCount: number
}) =>
  // error or empty data are displayed in CreatePoolAvailability, outside the card
  !error &&
  !!data?.length &&
  !data.includes(tokenCount) && (
    <Alert severity="warning">
      <AlertTitle>{t`Pool creation with ${tokenCount} tokens is currently unavailable on ${networkName}. It's available for ${joinButtonText(...data)} tokens.`}</AlertTitle>
    </Alert>
  )

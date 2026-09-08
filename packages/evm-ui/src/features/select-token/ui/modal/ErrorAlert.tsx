import { copyToClipboard } from '@evm-ui/utils'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

type Props = {
  error: string
}

export const ErrorAlert = ({ error }: Props) => (
  <Alert
    variant="filled"
    severity="error"
    action={
      <Button color="ghost" size="extraSmall" onClick={() => void copyToClipboard(error)}>
        Copy
      </Button>
    }
    sx={{
      position: 'relative',
      '& .MuiAlert-action': {
        position: 'absolute',
        right: Spacing.xs,
        padding: 0,
        margin: 0,
      },
    }}
  >
    <AlertTitle>{t`Could not create token list`}</AlertTitle>
    <Box sx={{ wordWrap: 'break-word' }}>{t`${error}`}</Box>
  </Alert>
)

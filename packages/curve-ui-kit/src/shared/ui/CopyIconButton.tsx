import { useSwitch } from '@ui-kit/hooks/useSwitch'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { CopyIcon } from '@ui-kit/shared/icons/CopyIcon'
import Snackbar from '@mui/material/Snackbar'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

export function CopyIconButton({
  copyText,
  label,
  confirmationText,
}: {
  copyText: string
  label: string
  confirmationText: string
}) {
  const [isCopied, showAlert, hideAlert] = useSwitch(false)
  return (
    <>
      <Tooltip title={label} placement="top">
        <IconButton
          size="extraSmall"
          onClick={async () => {
            await navigator.clipboard.writeText(copyText)
            showAlert()
          }}
        >
          <CopyIcon color="primary" />
        </IconButton>
      </Tooltip>

      <Snackbar open={isCopied} onClose={hideAlert} autoHideDuration={Duration.Snackbar}>
        <Alert variant="filled" severity="success">
          <AlertTitle>{confirmationText}</AlertTitle>
          {copyText}
        </Alert>
      </Snackbar>
    </>
  )
}

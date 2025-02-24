import { useSwitch } from '@ui-kit/hooks/useSwitch'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { CopyIcon } from '@ui-kit/shared/icons/CopyIcon'
import Snackbar from '@mui/material/Snackbar'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'

export function CopyIconButton({
  copyText,
  label,
  confirmationText,
  className,
}: {
  copyText: string
  label: string
  confirmationText: string
  className?: string
}) {
  const [isCopied, showAlert, hideAlert] = useSwitch(false)
  return (
    // Extra theme inverter so the tooltip doesn't change colors when inside an inverted block
    <InvertTheme inverted={false}>
      <Tooltip title={label} placement="top">
        <IconButton
          className={className}
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
    </InvertTheme>
  )
}

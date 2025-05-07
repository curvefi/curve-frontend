import { useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { IconButtonProps } from '@mui/material/IconButton'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import { CopyIcon } from '@ui-kit/shared/icons/CopyIcon'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { Duration } from '@ui-kit/themes/design/0_primitives'

export function CopyIconButton({
  copyText,
  label,
  confirmationText,
  ...iconProps
}: {
  copyText: string
  label: string
  confirmationText: string
} & IconButtonProps) {
  const [alertText, setAlertText] = useState<string>()
  return (
    // Extra theme inverter so the tooltip doesn't change colors when inside an inverted block
    <InvertTheme inverted={false}>
      <Tooltip title={label} placement="top">
        <IconButton
          size="extraSmall"
          {...iconProps}
          onClick={() => {
            console.info(`Copying to clipboard: ${copyText}`)
            return navigator.clipboard
              ? navigator.clipboard
                  .writeText(copyText)
                  .then(() => setAlertText(confirmationText))
                  .catch((e) => setAlertText(e.message))
              : setAlertText('Clipboard not available due to unsecure origin')
          }}
        >
          <CopyIcon color="primary" />
        </IconButton>
      </Tooltip>

      <Snackbar open={!!alertText} onClose={() => setAlertText(undefined)} autoHideDuration={Duration.Snackbar}>
        <Alert variant="filled" severity="success" data-testid="copy-confirmation">
          <AlertTitle>{confirmationText}</AlertTitle>
          {copyText}
        </Alert>
      </Snackbar>
    </InvertTheme>
  )
}

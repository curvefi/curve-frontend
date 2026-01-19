import { useState } from 'react'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { CopyIcon } from '@ui-kit/shared/icons/CopyIcon'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'
import { Toast } from '@ui-kit/shared/ui/Toast'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

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
          <CopyIcon />
        </IconButton>
      </Tooltip>

      <Toast
        open={!!alertText}
        onClose={() => setAlertText(undefined)}
        title={confirmationText}
        data-testid="copy-confirmation"
      >
        <Typography>{copyText}</Typography>
      </Toast>
    </InvertTheme>
  )
}

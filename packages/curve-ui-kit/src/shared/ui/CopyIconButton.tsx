import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import { t } from '@ui-kit/lib/i18n'
import { CopyIcon } from '@ui-kit/shared/icons/CopyIcon'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

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
                  .then(() =>
                    showToast({
                      message: copyText,
                      severity: 'info',
                      title: confirmationText,
                      testId: 'copy-confirmation',
                    }),
                  )
                  .catch((e) => showToast({ title: e.message, severity: 'error' }))
              : showToast({ title: t`Clipboard not available due to unsecure origin`, severity: 'warning' })
          }}
        >
          <CopyIcon />
        </IconButton>
      </Tooltip>
    </InvertTheme>
  )
}

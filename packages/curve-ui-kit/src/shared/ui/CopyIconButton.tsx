import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import { t } from '@ui-kit/lib/i18n'
import { CopyIcon } from '@ui-kit/shared/icons/CopyIcon'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

const testId = 'copy-confirmation' as const

type CopyIconBUttonProps = { copyText: string; label: string; confirmationText: string } & IconButtonProps

export const CopyIconButton = ({ copyText, label, confirmationText, ...iconProps }: CopyIconBUttonProps) => (
  // Extra theme inverter so the tooltip doesn't change colors when inside an inverted block
  <InvertTheme inverted={false}>
    <Tooltip title={label} placement="top">
      <IconButton
        size="extraSmall"
        {...iconProps}
        onClick={() => {
          console.info(`Copying to clipboard: ${copyText}`)
          return (
            navigator.clipboard?.writeText(copyText).then(
              () => showToast({ message: copyText, severity: 'info', title: confirmationText, testId }),
              (e) => showToast({ title: e.message, severity: 'error', testId }),
            ) ?? showToast({ title: t`Clipboard not available`, severity: 'warning', testId })
          )
        }}
      >
        <CopyIcon />
      </IconButton>
    </Tooltip>
  </InvertTheme>
)

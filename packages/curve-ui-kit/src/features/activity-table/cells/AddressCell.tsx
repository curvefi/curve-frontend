import { useCallback } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ClickableInRowClass } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { copyToClipboard, shortenString } from '@ui-kit/utils'
import { ActivityTableCell } from './ActivityTableCell'

const { Spacing } = SizesAndSpaces

type AddressCellProps = {
  /** The address to display */
  address: string
  /** Number of characters to show on each side (default: 4) */
  digits?: number
  /** Optional label to display above the address */
  label?: string
  /** Horizontal alignment of the content */
  align?: 'left' | 'right'
}

/**
 * Cell component for displaying blockchain addresses with truncation and copy functionality.
 */
export const AddressCell = ({ address, digits = 4, label, align = 'right' }: AddressCellProps) => {
  const [isSnackbarOpen, openSnackbar, closeSnackbar] = useSwitch(false)

  const handleCopy = useCallback(() => {
    void copyToClipboard(address)
    openSnackbar()
  }, [address, openSnackbar])

  return (
    <ActivityTableCell>
      {label && (
        <Typography variant="bodyXsRegular" sx={(t) => ({ color: t.design.Text.TextColors.Secondary })}>
          {label}
        </Typography>
      )}
      <Stack direction="row" alignItems="center" justifyContent={align === 'right' ? 'flex-end' : 'flex-start'} gap={Spacing.xs}>
        <Typography variant="tableCellMBold">{shortenString(address, { digits })}</Typography>
        <IconButton size="extraSmall" title={address} onClick={handleCopy} className={ClickableInRowClass}>
          <ContentCopyIcon />
        </IconButton>
      </Stack>
      <Snackbar open={isSnackbarOpen} onClose={closeSnackbar} autoHideDuration={Duration.Snackbar}>
        <Alert variant="filled" severity="success">
          <AlertTitle>{t`Address copied to clipboard`}</AlertTitle>
          {address}
        </Alert>
      </Snackbar>
    </ActivityTableCell>
  )
}

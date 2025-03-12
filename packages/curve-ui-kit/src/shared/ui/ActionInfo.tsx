import CallMade from '@mui/icons-material/CallMade'
import ContentCopy from '@mui/icons-material/ContentCopy'
import { Stack } from '@mui/material'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { copyToClipboard } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type ComponentSize = 'small' | 'medium' | 'large'

type ActionInfoProps = {
  /** Label displayed on the left side */
  label: string
  /** Primary value to display and copy */
  value: string
  /** URL to navigate to when clicking the external link button */
  linkAddress: string
  /** Message displayed in the snackbar when the address is copied */
  copiedText: string
  /** Size of the component */
  size?: ComponentSize
}

const labelSize: Record<ComponentSize, 'bodyXsRegular' | 'bodyMRegular'> = {
  small: 'bodyXsRegular',
  medium: 'bodyMRegular',
  large: 'bodyMRegular',
}

const addressSize: Record<ComponentSize, 'bodyXsBold' | 'highlightM' | 'headingSBold'> = {
  small: 'bodyXsBold',
  medium: 'highlightM',
  large: 'headingSBold',
}

const ActionInfo = ({ label, value, linkAddress, size = 'medium', copiedText }: ActionInfoProps) => {
  const [isOpen, open, close] = useSwitch(false)

  const copyValue = () => {
    copyToClipboard(value)
    open()
  }

  return (
    <Stack direction="row" alignItems="center" gap={Spacing.md} justifyContent="space-between">
      <Typography variant={labelSize[size]} color="textSecondary">
        {label}
      </Typography>

      <Stack direction="row" alignItems="center">
        <Typography variant={addressSize[size]} color="textPrimary" sx={{ marginRight: Spacing.sm }}>
          {value}
        </Typography>

        <IconButton size="small" onClick={copyValue} color="primary">
          <ContentCopy />
        </IconButton>

        <IconButton component={Link} href={linkAddress} target="_blank" rel="noopener" size="small" color="primary">
          <CallMade />
        </IconButton>
      </Stack>

      <Snackbar open={isOpen} onClose={close} autoHideDuration={Duration.Snackbar}>
        <Alert variant="filled" severity="success">
          <AlertTitle>{copiedText}</AlertTitle>
          {value}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default ActionInfo

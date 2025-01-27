import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Stack } from '@mui/material'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import Icon from 'ui/src/Icon'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { Duration } from '../../themes/design/0_primitives'
import { shortenTokenAddress } from 'ui/src/utils/'
import { t } from 'i18next'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ComponentSize = 'S' | 'M' | 'L'

type ActionInfoProps = {
  label: string
  address: string
  linkAddress: string
  size?: ComponentSize
}

const labelSize: Record<ComponentSize, 'bodyXsRegular' | 'bodyMRegular'> = {
  S: 'bodyXsRegular',
  M: 'bodyMRegular',
  L: 'bodyMRegular',
}

const addressSize: Record<ComponentSize, 'bodyXsBold' | 'highlightM' | 'headingSBold'> = {
  S: 'bodyXsBold',
  M: 'highlightM',
  L: 'headingSBold',
}

const ActionInfo = ({ label, address, linkAddress, size = 'S' }: ActionInfoProps) => {
  const {
    design: { Button },
  } = useTheme()
  const [openCopyAlert, setOpenCopyAlert] = useState(false)

  const copyValue = () => {
    navigator.clipboard.writeText(address)
    setOpenCopyAlert(true)
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant={labelSize[size]} color="textTertiary">
        {label}
      </Typography>
      <Stack direction="row" alignItems="center">
        <Typography variant={addressSize[size]} color="textPrimary" sx={{ marginRight: Spacing.sm }}>
          {shortenTokenAddress(address)}
        </Typography>
        <IconButton size="small" onClick={copyValue} sx={{ svg: { color: Button.Primary.Default.Fill } }}>
          <Icon name="Copy" size={24} />
        </IconButton>
        <IconButton
          component={Link}
          href={linkAddress}
          target="_blank"
          rel="noopener"
          size="small"
          sx={{ svg: { color: Button.Primary.Default.Fill } }}
        >
          <Icon name="ArrowUpRight" size={24} />
        </IconButton>
      </Stack>

      <Snackbar open={openCopyAlert} onClose={() => setOpenCopyAlert(false)} autoHideDuration={Duration.Snackbar}>
        <Alert variant="filled" severity="success">
          <AlertTitle>{t`Copied to clipboard!`}</AlertTitle>
          {address}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default ActionInfo

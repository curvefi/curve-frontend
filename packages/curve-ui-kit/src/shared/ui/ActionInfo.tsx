import { useState } from 'react'
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

type ComponentSize = 'S' | 'M' | 'L'

type ActionInfoProps = {
  label: string
  address: string
  linkAddress: string
  copyText: string
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

const ActionInfo = ({ label, address, linkAddress, copyText, size = 'S' }: ActionInfoProps) => {
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
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant={addressSize[size]} color="textPrimary">
          {shortenTokenAddress(address)}
        </Typography>
        <IconButton onClick={copyValue}>
          <Icon name="Copy" size={20} />
        </IconButton>
        <Link href={linkAddress} target="_blank" rel="noopener">
          <Icon name="ArrowUpRight" size={20} />
        </Link>
      </Stack>

      <Snackbar open={openCopyAlert} onClose={() => setOpenCopyAlert(false)} autoHideDuration={Duration.Snackbar}>
        <Alert variant="filled" severity="success">
          <AlertTitle>{copyText}</AlertTitle>
          {address}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default ActionInfo

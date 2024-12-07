import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import PersonIcon from '@mui/icons-material/Person'
import { ConnectWalletIndicatorProps } from 'curve-common/src/features/connect-wallet'

import { UserProfile } from './UserProfile'

type Props = ConnectWalletIndicatorProps

export const UserProfileButton = ({ walletAddress }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    walletAddress && (
      <>
        <IconButton size="small" onClick={() => setOpen(true)}>
          <PersonIcon />
        </IconButton>

        <UserProfile open={open} onClose={() => setOpen(false)} walletAddress={walletAddress} />
      </>
    )
  )
}

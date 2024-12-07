import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import PersonIcon from '@mui/icons-material/Person'

import { UserProfile } from './UserProfile'

export const UserProfileButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <IconButton size="small" onClick={() => setOpen(true)}>
        <PersonIcon />
      </IconButton>

      <UserProfile open={open} onClose={() => setOpen(false)} />
    </>
  )
}

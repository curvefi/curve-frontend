import { AppName } from 'ui/src/AppNav/types'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { HeaderLogo } from './HeaderLogo'
import React from 'react'

export const HeaderLogoWithMenu = (props: { onClick: () => void, appName: AppName }) => (
  <>
    <IconButton onClick={props.onClick} sx={{ display: 'inline-flex' }}>
      <MenuIcon fontSize="small" />
    </IconButton>
    <HeaderLogo appName={props.appName} />
  </>
)
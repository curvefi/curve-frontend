import IconButton from '@mui/material/IconButton'
import React from 'react'
import { styled } from '@mui/material/styles'
import { SxProps, Theme } from '@mui/system'

const Svg = styled('svg')({
  fill: 'currentColor',
  width: '0.8em',
  height: '0.8em',
})

const Path = styled('path')``

type MenuToggleButtonProps = {
  isOpen: boolean
  toggle: () => void
  sx?: SxProps<Theme>
}

export const MenuToggleButton = ({ toggle, isOpen, sx }: MenuToggleButtonProps) => (
  <IconButton onClick={toggle} sx={{ display: 'inline-flex', ...sx }}>
    <Svg
      // className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall css-36mik4-MuiSvgIcon-root"
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <Path d="M0 7h24v-2H0z" sx={{ transition: 'transform 1.5s', ...isOpen && { transform: 'skewY(-45deg) translate(0, 17px)' } }} />
      <Path d="M0 13h24v-2H0z" sx={{ transition: 'opacity 1s', ...isOpen && { opacity: 0 } }} />
      <Path d="M0 19h24v-2H0z" sx={{ transition: 'transform 1.5s', ...isOpen && { transform: 'skewY(45deg) translate(0, -17px)' } }} />
    </Svg>
  </IconButton>
  )

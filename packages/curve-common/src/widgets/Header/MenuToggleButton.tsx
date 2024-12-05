import IconButton from '@mui/material/IconButton'
import React from 'react'
import { styled } from '@mui/material/styles'

const Svg = styled('svg')({
  fill: 'currentColor',
  width: '24px',
  height: '24px',
})

const Path = styled('path')``

type MenuToggleButtonProps = {
  isOpen: boolean
  toggle: () => void
}

export const MenuToggleButton = ({ toggle, isOpen }: MenuToggleButtonProps) => (
  <IconButton onClick={toggle} sx={{ display: 'inline-flex' }} data-testid="menu-toggle" size="small">
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

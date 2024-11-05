import IconButton from '@mui/material/IconButton'
import React from 'react'
import { styled } from '@mui/material/styles'

const Svg = styled('svg')({
  fill: 'currentColor',
  width: '0.8em',
  height: '0.8em',
})

const Path = styled('path')``

type MenuToggleButtonProps = {
  isOpen: boolean
  toggle: () => void
}

export const MenuToggleButton = ({ toggle, isOpen }: MenuToggleButtonProps) => (
  <IconButton onClick={toggle} sx={{
    display: 'inline-flex',
    zIndex: 1400,
  }}>
    <Svg
      // className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall css-36mik4-MuiSvgIcon-root"
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <Path d="M3 8h18v-2H3z" sx={{ transition: 'transform 1s', ...isOpen && { transform: 'skewY(-45deg) translate(0, 17px)' } }} />
      <Path d="M3 13h18v-2H3z" sx={{ transition: 'opacity 1s', ...isOpen && { opacity: 0 } }} />
      <Path d="M3 18h18v-2H3z" sx={{ transition: 'transform 1s', ...isOpen && { transform: 'skewY(45deg) translate(0, -17px)' } }} />
    </Svg>
  </IconButton>
  )

import React, { ReactNode } from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import MuiSwipeableDrawer from '@mui/material/SwipeableDrawer'
type Props = {
  button: ReactNode
  children: ReactNode
  open: boolean
  setOpen: (open: boolean) => void
  paperSx?: SxProps<Theme>
}

/**
 * The following properties are advised for optimal usability: https://mui.com/material-ui/react-drawer/#swipeable
 * iOS is hosted on high-end devices. The backdrop transition can be enabled without dropping frames. The performance will be good enough.
 * iOS has a "swipe to go back" feature that interferes with the discovery feature, so discovery has to be disabled.
 */
const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

/**
 * A swipeable drawer component that can be used to display a list of items.
 */
export const SwipeableDrawer = ({ button, children, open, setOpen, paperSx }: Props) => (
  <Box sx={{ height: '100%' }}>
    {button}
    <MuiSwipeableDrawer
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      anchor="bottom"
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      disableSwipeToOpen={false}
      keepMounted={false}
      slotProps={{ paper: { sx: paperSx } }}
    >
      <Box sx={{ paddingBlockStart: 2 }}>
        <Puller />
      </Box>
      {children}
    </MuiSwipeableDrawer>
  </Box>
)

export const Puller = () => (
  <Box
    sx={{
      width: 80,
      height: 4,
      backgroundColor: (t) => t.design.Color.Neutral[500],
      margin: '0 auto',
    }}
  />
)

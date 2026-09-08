import type { ReactNode } from 'react'
import Dialog from '@mui/material/Dialog'

export const DialogFullscreen = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
  <Dialog
    open
    onClose={onClose}
    maxWidth={false}
    fullScreen
    slotProps={{
      paper: {
        sx: {
          width: { mobile: '90dvw', tablet: '80dvw' },
          height: { mobile: '90dvh', tablet: '80dvh' },
        },
      },
    }}
  >
    {children}
  </Dialog>
)

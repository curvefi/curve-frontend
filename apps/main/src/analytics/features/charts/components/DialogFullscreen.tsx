import type { ReactNode } from 'react'
import Dialog from '@mui/material/Dialog'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'

export const DialogFullscreen = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => {
  const isMobile = useIsMobile()

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      fullScreen
      slotProps={{ paper: { sx: { width: isMobile ? '90dvw' : '80dvw', height: isMobile ? '90dvh' : '80dvh' } } }}
    >
      {children}
    </Dialog>
  )
}

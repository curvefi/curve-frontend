import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

import { Home } from './home'

type Props = {
  open: boolean
  onClose: () => void
}

export const UserProfile = ({ open, onClose }: Props) => (
  <Drawer
    open={open}
    anchor="right"
    onClose={onClose}
    PaperProps={{
      sx: {
        minWidth: SizesAndSpaces.ModalWidth.lg,
        paddingInline: SizesAndSpaces.Spacing.md,
        paddingBlock: SizesAndSpaces.Spacing.lg,
        backgroundColor: (t) => t.design.Layer[1].Fill,
      },
    }}
  >
    <Home onClose={onClose} />
  </Drawer>
)

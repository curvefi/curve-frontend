import { ReactNode } from 'react'
import { borderStyle } from '@evm-ui/utils'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'

export const MenuSectionHeader = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="headingXsBold"
    sx={t => ({
      position: 'sticky',
      top: 0,
      backgroundColor: 'background.paper',
      zIndex: 1,
      paddingBlockEnd: SizesAndSpaces.Spacing.xs,
      height: SizesAndSpaces.ButtonSize.sm,
      alignContent: 'end',
      borderBottom: borderStyle(t),
    })}
  >
    {children}
  </Typography>
)

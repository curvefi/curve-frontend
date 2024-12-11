import { ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'

export const MenuSectionHeader = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="headingXsBold"
    sx={(t) => ({
      position: 'sticky',
      top: 0,
      backgroundColor: 'background.paper',
      zIndex: 1,
      paddingBlockEnd: SizesAndSpaces.Spacing.xs,
      height: SizesAndSpaces.ButtonSize.sm,
      alignContent: 'end',
      borderBottom: `1px solid ${t.design.Layer[1].Outline}`,
    })}
  >
    {children}
  </Typography>
)

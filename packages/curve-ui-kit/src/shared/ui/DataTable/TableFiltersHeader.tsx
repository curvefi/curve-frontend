import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const TableFiltersHeader = ({ title, rightChildren }: { title: string; rightChildren?: ReactNode }) => (
  <Stack
    direction="row"
    sx={{
      justifyContent: 'space-between',
      alignItems: 'end',
      paddingBlockEnd: Spacing.xs,
      backgroundColor: t => t.design.Layer.App.Background,
    }}
  >
    <Typography variant="headingSBold" color="textSecondary" sx={{ paddingInlineStart: Spacing.sm }}>
      {title}
    </Typography>
    {rightChildren}
  </Stack>
)

import { Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize, LineHeight } = SizesAndSpaces

export const DrawerHeader = ({ title, rightChildren }: { title: string; rightChildren?: React.ReactNode }) => (
    <Stack
      direction="row"
      alignItems="flex-end"
      justifyContent="flex-start"
      sx={{ minHeight: LineHeight.xxl, p: Spacing.md }}
      borderBottom={(t) => `1px solid ${t.design.Layer[3].Outline}`}
    >
      <Typography variant="headingXsBold">{title}</Typography>
      {rightChildren}
    </Stack>
  )

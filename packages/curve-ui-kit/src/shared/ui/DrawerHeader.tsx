import { Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize, LineHeight } = SizesAndSpaces

export const DrawerHeader = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <Stack
    direction="row"
    alignItems="flex-end"
    justifyContent="flex-start"
    sx={{ minHeight: LineHeight.xxl, p: Spacing.md }}
    borderBottom={(t) => `1px solid ${t.design.Layer[3].Outline}`}
  >
    <Typography variant="headingXsBold">{title}</Typography>
    {children}
  </Stack>
)

import { ReactNode } from 'react'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { Stack, Typography } from '@mui/material'

const { Spacing, LineHeight } = SizesAndSpaces

export const DrawerHeader = ({ title, children }: { title: string; children?: ReactNode }) => (
  <Stack
    direction="row"
    sx={{
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      borderBottom: t => `1px solid ${t.design.Layer[3].Outline}`,
      minHeight: LineHeight.xxl,
      p: Spacing.md,
    }}
  >
    <Typography variant="headingXsBold">{title}</Typography>
    {children}
  </Stack>
)

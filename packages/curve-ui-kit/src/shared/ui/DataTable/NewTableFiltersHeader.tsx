import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const NewTableFiltersHeader = ({ title, rightChildren }: { title: string; rightChildren?: ReactNode }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    // background needed because table head has a dfault color, and transparent is not possible because table head is sticky
    sx={{ backgroundColor: (t) => t.design.Layer.App.Background }}
    // cannot use Stack + gap because the background color need to be this one and not the default
    paddingBlockEnd={Spacing.xs}
  >
    <Typography variant="headingSBold">{title}</Typography>
    {rightChildren}
  </Stack>
)

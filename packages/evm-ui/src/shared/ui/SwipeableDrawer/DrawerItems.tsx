import Stack, { StackProps } from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const DrawerItems = (props: StackProps) => (
  <Stack
    direction="column"
    {...props}
    sx={applySxProps(
      {
        gap: Spacing.sm,
        paddingInline: Spacing.sm,
        paddingBlockEnd: Spacing.md,
        overflow: 'auto',
        flex: 1,
      },
      props.sx,
    )}
  />
)

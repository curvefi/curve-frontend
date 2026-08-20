import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { applySxProps } from '@evm-ui/utils'
import Stack, { StackProps } from '@mui/material/Stack'

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

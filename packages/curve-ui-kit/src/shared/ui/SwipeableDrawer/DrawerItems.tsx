import Stack, { StackProps } from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const DrawerItems = (props: StackProps) => (
  <Stack
    direction="column"
    {...props}
    sx={[
      {
        gap: Spacing.sm,
        paddingInline: Spacing.sm,
        paddingBlockEnd: Spacing.md,
        overflow: 'auto',
        flex: 1,
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
)

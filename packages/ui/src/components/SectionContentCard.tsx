import Stack, { type StackProps } from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui/lib/mui'

const { Spacing } = SizesAndSpaces

export const SectionContentCard = (props: StackProps) => (
  <Stack {...props} sx={applySxProps({ marginBlockStart: Spacing.sm, '&:empty': { display: 'none' } }, props.sx)} />
)

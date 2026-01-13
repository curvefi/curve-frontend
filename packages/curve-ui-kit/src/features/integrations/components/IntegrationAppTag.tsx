import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { IntegrationTag } from '../types'

const { Spacing, Sizing } = SizesAndSpaces

export const IntegrationAppTag = ({ tag }: { tag: IntegrationTag }) => (
  <Stack direction="row" alignItems="center" gap={Spacing.sm}>
    {tag.color && <Box sx={{ width: Sizing.xs, height: Sizing.xs, backgroundColor: tag.color }} />}
    {tag.displayName}
  </Stack>
)

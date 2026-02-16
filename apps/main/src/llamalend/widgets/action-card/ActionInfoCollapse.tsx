import Collapse, { CollapseProps } from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const ActionInfoCollapse = ({
  children,
  isOpen = true,
  testId,
}: {
  children: React.ReactNode
  isOpen: CollapseProps['in']
  testId?: string
}) => (
  <Collapse in={isOpen} data-testid={testId}>
    <Stack gap={Spacing.sm} divider={<Divider sx={{ marginInline: Spacing.md }} />}>
      {children}
    </Stack>
  </Collapse>
)

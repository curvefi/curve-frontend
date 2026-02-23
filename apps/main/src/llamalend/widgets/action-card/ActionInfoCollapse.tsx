import type { ReactNode } from 'react'
import Collapse, { CollapseProps } from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ACTION_INFO_GROUP_SX } from './info-actions.helpers'

const { Spacing } = SizesAndSpaces

export const ActionInfoCollapse = ({
  children,
  isOpen = true,
  testId,
}: {
  children: ReactNode
  isOpen: CollapseProps['in']
  testId?: string
}) => (
  <Collapse in={isOpen} data-testid={testId}>
    <Stack gap={ACTION_INFO_GROUP_SX.gap} divider={<Divider sx={{ marginInline: Spacing.md }} />}>
      {children}
    </Stack>
  </Collapse>
)

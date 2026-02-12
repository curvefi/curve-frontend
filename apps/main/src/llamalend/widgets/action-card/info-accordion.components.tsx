import Collapse, { CollapseProps } from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const ActionInfoAccordion = ({
  children,
  isOpen = true,
  testId,
}: {
  children: React.ReactNode
  isOpen: CollapseProps['in']
  testId?: string
}) => {
  return (
    <Collapse in={isOpen} data-testid={testId}>
      <Stack gap={Spacing.sm}>{children}</Stack>
    </Collapse>
  )
}

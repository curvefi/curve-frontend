import Stack from '@mui/material/Stack'
import { Accordion, AccordionProps } from '@ui-kit/shared/ui/Accordion'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const ActionInfoAccordion = ({ children, ...props }: { children: React.ReactNode } & AccordionProps) => (
  <Accordion ghost {...props}>
    <Stack gap={Spacing.sm}>{children}</Stack>
  </Accordion>
)

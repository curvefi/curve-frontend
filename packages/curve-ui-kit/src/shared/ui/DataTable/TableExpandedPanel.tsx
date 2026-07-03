import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { Responsive } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DataTableCategory } from './data-table.utils'

const { Spacing } = SizesAndSpaces

type TableExpandedPanelProps = {
  children: ReactNode
  footer?: ReactNode
  category: DataTableCategory
}

const PANEL_STYLE: Record<DataTableCategory, { paddingBlockStart?: Responsive }> = {
  scrollable: { paddingBlockStart: Spacing.md },
  list: {},
  limited: {},
  detail: {},
  form: {},
}

export const TableExpandedPanel = ({ children, footer, category }: TableExpandedPanelProps) => (
  <Stack direction="column" sx={{ gap: Spacing.md, paddingBlockStart: PANEL_STYLE[category]?.paddingBlockStart }}>
    <Stack sx={{ gap: Spacing.md, paddingInline: Spacing.md }}>{children}</Stack>
    {footer && (
      <Stack direction="row" sx={{ gap: Spacing.xs, '& > *': { flex: 1 } }}>
        {footer}
      </Stack>
    )}
  </Stack>
)

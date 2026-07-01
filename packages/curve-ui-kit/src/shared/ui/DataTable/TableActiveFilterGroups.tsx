import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableSelectedFilterChips } from './TableSelectedFilterChips'

const { Spacing } = SizesAndSpaces

export type TableActiveFilterGroup = {
  chips: ReactNode
  key: string
  testId?: string
  title: ReactNode
}

/** Renders active filters grouped under category labels. */
export const TableActiveFilterGroups = ({ groups }: { groups: readonly TableActiveFilterGroup[] }) => (
  <Stack direction="row" sx={{ gap: Spacing.sm, flexWrap: 'wrap' }}>
    {groups.map(({ chips, key, testId, title }) => (
      <TableSelectedFilterChips key={key} title={title} testId={testId}>
        {chips}
      </TableSelectedFilterChips>
    ))}
  </Stack>
)

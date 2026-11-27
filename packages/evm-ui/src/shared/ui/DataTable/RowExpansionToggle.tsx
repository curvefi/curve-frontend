import type { ReactNode } from 'react'
import ButtonBase from '@mui/material/ButtonBase'
import { type Row, type RowData, Subscribe } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ChevronRightIcon } from '@ui/icons/ChevronRightIcon'

const { Spacing } = SizesAndSpaces

export const RowExpansionToggle = <TData extends RowData>({
  row,
  children,
}: {
  row: Row<CurveTableFeatures, TData>
  children: ReactNode
}) => (
  <Subscribe source={row.table.atoms.expanded} selector={() => row.getIsExpanded()}>
    {isExpanded => (
      <ButtonBase
        aria-expanded={isExpanded}
        onClick={() => row.toggleExpanded()}
        sx={{ gap: Spacing.xs, textAlign: 'start', '&.Mui-focusVisible': { outline: '1px solid' } }}
      >
        <ChevronRightIcon
          fontSize="small"
          data-testid={isExpanded ? 'collapse-icon' : 'expand-icon'}
          sx={{ flexShrink: 0, transform: isExpanded ? 'rotate(90deg)' : undefined, transition: 'none' }}
        />
        {children}
      </ButtonBase>
    )}
  </Subscribe>
)

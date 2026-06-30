import type { ReactNode } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type TableActiveFiltersBarProps = {
  children: ReactNode
  endSlot?: ReactNode
  hasActiveFilters: boolean
  resetFilters: () => void
  testId: string
}

/** Collapsible active-filter row for DataTable. */
export const TableActiveFiltersBar = ({
  children,
  endSlot,
  hasActiveFilters,
  resetFilters,
  testId,
}: TableActiveFiltersBarProps) => (
  <Stack
    direction="row"
    sx={{
      paddingBlock: Spacing.xs,
      paddingInline: Spacing.sm,
      alignItems: 'end',
      gap: Spacing.sm,
      justifyContent: 'space-between',
      borderTop: borderStyle,
    }}
    data-testid={testId}
  >
    {children}

    <Button
      color="ghost"
      size="extraSmall"
      onClick={resetFilters}
      disabled={!hasActiveFilters}
      sx={{ flexShrink: 0 }}
      data-testid={`${testId}-reset-btn`}
    >
      {t`Reset filters`}
    </Button>

    {endSlot}
  </Stack>
)

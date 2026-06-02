import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import type { FilterProps, TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui-kit/utils'
import { LlamaMarketColumnId } from '../columns'
import { LlamaTableActiveFiltersChip } from './LlamaTableActiveFiltersChip'

const { Spacing } = SizesAndSpaces

const TEST_ID = 'table-filters-collapsible'

export const LlamaTableFiltersCollapsible = <T extends TableItem>({
  table,
  resetFilters,
  setColumnFilter,
}: {
  table: TanstackTable<T>
  resetFilters: () => void
} & FilterProps<LlamaMarketColumnId>) => (
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
    data-testid={TEST_ID}
  >
    <LlamaTableActiveFiltersChip table={table} setColumnFilter={setColumnFilter} testIdPrefix={TEST_ID} />

    <Button
      color="ghost"
      size="extraSmall"
      onClick={resetFilters}
      sx={{ flexShrink: 0 }}
      data-testid={`${TEST_ID}-reset-btn`}
    >
      {t`Reset filters`}
    </Button>
  </Stack>
)

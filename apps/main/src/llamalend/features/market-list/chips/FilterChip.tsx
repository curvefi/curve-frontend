import { RefObject } from 'react'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'

type Props = {
  filterChipRef: RefObject<HTMLDivElement | null>
  filtersOpen: boolean
  toggleFilters: () => void
  testId?: string
}

export const FilterChip = ({ filterChipRef, filtersOpen, toggleFilters, testId = 'btn-open-filters' }: Props) =>
  useIsMobile() ? (
    <SelectableChip
      ref={filterChipRef}
      size="medium"
      selected={filtersOpen}
      icon={<FilterIcon />}
      toggle={toggleFilters}
      data-testid={testId}
    />
  ) : (
    <GridChip
      ref={filterChipRef}
      label={t`Filters`}
      selectableChipSize="medium"
      selected={filtersOpen}
      icon={<FilterIcon />}
      toggle={toggleFilters}
      data-testid={testId}
    />
  )

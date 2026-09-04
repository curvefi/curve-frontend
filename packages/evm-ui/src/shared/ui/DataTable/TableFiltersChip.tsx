import type { RefObject } from 'react'
import { SelectableChip } from '@ui/components/SelectableChip'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { FilterIcon } from '@ui/icons/FilterIcon'
import { t } from '@ui/lib/i18n'
import { GridChip } from './chips/GridChip'

type TableFiltersChipProps = {
  open: boolean
  popoverFilterChipRef: RefObject<HTMLDivElement | null>
  setOpen: (open: boolean) => void
  testId: string
}

/** Button that opens table filters in a drawer or popover. */
export const TableFiltersChip = ({ open, popoverFilterChipRef, setOpen, testId }: TableFiltersChipProps) => {
  const isMobile = useIsMobile()
  const openFilters = () => setOpen(true)

  return isMobile ? (
    <SelectableChip size="medium" selected={open} icon={<FilterIcon />} toggle={openFilters} data-testid={testId} />
  ) : (
    <GridChip
      ref={popoverFilterChipRef}
      label={t`Filters`}
      selectableChipSize="medium"
      selected={open}
      icon={<FilterIcon />}
      toggle={openFilters}
      data-testid={testId}
    />
  )
}

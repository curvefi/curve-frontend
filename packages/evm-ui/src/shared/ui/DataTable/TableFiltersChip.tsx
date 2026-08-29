import type { RefObject } from 'react'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { FilterIcon } from '@evm-ui/shared/icons/FilterIcon'
import { SelectableChip } from '@evm-ui/shared/ui/SelectableChip'
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
    <SelectableChip
      size="medium"
      selected={open}
      icon={<FilterIcon />}
      toggle={openFilters}
      aria-label={t`Filters`}
      data-testid={testId}
    />
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

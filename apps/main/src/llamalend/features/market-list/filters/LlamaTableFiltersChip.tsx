import type { RefObject } from 'react'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'

const OPEN_FILTERS_TEST_ID = 'btn-open-filters'

type LlamaTableFiltersChipProps = {
  open: boolean
  setOpen: (open: boolean) => void
  popoverFilterChipRef: RefObject<HTMLDivElement | null>
}

/** Button that opens the Llama market filters drawer or popover. */
export const LlamaTableFiltersChip = ({ open, setOpen, popoverFilterChipRef }: LlamaTableFiltersChipProps) => {
  const isMobile = useIsMobile()
  const openFilters = () => setOpen(true)

  return isMobile ? (
    <SelectableChip
      size="medium"
      selected={open}
      icon={<FilterIcon />}
      toggle={openFilters}
      data-testid={OPEN_FILTERS_TEST_ID}
    />
  ) : (
    <GridChip
      ref={popoverFilterChipRef}
      label={t`Filters`}
      selectableChipSize="medium"
      selected={open}
      icon={<FilterIcon />}
      toggle={openFilters}
      data-testid={OPEN_FILTERS_TEST_ID}
    />
  )
}

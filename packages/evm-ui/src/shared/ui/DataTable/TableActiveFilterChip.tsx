import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'

type TableActiveFilterChipProps = {
  label: string
  testId?: string
  toggle: () => void
}

export const TableActiveFilterChip = ({ label, testId, toggle }: TableActiveFilterChipProps) => (
  <SelectableChip selected toggle={toggle} label={label} aria-label={label} data-testid={testId} />
)

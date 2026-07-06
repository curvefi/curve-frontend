import type { ReactNode } from 'react'
import { HiddenInlinedItems } from './HiddenInlinedItems'
import { getInlinedItemsVisibility } from './HiddenInlinedItems.utils'
import { TableActiveFilterChip } from './TableActiveFilterChip'
import type { TableActiveFilterGroup } from './TableActiveFilterGroups'

export type TableActiveFilterGroupRemove = (labelOrLabels: string | string[]) => void

export type CreateTableActiveFilterGroupProps = {
  formatLabel?: (label: string) => string
  getChipTestId?: (label: string) => string | undefined
  key: string
  labels: readonly string[] | null | undefined
  onRemove: TableActiveFilterGroupRemove
  renderChips?: (props: { labels: string[]; onRemove: TableActiveFilterGroupRemove }) => ReactNode
  testId?: string
  title: ReactNode
}

/** Creates an active-filter group with standard chip overflow and removal behavior. */
export const createTableActiveFilterGroup = ({
  formatLabel = label => label,
  getChipTestId,
  key,
  labels,
  onRemove,
  renderChips,
  testId,
  title,
}: CreateTableActiveFilterGroupProps): TableActiveFilterGroup | false => {
  const activeLabels = labels?.filter(label => !!label) ?? []
  if (!activeLabels.length) return false

  const [visibleLabels, hiddenLabels] = getInlinedItemsVisibility(activeLabels)

  return {
    chips: renderChips ? (
      renderChips({ labels: activeLabels, onRemove })
    ) : (
      <>
        {visibleLabels.map(label => (
          <TableActiveFilterChip
            key={`${key}-${label}`}
            label={formatLabel(label)}
            toggle={() => onRemove(label)}
            testId={getChipTestId?.(label)}
          />
        ))}
        <HiddenInlinedItems
          hiddenSelectedItemsLength={hiddenLabels.length}
          renderItem={label => <TableActiveFilterChip label={label} toggle={() => onRemove(hiddenLabels)} />}
        />
      </>
    ),
    key,
    testId,
    title,
  }
}

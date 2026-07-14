import type { FunctionComponent, ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { HiddenInlinedItems } from './HiddenInlinedItems'
import { getInlinedItemsVisibility } from './HiddenInlinedItems.utils'
import { TableActiveFilterChip } from './TableActiveFilterChip'
import { TableSelectedFilterChips } from './TableSelectedFilterChips'

const { Spacing } = SizesAndSpaces

export type TableActiveFilterGroupRemove = (labelOrLabels: string | string[]) => void

export type TableActiveFilterGroupChipsProps = {
  labels: string[]
  onRemove: TableActiveFilterGroupRemove
}

export type TableActiveFilterGroup = {
  Chips?: FunctionComponent<TableActiveFilterGroupChipsProps>
  getChipLabel?: (label: string) => string
  getChipTestId?: (label: string) => string | undefined
  key: string
  labels: readonly string[] | null | undefined
  onRemove: TableActiveFilterGroupRemove
  testId?: string
  title: ReactNode
}

type DefaultTableActiveFilterGroupChipsProps = TableActiveFilterGroupChipsProps & {
  getChipLabel?: (label: string) => string
  getChipTestId?: (label: string) => string | undefined
}

const DefaultTableActiveFilterGroupChips = ({
  getChipLabel = label => label,
  getChipTestId,
  labels,
  onRemove,
}: DefaultTableActiveFilterGroupChipsProps) => {
  const [visibleLabels, hiddenLabels] = getInlinedItemsVisibility(labels)

  return (
    <>
      {visibleLabels.map(label => (
        <TableActiveFilterChip
          key={label}
          label={getChipLabel(label)}
          toggle={() => onRemove(label)}
          testId={getChipTestId?.(label)}
        />
      ))}
      <HiddenInlinedItems
        hiddenSelectedItemsLength={hiddenLabels.length}
        renderItem={label => <TableActiveFilterChip label={label} toggle={() => onRemove(hiddenLabels)} />}
      />
    </>
  )
}

/** Renders active filters grouped under category labels. */
export const TableActiveFilterGroups = ({ groups }: { groups: readonly TableActiveFilterGroup[] }) => (
  <Stack direction="row" sx={{ gap: Spacing.sm, flexWrap: 'wrap' }}>
    {groups.map(({ Chips, getChipLabel, getChipTestId, key, labels, onRemove, testId, title }) => {
      const activeLabels = notFalsy(...(labels ?? []))
      if (!activeLabels.length) return null

      return (
        <TableSelectedFilterChips key={key} title={title} testId={testId}>
          {Chips ? (
            <Chips labels={activeLabels} onRemove={onRemove} />
          ) : (
            <DefaultTableActiveFilterGroupChips
              getChipLabel={getChipLabel}
              getChipTestId={getChipTestId}
              labels={activeLabels}
              onRemove={onRemove}
            />
          )}
        </TableSelectedFilterChips>
      )
    })}
  </Stack>
)

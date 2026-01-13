import { useMemo } from 'react'
import { Popover2Dialog, Popover2Trigger as Popover } from 'ui/src/Popover2'
import { TableSortSelectOptions } from 'ui/src/TableSort/TableSortSelectOptions'
import type { TableSortSelectProps } from 'ui/src/TableSort/types'
import { getLabel } from 'ui/src/TableSort/utils'

const title = 'Sort by'

export function TableSortSelect<T extends { sortBy: string; sortByOrder: 'asc' | 'desc' }>({
  searchParams,
  labelsMapper,
  onSelectionDelete,
  updatePath,
}: TableSortSelectProps<T>) {
  const { sortBy, sortByOrder } = searchParams

  const handleRadioGroupChange = (updatedSortValue: string, cb: (() => void) | undefined) => {
    const [updatedSortBy, updatedSortByOrder] = updatedSortValue.split('-')

    updatePath({ ...searchParams, sortBy: updatedSortBy, sortByOrder: updatedSortByOrder })

    if (typeof cb === 'function') {
      cb()
    }
  }

  const label = useMemo(() => getLabel(labelsMapper, sortBy), [labelsMapper, sortBy])

  return (
    <Popover
      placement="bottom end"
      offset={0}
      buttonVariant="outlined"
      buttonStyles={{ padding: '0.5rem' }}
      onSelectionDelete={onSelectionDelete}
      label={
        <div>
          <strong>
            {title} {label}
          </strong>{' '}
          {label ? `(${sortByOrder})` : ''}
        </div>
      }
      showExpandIcon
    >
      <Popover2Dialog title={title}>
        <TableSortSelectOptions
          labelsMapper={labelsMapper}
          value={`${sortBy}-${sortByOrder}`}
          handleRadioGroupChange={handleRadioGroupChange}
        />
      </Popover2Dialog>
    </Popover>
  )
}

import { useOverlayTriggerState } from '@react-stately/overlays'
import React, { useMemo } from 'react'

import ModalDialog, { OpenDialogButton } from 'ui/src/Dialog'
import { RadioGroup } from 'ui/src/Radio'
import { delayAction } from 'ui/src/utils/helpers'

import TableButtonFiltersMobileItem from './components/TableButtonFiltersMobileItem'
import TableButtonFiltersMobileItemIcon from './components/TableButtonFiltersMobileItemIcon'

const TableButtonFiltersMobile = ({
  filters,
  filterKey,
  updateRouteFilterKey,
}: {
  filters: {
    [_: string]: { id: string; displayName: string; color?: string }
  }
  filterKey: string
  updateRouteFilterKey(filterKey: string): void
}) => {
  let overlayTriggerState = useOverlayTriggerState({})

  const handleRadioGroupChange = (updatedFilterKey: string) => {
    updateRouteFilterKey(updatedFilterKey)
    delayAction(overlayTriggerState.close)
  }

  const { selectedLabel, selectedColor } = useMemo(() => {
    if (filterKey) {
      const found = filters[filterKey]
      if (found) {
        return { selectedLabel: found.displayName, selectedColor: found.color }
      }
    }
    return { selectedLabel: 'Filter by', selectedColor: null }
  }, [filters, filterKey])

  return (
    <>
      <OpenDialogButton overlayTriggerState={overlayTriggerState} showCaret variant="icon-outlined">
        {selectedColor && <TableButtonFiltersMobileItemIcon color={selectedColor} />}
        {selectedLabel}
      </OpenDialogButton>
      {overlayTriggerState.isOpen && (
        <ModalDialog title="Filter by" state={{ ...overlayTriggerState, close: () => overlayTriggerState.close() }}>
          <RadioGroup aria-label={`Filter by`} onChange={handleRadioGroupChange} value={filterKey}>
            {Object.keys(filters).map((k) => {
              const item = filters[k]
              return <TableButtonFiltersMobileItem key={item.id} item={item} />
            })}
          </RadioGroup>
        </ModalDialog>
      )}
    </>
  )
}

export default TableButtonFiltersMobile

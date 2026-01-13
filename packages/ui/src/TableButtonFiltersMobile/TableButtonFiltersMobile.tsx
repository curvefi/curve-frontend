import { useIsMobile } from 'curve-ui-kit/src/hooks/useBreakpoints'
import { useMemo } from 'react'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { ModalDialog } from 'ui/src/Dialog/ModalDialog'
import { OpenDialogButton } from 'ui/src/Dialog/OpenDialogButton'
import { RadioGroup } from 'ui/src/Radio'
import { TableButtonFiltersMobileItem } from './components/TableButtonFiltersMobileItem'
import { TableButtonFiltersMobileItemIcon } from './components/TableButtonFiltersMobileItemIcon'

type Filters = { [_: string]: { id: string; displayName: string; color?: string } } | undefined

const FILTER_DEFAULT = { selectedLabel: 'Filter by', selectedColor: null }

export const TableButtonFiltersMobile = ({
  filters,
  filterKey,
  updateRouteFilterKey,
}: {
  filters: Filters
  filterKey: string
  updateRouteFilterKey(filterKey: string): void
}) => {
  const overlayTriggerState = useOverlayTriggerState({})
  const isMobile = useIsMobile()

  const handleClose = () =>
    isMobile ? setTimeout(overlayTriggerState.close, Duration.Delay) : overlayTriggerState.close()

  const handleRadioGroupChange = (updatedFilterKey: string) => {
    updateRouteFilterKey(updatedFilterKey)
    handleClose()
  }

  const { selectedLabel, selectedColor } = useMemo(() => {
    if (!filters || !filterKey) return FILTER_DEFAULT

    const found = filters[filterKey]
    if (!found) return FILTER_DEFAULT

    return { selectedLabel: found.displayName, selectedColor: found.color }
  }, [filters, filterKey])

  return (
    <>
      <OpenDialogButton overlayTriggerState={overlayTriggerState} showCaret variant="icon-outlined">
        {selectedColor && <TableButtonFiltersMobileItemIcon color={selectedColor} />}
        {selectedLabel}
      </OpenDialogButton>
      {overlayTriggerState.isOpen && (
        <ModalDialog title="Filter by" state={{ ...overlayTriggerState, close: handleClose }}>
          <RadioGroup aria-label={`Filter by`} onChange={handleRadioGroupChange} value={filterKey}>
            {filters &&
              Object.keys(filters).map((k) => {
                const item = filters[k]
                return <TableButtonFiltersMobileItem key={item.id} item={item} />
              })}
          </RadioGroup>
        </ModalDialog>
      )}
    </>
  )
}

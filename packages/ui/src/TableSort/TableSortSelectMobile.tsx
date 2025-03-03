import type { TableSortSelectProps } from 'ui/src/TableSort/types'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { useMemo } from 'react'
import styled from 'styled-components'
import { delayAction } from 'ui/src/utils/helpers'
import { getLabel } from 'ui/src/TableSort/utils'
import Chip from 'ui/src/Typography/Chip'
import Box from 'ui/src/Box'
import ModalDialog, { OpenDialogButton } from 'ui/src/Dialog'
import TableSortSelectOptions from 'ui/src/TableSort/TableSortSelectOptions'

function TableSortSelectMobile<T extends { sortBy: string; sortByOrder: 'asc' | 'desc' }>({
  className,
  searchParams,
  labelsMapper,
  updatePath,
}: TableSortSelectProps<T>) {
  const overlayTriggerState = useOverlayTriggerState({})

  const handleRadioGroupChange = (updatedSortValue: string) => {
    const [sortBy, sortByOrder] = updatedSortValue.split('-')

    updatePath({ ...searchParams, sortBy, sortByOrder })
    delayAction(overlayTriggerState.close)
  }

  const sortLabel = useMemo(() => getLabel(labelsMapper, searchParams.sortBy), [searchParams.sortBy, labelsMapper])
  const title = 'Sort By'

  return (
    <Box className={className}>
      <OpenDialogButton overlayTriggerState={overlayTriggerState} showCaret variant="icon-outlined">
        {sortLabel && (
          <Box>
            <ButtonText>{sortLabel}</ButtonText>{' '}
            <Chip className="chip vertical-align-middle">({searchParams.sortByOrder})</Chip>
          </Box>
        )}
        {!sortLabel && title}
      </OpenDialogButton>
      {overlayTriggerState.isOpen && (
        <ModalDialog title="Type" state={{ ...overlayTriggerState, close: () => overlayTriggerState.close() }}>
          <TableSortSelectOptions
            labelsMapper={labelsMapper}
            value={`${searchParams.sortBy}-${searchParams.sortByOrder}`}
            handleRadioGroupChange={handleRadioGroupChange}
          />
        </ModalDialog>
      )}
    </Box>
  )
}

const ButtonText = styled.span`
  vertical-align: middle;
`

export default TableSortSelectMobile

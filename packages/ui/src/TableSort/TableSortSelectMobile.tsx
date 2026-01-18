import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { Box } from '@ui/Box'
import { ModalDialog } from '@ui/Dialog/ModalDialog'
import { OpenDialogButton } from '@ui/Dialog/OpenDialogButton'
import { TableSortSelectOptions } from '@ui/TableSort/TableSortSelectOptions'
import type { TableSortSelectProps } from '@ui/TableSort/types'
import { getLabel } from '@ui/TableSort/utils'
import { Chip } from '@ui/Typography/Chip'
import { Duration } from '@ui-kit/themes/design/0_primitives'

export function TableSortSelectMobile<T extends { sortBy: string; sortByOrder: 'asc' | 'desc' }>({
  className,
  searchParams,
  labelsMapper,
  updatePath,
}: TableSortSelectProps<T>) {
  const overlayTriggerState = useOverlayTriggerState({})

  const handleRadioGroupChange = (updatedSortValue: string) => {
    const [sortBy, sortByOrder] = updatedSortValue.split('-')

    updatePath({ ...searchParams, sortBy, sortByOrder })
    setTimeout(overlayTriggerState.close, Duration.Delay)
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

import type { Order, PoolListTableLabel, SearchParams, SortKey } from '@/components/PagePoolList/types'

import { t } from '@lingui/macro'
import { useOverlayTriggerState } from '@react-stately/overlays'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { delayAction } from '@/utils'
import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import DialogSortContent from '@/components/PagePoolList/components/DialogSort/DialogSortContent'
import ModalDialog, { OpenDialogButton } from '@/ui/Dialog'

const DialogSortMobile = ({
  searchParams,
  tableLabels,
  updatePath,
}: {
  searchParams: SearchParams
  tableLabels: PoolListTableLabel
  updatePath(updatedFormValues: SearchParams): void
}) => {
  let overlayTriggerState = useOverlayTriggerState({})

  const handleRadioGroupChange = (updatedSortValue: string) => {
    const [sortBy, sortByOrder] = updatedSortValue.split('-')

    updatePath({
      ...searchParams,
      sortBy: sortBy as SortKey,
      sortByOrder: sortByOrder as Order,
    })
    delayAction(overlayTriggerState.close)
  }

  const sortLabel = useMemo(() => {
    let label: React.ReactNode | '' = ''

    if (searchParams.sortBy) {
      const foundLabel = tableLabels[searchParams.sortBy]
      if (foundLabel) {
        label = foundLabel.mobile || foundLabel.name
      }
    }
    return label
  }, [searchParams.sortBy, tableLabels])

  return (
    <Box>
      <OpenDialogButton overlayTriggerState={overlayTriggerState} showCaret variant="icon-outlined">
        {sortLabel ? (
          <Box>
            <ButtonText>{sortLabel}</ButtonText>{' '}
            <Chip className="chip vertical-align-middle">({searchParams.sortByOrder})</Chip>
          </Box>
        ) : (
          t`Sort By`
        )}
      </OpenDialogButton>
      {overlayTriggerState.isOpen && (
        <ModalDialog title="Type" state={{ ...overlayTriggerState, close: () => overlayTriggerState.close() }}>
          <DialogSortContent
            tableLabels={tableLabels}
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

export default DialogSortMobile

import type { FormValues, Order, PoolListTableLabel, SearchParams, SortKey } from '@/components/PagePoolList/types'

import { t } from '@lingui/macro'
import React from 'react'

import DialogSortContent from '@/components/PagePoolList/components/DialogSort/DialogSortContent'
import Popover, { Popover2Dialog } from '@/ui/Popover2'

const DialogSortDesktop = ({
  searchParams,
  tableLabels,
  updatePath,
}: {
  searchParams: SearchParams
  tableLabels: PoolListTableLabel
  updatePath(updatedFormValues: Partial<SearchParams>): void
}) => {
  const handleRadioGroupChange = (updatedSortValue: string, cb: (() => void) | undefined) => {
    const [sortBy, sortByOrder] = updatedSortValue.split('-')

    updatePath({
      ...searchParams,
      sortBy: sortBy as SortKey,
      sortByOrder: sortByOrder as Order,
    })

    if (typeof cb === 'function') {
      cb()
    }
  }

  return (
    <Popover
      placement="bottom end"
      offset={0}
      buttonVariant="outlined"
      buttonStyles={{ padding: '0.5rem' }}
      label={
        <div>
          {t`Sort by`}{' '}
          <strong>{tableLabels[searchParams.sortBy].mobile ?? tableLabels[searchParams.sortBy].name}</strong> (
          {searchParams.sortByOrder})
        </div>
      }
      showExpandIcon
    >
      <Popover2Dialog title={t`Sort by`}>
        <DialogSortContent
          tableLabels={tableLabels}
          value={`${searchParams.sortBy}-${searchParams.sortByOrder}`}
          handleRadioGroupChange={handleRadioGroupChange}
        />
      </Popover2Dialog>
    </Popover>
  )
}

export default DialogSortDesktop

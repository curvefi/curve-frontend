import type { FilterTypeKey, SearchParams } from '@/components/PageMarketList/types'

import React from 'react'
import { Item } from 'react-stately'
import { t } from '@lingui/macro'

import Select from '@/ui/Select'

type ListItem = { id: string; displayName: string }

const SelectFilterType = ({
  isLoading,
  list,
  filterKey,
  updatePath,
}: {
  isLoading: boolean
  list: ListItem[]
  filterKey: string
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => {
  return (
    <Select
      aria-label={t`Select type`}
      items={list}
      loading={isLoading}
      minWidth="200px"
      selectedKey={filterKey}
      onSelectionChange={(filterTypeKey) => updatePath({ filterTypeKey: filterTypeKey as FilterTypeKey })}
      onSelectionDelete={() => updatePath({ filterTypeKey: 'borrow' })}
    >
      {({ id, displayName }: ListItem) => {
        return (
          <Item key={id} textValue={id}>
            <strong>{displayName}</strong>
          </Item>
        )
      }}
    </Select>
  )
}

export default SelectFilterType

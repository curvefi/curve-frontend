import Select from '@/ui/Select'
import { t } from '@lingui/macro'
import React from 'react'
import { Item } from 'react-stately'
import type { SearchParams } from '@/components/PageMarketList/types'


import { Filter } from '@/components/PageMarketList/utils'

type ListItem = { id: string; displayName: string }

const SelectFilter = ({
  list,
  filterKey,
  updatePath,
}: {
  list: ListItem[]
  filterKey: string
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => {
  return (
    <Select
      aria-label={t`Select type`}
      items={list}
      loading={false}
      minWidth="200px"
      selectedKey={filterKey}
      onSelectionChange={(filterKey) => updatePath({ filterKey: filterKey as Filter })}
      onSelectionDelete={filterKey !== 'all' ? () => updatePath({ filterKey: Filter.all }) : undefined}
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

export default SelectFilter

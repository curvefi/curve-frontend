import type { SearchParams } from '@/components/PageMarketList/types'

import React from 'react'
import { Item } from 'react-stately'
import { t } from '@lingui/macro'

import { Filter } from '@/components/PageMarketList/utils'
import Select from '@/ui/Select'

type ListItem = { id: string; displayName: string }

const SelectFilter = ({
  list,
  filterKey,
  updatePath,
}: {
  list: ListItem[]
  filterKey: string
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => (
    <Select
      aria-label={t`Select type`}
      items={list}
      loading={false}
      minWidth="200px"
      selectedKey={filterKey}
      onSelectionChange={(filterKey) => updatePath({ filterKey: filterKey as Filter })}
      onSelectionDelete={filterKey !== 'all' ? () => updatePath({ filterKey: Filter.all }) : undefined}
    >
      {({ id, displayName }: ListItem) => (
          <Item key={id} textValue={id}>
            <strong>{displayName}</strong>
          </Item>
        )}
    </Select>
  )

export default SelectFilter

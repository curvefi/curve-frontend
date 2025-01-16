import type { PageMarketList, TableLabel } from '@/lend/components/PageMarketList/types'

import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'

import Box from '@/ui/Box'
import Checkbox from '@/ui/Checkbox'
import SelectFilter from '@/lend/components/PageMarketList/components/TableSettings/SelectFilter'
import SelectFilterType from '@/lend/components/PageMarketList/components/TableSettings/SelectFilterType'
import SelectFilterBorrowLend from '@/lend/components/PageMarketList/components/TableSettings/SelectFilterBorrowLend'
import SearchListInput from '@/ui/SearchInput/SearchListInput'

const TableSettings = ({
  filterList,
  filterTypeMapper,
  showBorrowSignerCell,
  showSupplySignerCell,
  searchParams,
  tableLabels,
  titleMapper,
  tableLabelsSelector,
  updatePath,
}: Pick<PageMarketList, 'filterList' | 'filterTypeMapper' | 'searchParams' | 'titleMapper' | 'updatePath'> & {
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  tableLabels: TableLabel[]
  tableLabelsSelector: { borrow: TableLabel[]; supply: TableLabel[] }
}) => {
  const { filterKey, hideSmallMarkets, searchText } = searchParams

  return (
    <>
      <SettingsWrapper>
        <Box gridArea="search" fillWidth>
          <SearchListInput
            placeholder={t`Search by tokens or address`}
            searchText={searchText}
            handleInputChange={(val) => updatePath({ searchText: val })}
            handleClose={() => updatePath({ searchText: '' })}
          />
        </Box>
        <FiltersWrapper gridArea="filters">
          <SelectFilterBorrowLend
            filterTypeMapper={filterTypeMapper}
            searchParams={searchParams}
            tableLabelsSelector={tableLabelsSelector}
            updatePath={updatePath}
          />
          <SelectFilter list={filterList} filterKey={filterKey} updatePath={updatePath} />
          <SelectFilterType
            searchParams={searchParams}
            showBorrowSignerCell={showBorrowSignerCell}
            showSupplySignerCell={showSupplySignerCell}
            tableLabels={tableLabels}
            titleMapper={titleMapper}
            updatePath={updatePath}
          />
        </FiltersWrapper>
        <FilterSmallWrapper grid gridArea="small-markets">
          <Checkbox
            isSelected={hideSmallMarkets}
            onChange={() => updatePath({ hideSmallMarkets: !hideSmallMarkets })}
          >{t`Hide very small markets`}</Checkbox>
        </FilterSmallWrapper>
      </SettingsWrapper>
    </>
  )
}

const SettingsWrapper = styled.div`
  display: grid;
  grid-row-gap: var(--spacing-narrow);
  grid-template-areas:
    'grid-search'
    'grid-filters'
    'grid-small-markets';
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-normal);

  @media (min-width: ${breakpoints.sm}rem) {
    grid-gap: var(--spacing-narrow);
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'grid-search grid-search grid-search'
      'grid-filters grid-filters grid-small-markets';
    justify-content: flex-start;
    padding: var(--spacing-normal);
    padding-bottom: var(--spacing-narrow);
  }

  @media (min-width: ${breakpoints.md}rem) {
    grid-template-columns: auto auto 1fr;
    grid-template-areas:
      'grid-search grid-search grid-search'
      'grid-filters grid-filters grid-small-markets';
  }
`

const FiltersWrapper = styled(Box)`
  align-content: flex-start;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  grid-column-gap: var(--spacing-narrow);
  grid-row-gap: var(--spacing-narrow);

  > * {
    height: var(--height-medium);
  }
`

const FilterSmallWrapper = styled(Box)`
  @media (min-width: ${breakpoints.sm}rem) {
    justify-content: flex-end;
  }
`

export default TableSettings

import type { PageMarketList, TableLabel } from '@/components/PageMarketList/types'

import React from 'react'
import { t } from '@lingui/macro'
import { useFocusRing } from '@react-aria/focus'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'

import Box from '@/ui/Box'
import Checkbox from '@/ui/Checkbox'
import SearchInput from '@/ui/SearchInput'
import SelectFilter from '@/components/PageMarketList/components/TableSettings/SelectFilter'
import SelectFilterType from '@/components/PageMarketList/components/TableSettings/SelectFilterType'
import SelectFilterBorrowLend from '@/components/PageMarketList/components/TableSettings/SelectFilterBorrowLend'

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
  const { isFocusVisible, focusProps } = useFocusRing()

  const { hideSmallMarkets, searchText } = searchParams

  return (
    <>
      <SettingsWrapper>
        <SearchWrapper gridArea="search" fillWidth>
          <StyledSearchInput
            id="inp-search-integrations"
            className={isFocusVisible ? 'focus-visible' : ''}
            {...focusProps}
            value={searchText}
            handleInputChange={(val) => updatePath({ searchText: val })}
            handleSearchClose={() => updatePath({ searchText: '' })}
          />
        </SearchWrapper>
        <FiltersWrapper grid gridArea="filters" flexJustifyContent="flex-start" gridAutoFlow="column">
          <SelectFilterBorrowLend
            filterTypeMapper={filterTypeMapper}
            searchParams={searchParams}
            tableLabelsSelector={tableLabelsSelector}
            updatePath={updatePath}
          />
        </FiltersWrapper>
        <FiltersWrapper grid gridArea="filters2" flexJustifyContent="flex-start" gridAutoFlow="column">
          <SelectFilter list={filterList} filterKey={searchParams.filterKey} updatePath={updatePath} />
          <SelectFilterType
            searchParams={searchParams}
            showBorrowSignerCell={showBorrowSignerCell}
            showSupplySignerCell={showSupplySignerCell}
            tableLabels={tableLabels}
            titleMapper={titleMapper}
            updatePath={updatePath}
          />
        </FiltersWrapper>
        <FilterSmallWrapper grid gridArea="hide">
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
    'grid-filters2'
    'grid-hide';
  padding-bottom: 0;

  @media (min-width: ${breakpoints.sm}rem) {
    grid-gap: var(--spacing-narrow);
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'grid-filters grid-search grid-hide'
      'grid-filters2 grid-filters2 grid-filters2';
    justify-content: flex-start;
    padding: 0 var(--spacing-normal);
    padding-top: var(--spacing-wide);
  }

  @media (min-width: ${breakpoints.md}rem) {
    grid-template-columns: auto auto 1fr auto;
    grid-template-areas: 'grid-filters grid-filters2 grid-search grid-hide';
  }
`

const SearchWrapper = styled(Box)`
  padding: var(--spacing-normal) var(--spacing-narrow) 0 var(--spacing-narrow);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: 0;
  }
`

const FiltersWrapper = styled(Box)`
  padding-left: var(--spacing-narrow);
  grid-gap: var(--spacing-narrow);
  overflow-x: scroll;

  @media (min-width: ${breakpoints.sm}rem) {
    padding: 0;
    grid-gap: var(--spacing-narrow);
    overflow: initial;
  }
`

const FilterSmallWrapper = styled(Box)`
  padding: 0 var(--spacing-narrow);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: 0;
  }
`

const StyledSearchInput = styled(SearchInput)`
  min-height: var(--height-large);

  button {
    min-height: 100%;
  }

  @media (min-width: ${breakpoints.sm}rem) {
    min-height: 100%;
  }
`

export default TableSettings

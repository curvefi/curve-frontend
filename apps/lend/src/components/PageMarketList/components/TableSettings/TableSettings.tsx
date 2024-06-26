import type { FilterTypeKey, PageMarketList } from '@/components/PageMarketList/types'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import { useFocusRing } from '@react-aria/focus'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import networks from '@/networks'

import Box from '@/ui/Box'
import Checkbox from '@/ui/Checkbox'
import SearchInput from '@/ui/SearchInput'
import SelectFilter from '@/components/PageMarketList/components/TableSettings/SelectFilter'
import TableButtonFilters from '@/ui/TableButtonFilters'

const TableSettings = ({
  rChainId,
  filterMapper,
  filterTypeMapper,
  searchParams,
  updatePath,
}: Pick<PageMarketList, 'rChainId' | 'api' | 'searchParams' | 'filterMapper' | 'filterTypeMapper' | 'updatePath'>) => {
  const { isFocusVisible, focusProps } = useFocusRing()

  const filterList = useMemo(() => {
    return networks[rChainId].marketListFilter.map((key) => filterMapper[key])
  }, [filterMapper, rChainId])

  return (
    <>
      <SettingsWrapper>
        <SearchWrapper gridArea="search" fillWidth>
          <StyledSearchInput
            id="inp-search-integrations"
            className={isFocusVisible ? 'focus-visible' : ''}
            {...focusProps}
            value={searchParams.searchText}
            handleInputChange={(val) => updatePath({ searchText: val })}
            handleSearchClose={() => updatePath({ searchText: '' })}
          />
        </SearchWrapper>
        <FiltersWrapper grid gridArea="filters" flexJustifyContent="flex-start" gridAutoFlow="column">
          <StyledTableButtonFilters
            disabled={false}
            filters={filterTypeMapper}
            filterKey={searchParams.filterTypeKey}
            updateRouteFilterKey={(filterTypeKey: FilterTypeKey) => updatePath({ filterTypeKey })}
          />
          {/* TODO: add sort by */}
          <SelectFilter list={filterList} filterKey={searchParams.filterKey} updatePath={updatePath} />
        </FiltersWrapper>
        <FilterSmallWrapper grid gridArea="hide">
          <Checkbox
            isSelected={searchParams.hideSmallMarkets}
            onChange={() => updatePath({ hideSmallMarkets: !searchParams.hideSmallMarkets })}
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
    'grid-hide';
  padding-bottom: 0;

  @media (min-width: ${breakpoints.sm}rem) {
    grid-gap: var(--spacing-narrow);
    grid-template-columns: auto 1fr;
    grid-template-areas: 'grid-filters grid-search grid-hide';
    justify-content: flex-start;
    padding: 0 var(--spacing-normal);
    padding-top: var(--spacing-wide);
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

const StyledTableButtonFilters = styled(TableButtonFilters)`
  align-items: flex-start;
  flex-wrap: nowrap;

  button {
    margin-right: 0;
    margin-bottom: 0;
    min-height: var(--height-medium);
  }
`

export default TableSettings

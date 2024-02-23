import type { BorrowKey, FilterTypeKey, PageMarketList } from '@/components/PageMarketList/types'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import { useFocusRing } from '@react-aria/focus'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { LongShortButton } from '@/components/PageMarketList/components/MarketListItemHeader'
import Box from '@/ui/Box'
import SearchInput from '@/ui/SearchInput'
import SelectFilter from '@/components/PageMarketList/components/TableSettings/SelectFilter'
import TableButtonFilters from '@/ui/TableButtonFilters'

const TableSettings = ({
  rChainId,
  api,
  filterMapper,
  filterTypeMapper,
  searchParams,
  updatePath,
}: Pick<PageMarketList, 'rChainId' | 'api' | 'searchParams' | 'filterMapper' | 'filterTypeMapper' | 'updatePath'>) => {
  const { isFocusVisible, focusProps } = useFocusRing()

  const tableRowsSettings = useStore((state) => state.marketList.tableRowsSettings)

  const { signerAddress } = api ?? {}

  const TABS: { key: BorrowKey; label: string }[] = [
    { key: 'long', label: t`Long` },
    { key: 'short', label: t`Short` },
  ]

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
          {signerAddress && (
            <SelectFilter list={filterList} filterKey={searchParams.filterKey} updatePath={updatePath} />
          )}
        </FiltersWrapper>
        <FiltersWrapper grid gridArea="long-short" flexJustifyContent="flex-start" gridAutoFlow="column">
          <div>
            {TABS.map(({ key, label }, idx) => {
              const isActive =
                searchParams.borrowKey === key &&
                Object.values(tableRowsSettings).every((v) => {
                  const isUndefined = typeof v?.borrowKey === 'undefined'
                  return isUndefined || (!isUndefined && v.borrowKey === key)
                })

              return (
                <React.Fragment key={key}>
                  <LongShortButton
                    variant="text"
                    className={isActive ? 'active' : ''}
                    onClick={() => updatePath({ borrowKey: key })}
                  >
                    {label}
                  </LongShortButton>
                  {idx !== TABS.length - 1 ? '|' : ''}
                </React.Fragment>
              )
            })}
          </div>
        </FiltersWrapper>
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
    'grid-long-short';
  padding-bottom: 0;

  @media (min-width: ${breakpoints.sm}rem) {
    grid-gap: var(--spacing-narrow);
    grid-template-columns: auto 1fr;
    grid-template-areas:
      'grid-filters grid-search'
      'grid-long-short grid-long-short';
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

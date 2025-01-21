import type { FilterKey, PoolListFilter, PoolListTableLabel, SearchParams } from '@main/components/PagePoolList/types'
import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'
import { breakpoints } from '@ui/utils'
import useStore from '@main/store/useStore'
import Box from '@ui/Box'
import SearchListInput from '@ui/SearchInput/SearchListInput'
import TableButtonFilters from '@ui/TableButtonFilters'
import TableButtonFiltersMobile from '@ui/TableButtonFiltersMobile'
import TableSortSelect from 'ui/src/TableSort/TableSortSelect'
import TableSortSelectMobile from 'ui/src/TableSort/TableSortSelectMobile'
import TableCheckboxHideSmallPools from '@main/components/PagePoolList/components/TableSettings/TableCheckboxHideSmallPools'
import { ChainId, PoolData } from '@main/types/main.types'

type Props = {
  isReady: boolean
  activeKey: string
  rChainId: ChainId
  isLite: boolean
  poolDatasCachedOrApi: PoolData[]
  result: string[] | undefined
  signerAddress: string
  searchParams: SearchParams
  tableLabels: PoolListTableLabel
  updatePath(updatedSearchParams: Partial<SearchParams>): void
}

const TableSettings = ({
  isReady,
  activeKey,
  rChainId,
  isLite,
  poolDatasCachedOrApi,
  result,
  signerAddress,
  searchParams,
  tableLabels,
  updatePath,
}: Props) => {
  const formStatus = useStore((state) => state.poolList.formStatus[activeKey])
  const isLgUp = useStore((state) => state.isLgUp)
  const { poolFilters } = useStore((state) => state.networks.networks[rChainId])

  const FILTERS: PoolListFilter[] = useMemo(
    () => [
      { key: 'all', label: t`All` },
      { key: 'usd', label: 'USD' },
      { key: 'btc', label: 'BTC' },
      { key: 'kava', label: 'KAVA' },
      { key: 'eth', label: 'ETH' },
      { key: 'crvusd', label: t`crvUSD` },
      { key: 'tricrypto', label: t`Tricrypto` },
      { key: 'crypto', label: t`Crypto` },
      { key: 'stableng', label: t`Stable NG` },
      { key: 'cross-chain', label: t`Cross-chain` },
      { key: 'user', label: t`My Pools` },
    ],
    [],
  )

  const parsedFilters = useMemo(() => {
    let filters = FILTERS.filter((f) => poolFilters.indexOf(f.key) !== -1)

    if (!signerAddress) {
      filters = filters.filter((f) => f.key !== 'user')
    }

    if (Array.isArray(filters)) {
      const parsedFilters: { [key: string]: { id: string; displayName: string } } = {}
      for (const { key, label } of filters) {
        parsedFilters[key] = { id: key, displayName: label }
      }

      return parsedFilters
    }
  }, [FILTERS, signerAddress, poolFilters])

  return (
    <Wrapper>
      <div>
        <SearchListInput
          placeholder={t`Search by tokens or address`}
          searchText={searchParams.searchText}
          handleInputChange={(val) => updatePath({ searchText: val })}
          handleClose={() => updatePath({ searchText: '' })}
        />
      </div>

      <FiltersWrapper $isLite={isLite}>
        {isLgUp && !isLite ? (
          <>
            <TableButtonFilters
              disabled={false}
              filters={parsedFilters}
              filterKey={searchParams.filterKey}
              isLoading={!isReady || formStatus?.isLoading}
              resultsLength={result?.length}
              updateRouteFilterKey={(filterKey) => updatePath({ filterKey: filterKey as FilterKey })}
            />
            <Box flex gridGap={2}>
              <TableSortSelect searchParams={searchParams} labelsMapper={tableLabels} updatePath={updatePath} />
              <TableCheckboxHideSmallPools
                searchParams={searchParams}
                poolDatasCachedOrApi={poolDatasCachedOrApi}
                updatePath={updatePath}
              />
            </Box>
          </>
        ) : (
          <>
            <TableButtonFiltersMobile
              filters={parsedFilters}
              filterKey={searchParams.filterKey}
              updateRouteFilterKey={(filterKey) => updatePath({ filterKey: filterKey as FilterKey })}
            />
            <TableSortSelectMobile searchParams={searchParams} labelsMapper={tableLabels} updatePath={updatePath} />
            <TableCheckboxHideSmallPools
              searchParams={searchParams}
              poolDatasCachedOrApi={poolDatasCachedOrApi}
              updatePath={updatePath}
            />
          </>
        )}
      </FiltersWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  grid-gap: var(--spacing-narrow);
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-normal);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: var(--spacing-normal);
    padding-bottom: var(--spacing-narrow);
  }
`

const FiltersWrapper = styled(Box)<{ $isLite: boolean }>`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  grid-gap: var(--spacing-narrow);

  @media (min-width: ${breakpoints.sm}rem) {
    display: grid;
    grid-template-columns: auto 1fr auto;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    grid-template-columns: ${({ $isLite }) => ($isLite ? 'auto 1fr auto' : '1fr auto auto')};
  }
`

export default TableSettings

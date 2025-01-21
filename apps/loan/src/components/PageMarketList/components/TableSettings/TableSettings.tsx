import type { PageCollateralList, TableLabel } from '@loan/components/PageMarketList/types'

import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils'
import useStore from '@loan/store/useStore'

import SelectFilterType from '@loan/components/PageMarketList/components/TableSettings/SelectFilterType'
import SearchListInput from '@ui/SearchInput/SearchListInput'

const TableSettings = ({
  someLoanExists,
  tableLabels,
  titleMapper,
  updatePath,
}: Pick<PageCollateralList, 'titleMapper' | 'updatePath'> & {
  someLoanExists: boolean
  tableLabels: TableLabel[]
}) => {
  const searchParams = useStore((state) => state.collateralList.searchParams)

  const { searchText } = searchParams

  return (
    <SettingsWrapper>
      <SearchListInput
        placeholder={t`Search by tokens or address`}
        searchText={searchText}
        handleInputChange={(val) => updatePath({ searchText: val })}
        handleClose={() => updatePath({ searchText: '' })}
      />
      <SelectFilterType
        searchParams={searchParams}
        someLoanExists={someLoanExists}
        tableLabels={tableLabels}
        titleMapper={titleMapper}
        updatePath={updatePath}
      />
    </SettingsWrapper>
  )
}

const SettingsWrapper = styled.div`
  display: grid;
  grid-row-gap: var(--spacing-narrow);
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-normal);

  @media (min-width: ${breakpoints.sm}rem) {
    grid-gap: var(--spacing-normal);
    grid-template-columns: 1fr auto;
    padding: var(--spacing-normal);
    padding-bottom: var(--spacing-narrow);
  }
`

export default TableSettings

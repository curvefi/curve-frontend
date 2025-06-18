import styled from 'styled-components'
import SelectFilterType from '@/loan/components/PageMarketList/components/TableSettings/SelectFilterType'
import type { PageCollateralList, TableLabel } from '@/loan/components/PageMarketList/types'
import SearchListInput from '@ui/SearchInput/SearchListInput'
import { breakpoints } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

const TableSettings = ({
  someLoanExists,
  tableLabels,
  titleMapper,
  onSearch,
  searchParams,
}: Pick<PageCollateralList, 'titleMapper' | 'onSearch' | 'searchParams'> & {
  someLoanExists: boolean
  tableLabels: TableLabel[]
}) => (
  <SettingsWrapper>
    <SearchListInput
      placeholder={t`Search by tokens or address`}
      searchText={searchParams.searchText}
      handleInputChange={(val) => onSearch({ searchText: val })}
      handleClose={() => onSearch({ searchText: '' })}
    />
    <SelectFilterType
      searchParams={searchParams}
      someLoanExists={someLoanExists}
      tableLabels={tableLabels}
      titleMapper={titleMapper}
      updatePath={onSearch}
    />
  </SettingsWrapper>
)

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

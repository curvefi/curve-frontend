import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Icon from '@/ui/Icon'
import Button from '@/ui/Button'

const TableHeader: React.FC = () => {
  const { allHoldersSortBy, setAllHoldersSortBy } = useStore((state) => state.vecrv)

  return (
    <TableHeaderWrapper>
      <TableContainer>
        <TableTitle>{t`Rank`}</TableTitle>
        <TableTitle>{t`Holder`}</TableTitle>
        <TableTitleButton variant="text" onClick={() => setAllHoldersSortBy('weight')}>
          {t`veCRV`}
          {allHoldersSortBy.sortBy === 'weight' && (
            <StyledIcon size={16} name={allHoldersSortBy.order === 'asc' ? 'ArrowUp' : 'ArrowDown'} />
          )}
        </TableTitleButton>
        <TableTitleButton variant="text" onClick={() => setAllHoldersSortBy('locked')}>
          {t`CRV Locked`}
          {allHoldersSortBy.sortBy === 'locked' && (
            <StyledIcon size={16} name={allHoldersSortBy.order === 'asc' ? 'ArrowUp' : 'ArrowDown'} />
          )}
        </TableTitleButton>
        <TableTitleButton variant="text" onClick={() => setAllHoldersSortBy('weight_ratio')}>
          {t`% veCRV`}
          {allHoldersSortBy.sortBy === 'weight_ratio' && (
            <StyledIcon size={16} name={allHoldersSortBy.order === 'asc' ? 'ArrowUp' : 'ArrowDown'} />
          )}
        </TableTitleButton>
        <TableTitleButton variant="text" onClick={() => setAllHoldersSortBy('unlock_time')}>
          {t`Unlock Time`}
          {allHoldersSortBy.sortBy === 'unlock_time' && (
            <StyledIcon size={16} name={allHoldersSortBy.order === 'asc' ? 'ArrowUp' : 'ArrowDown'} />
          )}
        </TableTitleButton>
      </TableContainer>
    </TableHeaderWrapper>
  )
}

const TableHeaderWrapper = styled.div`
  padding: var(--spacing-3) var(--spacing-4) 0;
  background: var(--box_header--secondary--background-color);
`

const TableContainer = styled.div`
  display: grid;
  justify-content: space-between;
  grid-template-columns: 0.4fr 1fr 1fr 1fr 1fr 1fr;
  padding: var(--spacing-2) 0;
`

const TableTitle = styled.p`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  display: flex;
  align-items: center;
`

const TableTitleButton = styled(Button)`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  display: flex;
  align-items: center;
  font-family: var(--font);
  margin-right: auto;
  text-transform: none;
  color: var(--page-text-color);
`

const StyledIcon = styled(Icon)`
  margin-left: var(--spacing-1);
`

export default TableHeader

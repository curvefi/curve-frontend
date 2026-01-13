import { styled } from 'styled-components'
import { ProposalListFilter, ProposalListFilterItem } from '@/dao/types/dao.types'
import { Button } from '@ui/Button'
import { Spinner } from '@ui/Spinner'

type Props = {
  className?: string
  filters: ProposalListFilterItem[]
  activeFilter: ProposalListFilter
  listLength: number
  proposalsLoading: boolean
  setActiveFilter: (filter: ProposalListFilter) => void
}

export const ProposalsFilters = ({
  filters,
  activeFilter,
  listLength,
  setActiveFilter,
  className,
  proposalsLoading,
}: Props) => (
  <Container className={className}>
    {filters.map((filter: ProposalListFilterItem) => (
      <Filter
        onClick={() => setActiveFilter(filter.key)}
        className={activeFilter === filter.key ? 'active' : ''}
        variant="select"
        key={filter.key}
      >
        {filter.label}
        {proposalsLoading && activeFilter === filter.key ? (
          <Spinner size={12} />
        ) : activeFilter === filter.key ? (
          ` ${listLength}`
        ) : (
          ''
        )}
      </Filter>
    ))}
  </Container>
)

const Container = styled.div`
  display: flex;
  flex-direction: row;
  column-gap: var(--spacing-2);
`

const Filter = styled(Button)`
  display: flex;
  font-size: var(--font-size-2);
  align-items: center;
  gap: var(--spacing-1);
`

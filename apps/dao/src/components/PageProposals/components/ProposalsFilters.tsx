import type { ProposalListFilterItems } from '../types'

import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'

type Props = {
  filters: ProposalListFilterItems
  activeFilter: ProposalListFilterItems[string]['id']
  listLength: number
  setActiveFilter: (filter: ProposalListFilterItems[string]['id']) => void
}

const ProposalsFilters = ({ filters, activeFilter, listLength, setActiveFilter }: Props) => {
  const { filteringProposalsLoading } = useStore((state) => state.proposals)

  return (
    <Container>
      {Object.values(filters).map((filter) => (
        <Filter
          onClick={() => setActiveFilter(filter.id)}
          className={activeFilter === filter.id ? 'active' : ''}
          variant="select"
          key={filter.displayName}
        >
          {filter.displayName}
          {filteringProposalsLoading && activeFilter === filter.id ? (
            <Spinner size={12} />
          ) : activeFilter === filter.id ? (
            ` ${listLength}`
          ) : (
            ''
          )}
        </Filter>
      ))}
    </Container>
  )
}

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

export default ProposalsFilters

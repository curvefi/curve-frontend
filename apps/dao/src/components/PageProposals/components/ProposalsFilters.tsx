import type { ProposalListFilterItem } from '../types'

import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'

type Props = {
  filters: ProposalListFilterItem[]
  activeFilter: ProposalListFilterItem['key']
  listLength: number
  setActiveFilter: (filter: ProposalListFilterItem['key']) => void
}

const ProposalsFilters = ({ filters, activeFilter, listLength, setActiveFilter }: Props) => {
  const { filteringProposalsLoading } = useStore((state) => state.proposals)

  return (
    <Container>
      {filters.map((filter) => (
        <Filter
          onClick={() => setActiveFilter(filter.key)}
          className={activeFilter === filter.key ? 'active' : ''}
          variant="select"
          key={filter.label}
        >
          {filter.label}
          {filteringProposalsLoading && activeFilter === filter.key ? (
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

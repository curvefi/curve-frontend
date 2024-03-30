import type { ProposalListFilterItem } from '../types'

import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Button from '@/ui/Button'

type Props = {
  filters: ProposalListFilterItem[]
  activeFilter: ProposalListFilterItem['key']
  setActiveFilter: (filter: ProposalListFilterItem['key']) => void
}

const ProposalsFilters = ({ filters, activeFilter, setActiveFilter }: Props) => {
  return (
    <Container>
      {filters.map((filter) => (
        <Filter
          onClick={() => setActiveFilter(filter.key)}
          className={activeFilter === filter.key ? 'active' : ''}
          variant="select"
        >
          {filter.label}
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
  font-size: var(--font-size-2);
`

export default ProposalsFilters

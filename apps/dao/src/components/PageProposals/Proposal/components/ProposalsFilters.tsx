import type { ProposalListFilter } from '../../types'

import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Button from '@/ui/Button'

type Props = {
  filters: ProposalListFilter[]
}

const ProposalsFilters = ({ filters }: Props) => {
  return (
    <Container>
      {filters.map((filter) => (
        <Filter variant="select">{filter.label}</Filter>
      ))}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  column-gap: var(--spacing-2);
`

const Filter = styled(Button)``

export default ProposalsFilters

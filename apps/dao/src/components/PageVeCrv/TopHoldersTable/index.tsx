import styled from 'styled-components'

import useStore from '@/store/useStore'

import TableHeader from './TableHeader'
import TableRow from './TableRow'
import Box from '@/ui/Box'

const TopHoldersTable: React.FC = () => {
  const { veCrvHolders, allHoldersSortBy } = useStore((state) => state.vecrv)

  return (
    <Wrapper variant="secondary">
      <TableHeader />
      <TableBody>
        {veCrvHolders.allHolders.map((holder) => (
          <TableRow key={holder.user} holder={holder} sortBy={allHoldersSortBy.sortBy} />
        ))}
      </TableBody>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  max-height: 40.625rem;
  padding-bottom: var(--spacing-3);
`

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-4) var(--spacing-3);
  overflow-y: auto;
`

export default TopHoldersTable
